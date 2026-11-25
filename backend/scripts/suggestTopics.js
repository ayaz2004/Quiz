// Suggests a topic and difficulty for questions that have no approved topic.
// Writes only Question.suggestedTopicId / suggestionConfidence (and difficulty
// when empty); an admin approves suggestions in the admin panel.
//
// Usage (dry run is the default and writes nothing):
//   node --env-file=.env scripts/suggestTopics.js [--subject=MCA] [--quizId=12] [--limit=500] [--overwrite]
//   node --env-file=.env scripts/suggestTopics.js --apply --yes
// --yes is required with --apply when the database host is not localhost.
import { pathToFileURL } from 'node:url';
import { FAMILY_BOOSTS, TAXONOMY } from './topicTaxonomy.js';

const MIN_SCORE = 3;
const UPDATE_CHUNK = 1000;

/**
 * Difficulty heuristic: long stems, many numbers and multi-step wording make a
 * question harder. 0-1 points = easy, 2-3 = medium, 4+ = hard.
 */
export const estimateDifficulty = ({ questionText = '', options = [] }) => {
  const stem = String(questionText);
  const all = [stem, ...options].join(' ');
  let points = 0;
  if (stem.length > 300) points += 2;
  else if (stem.length > 150) points += 1;
  if ((all.match(/\d+(\.\d+)?/g) || []).length >= 6) points += 1;
  const cues = [
    /\bnot\b|\bexcept\b/i,
    /\brespectively\b/i,
    /\bassertion\b|\breason\b/i,
    /\bstatements?\b.*\bcorrect\b/i,
    /\bif\b.*\bthen\b/i,
    /\bmatch\b.*\b(list|column)\b/i,
  ];
  points += cues.filter((re) => re.test(stem)).length;
  if (points >= 4) return 'hard';
  if (points >= 2) return 'medium';
  return 'easy';
};

const boostsFor = (context) => {
  const boosts = {};
  for (const { re, families } of FAMILY_BOOSTS) {
    if (re.test(context)) {
      for (const [family, factor] of Object.entries(families)) {
        boosts[family] = Math.max(boosts[family] ?? 1, factor);
      }
    }
  }
  return boosts;
};

/**
 * Pure classifier. Returns { subject, name, confidence, difficulty } or null
 * when no topic scores above the threshold.
 */
export const suggestForQuestion = ({ questionText = '', options = [], explanation = '', quizSubject = '', quizTitle = '' }) => {
  const text = [questionText, ...options, explanation].filter(Boolean).join('\n');
  const boosts = boostsFor(`${quizSubject} ${quizTitle}`);

  const scored = [];
  for (const [family, topics] of Object.entries(TAXONOMY)) {
    for (const [name, patterns] of Object.entries(topics)) {
      let score = 0;
      for (const { re, weight } of patterns) {
        if (re.test(text)) score += weight;
      }
      if (score > 0) scored.push({ subject: family, name, score: score * (boosts[family] ?? 1) });
    }
  }
  scored.sort((a, b) => b.score - a.score);

  const [best, second] = scored;
  if (!best || best.score < MIN_SCORE) return null;

  // Confidence grows with a clear lead over the runner-up and with a strong absolute score.
  const margin = (best.score - (second?.score ?? 0)) / best.score;
  const strength = Math.min(best.score, 9) / 9;
  const confidence = Math.round((0.6 * margin + 0.4 * strength) * 100) / 100;

  return {
    subject: best.subject,
    name: best.name,
    confidence,
    difficulty: estimateDifficulty({ questionText, options }),
  };
};

/**
 * Classifies matching questions and, with apply, stores the suggestions.
 * Returns { scanned, suggested, unmatched, byTopic: Map<"subject / name", count>, samples }.
 */
export const runSuggestTopics = async (prisma, { apply = false, subject, quizId, limit, overwrite = false } = {}) => {
  const where = { topicId: null };
  if (!overwrite) where.suggestedTopicId = null;
  const quizWhere = {};
  if (subject) quizWhere.subject = { equals: subject, mode: 'insensitive' };
  if (quizId) quizWhere.id = quizId;
  if (Object.keys(quizWhere).length > 0) where.quiz = quizWhere;

  const questions = await prisma.question.findMany({
    where,
    include: { quiz: { select: { subject: true, title: true } } },
    orderBy: { id: 'asc' },
    ...(limit ? { take: limit } : {}),
  });

  const suggestions = [];
  const byTopic = new Map();
  for (const q of questions) {
    const s = suggestForQuestion({
      questionText: q.questionText,
      options: [q.option1, q.option2, q.option3, q.option4],
      explanation: q.explanation,
      quizSubject: q.quiz.subject,
      quizTitle: q.quiz.title,
    });
    if (!s) continue;
    suggestions.push({ question: q, ...s });
    const key = `${s.subject} / ${s.name}`;
    byTopic.set(key, (byTopic.get(key) ?? 0) + 1);
  }

  if (apply && suggestions.length > 0) {
    const topicIds = new Map();
    for (const key of byTopic.keys()) {
      const [topicSubject, name] = key.split(' / ');
      const topic = await prisma.topic.upsert({
        where: { subject_name: { subject: topicSubject, name } },
        create: { subject: topicSubject, name },
        update: {},
      });
      topicIds.set(key, topic.id);
    }

    for (let i = 0; i < suggestions.length; i += UPDATE_CHUNK) {
      const rows = suggestions.slice(i, i + UPDATE_CHUNK).map((s) => ({
        id: s.question.id,
        topic_id: topicIds.get(`${s.subject} / ${s.name}`),
        confidence: s.confidence,
        difficulty: s.difficulty,
      }));
      // topic_id IS NULL guards against an admin approving while this runs
      await prisma.$executeRaw`
        UPDATE "Question" AS q SET
          suggested_topic_id = x.topic_id,
          suggestion_confidence = x.confidence,
          difficulty = COALESCE(q.difficulty, x.difficulty)
        FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
          AS x(id int, topic_id int, confidence float8, difficulty text)
        WHERE q.question_id = x.id AND q.topic_id IS NULL`;
    }
  }

  return {
    scanned: questions.length,
    suggested: suggestions.length,
    unmatched: questions.length - suggestions.length,
    byTopic,
    samples: suggestions.slice(0, 10).map((s) => ({
      questionId: s.question.id,
      quiz: s.question.quiz.title,
      text: s.question.questionText.replace(/\s+/g, ' ').slice(0, 80),
      topic: `${s.subject} / ${s.name}`,
      confidence: s.confidence,
      difficulty: s.difficulty,
    })),
  };
};

const parseArgs = (argv) => {
  const args = {};
  for (const arg of argv) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value ?? true;
  }
  return args;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set. Example: node --env-file=.env scripts/suggestTopics.js');
    process.exit(1);
  }

  const host = new URL(url).hostname;
  const isLocal = ['127.0.0.1', 'localhost', '::1'].includes(host);
  console.log(`Database host: ${host}`);
  if (args.apply && !isLocal && !args.yes) {
    console.error('Refusing to write to a non-local database without --yes.');
    process.exit(1);
  }

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const result = await runSuggestTopics(prisma, {
      apply: Boolean(args.apply),
      subject: typeof args.subject === 'string' ? args.subject : undefined,
      quizId: args.quizId ? parseInt(args.quizId, 10) : undefined,
      limit: args.limit ? parseInt(args.limit, 10) : undefined,
      overwrite: Boolean(args.overwrite),
    });

    console.log(`\nScanned ${result.scanned}, suggested ${result.suggested}, no confident match ${result.unmatched}\n`);
    console.table([...result.byTopic.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([topic, questions]) => ({ topic, questions })));
    console.log('Samples:');
    console.table(result.samples);
    console.log(args.apply ? 'Suggestions written. Review them in the admin panel.' : 'Dry run: nothing was written. Add --apply to save.');
  } finally {
    await prisma.$disconnect();
  }
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
