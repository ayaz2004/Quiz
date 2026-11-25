import prisma from "../config/db.config.js";
import { computeReviewState } from "../utils/review.js";
import { computeStreak, istDateString } from "../utils/istDate.js";

export const DEFAULT_DAILY_GOAL = 15;

/**
 * Stores answers that are already validated and scored by the server, then
 * updates the derived DailyActivity and ReviewItem rows.
 *
 * Each row: { clientId, questionId, selectedOption, isCorrect, timeTakenMs, answeredAt: Date, source }.
 * Idempotent on (userId, clientId): a repeated clientId counts as a duplicate.
 */
export const recordResponses = async (userId, rows) => {
  const seen = new Set();
  const unique = [];
  let duplicates = 0;
  for (const row of rows) {
    if (seen.has(row.clientId)) {
      duplicates += 1;
    } else {
      seen.add(row.clientId);
      unique.push(row);
    }
  }
  if (unique.length === 0) return { accepted: 0, duplicates };

  const existing = await prisma.questionResponse.findMany({
    where: { userId, clientId: { in: unique.map((r) => r.clientId) } },
    select: { clientId: true },
  });
  const existingIds = new Set(existing.map((r) => r.clientId));
  const fresh = unique.filter((r) => !existingIds.has(r.clientId));
  duplicates += unique.length - fresh.length;
  if (fresh.length === 0) return { accepted: 0, duplicates };

  // skipDuplicates covers a concurrent upload of the same rows
  const { count } = await prisma.questionResponse.createMany({
    data: fresh.map((r) => ({
      userId,
      questionId: r.questionId,
      selectedOption: r.selectedOption,
      isCorrect: r.isCorrect,
      timeTakenMs: r.timeTakenMs,
      source: r.source,
      clientId: r.clientId,
      answeredAt: r.answeredAt,
    })),
    skipDuplicates: true,
  });
  duplicates += fresh.length - count;
  if (count === 0) return { accepted: 0, duplicates };

  await addDailyActivity(userId, fresh);
  await refreshReviewItems(userId, [...new Set(fresh.map((r) => r.questionId))]);

  return { accepted: count, duplicates };
};

const addDailyActivity = async (userId, rows) => {
  const byDay = new Map();
  for (const r of rows) {
    const day = istDateString(r.answeredAt);
    const entry = byDay.get(day) || { day, answered: 0, correct: 0 };
    entry.answered += 1;
    if (r.isCorrect) entry.correct += 1;
    byDay.set(day, entry);
  }

  await prisma.$executeRaw`
    INSERT INTO daily_activities (user_id, date, questions_answered, correct_count)
    SELECT ${userId}, x.day::date, x.answered, x.correct
    FROM jsonb_to_recordset(${JSON.stringify([...byDay.values()])}::jsonb)
      AS x(day text, answered int, correct int)
    ON CONFLICT (user_id, date) DO UPDATE SET
      questions_answered = daily_activities.questions_answered + EXCLUDED.questions_answered,
      correct_count = daily_activities.correct_count + EXCLUDED.correct_count`;
};

/** Recomputes review state for these questions from their full answer history. */
export const refreshReviewItems = async (userId, questionIds) => {
  if (questionIds.length === 0) return;

  const history = await prisma.questionResponse.findMany({
    where: { userId, questionId: { in: questionIds } },
    select: { questionId: true, isCorrect: true, answeredAt: true },
  });
  const byQuestion = new Map(questionIds.map((id) => [id, []]));
  for (const r of history) byQuestion.get(r.questionId)?.push(r);

  const states = [];
  const cleared = [];
  for (const [questionId, responses] of byQuestion) {
    const state = computeReviewState(responses);
    if (state) {
      states.push({
        question_id: questionId,
        box: state.box,
        due_at: state.dueAt.toISOString(),
        last_answered_at: state.lastAnsweredAt.toISOString(),
        wrong_count: state.wrongCount,
        graduated: state.graduated,
      });
    } else {
      cleared.push(questionId);
    }
  }

  if (cleared.length > 0) {
    await prisma.reviewItem.deleteMany({ where: { userId, questionId: { in: cleared } } });
  }
  if (states.length > 0) {
    // Timestamps are UTC ISO strings; casting to timestamp keeps the UTC wall time Prisma stores.
    await prisma.$executeRaw`
      INSERT INTO review_items (user_id, question_id, box, due_at, last_answered_at, wrong_count, graduated, updated_at)
      SELECT ${userId}, x.question_id, x.box, x.due_at, x.last_answered_at, x.wrong_count, x.graduated, NOW()
      FROM jsonb_to_recordset(${JSON.stringify(states)}::jsonb)
        AS x(question_id int, box int, due_at timestamp, last_answered_at timestamp, wrong_count int, graduated boolean)
      ON CONFLICT (user_id, question_id) DO UPDATE SET
        box = EXCLUDED.box,
        due_at = EXCLUDED.due_at,
        last_answered_at = EXCLUDED.last_answered_at,
        wrong_count = EXCLUDED.wrong_count,
        graduated = EXCLUDED.graduated,
        updated_at = NOW()`;
  }
};

export const getStreak = async (userId, now = new Date()) => {
  const [days, profile] = await Promise.all([
    prisma.dailyActivity.findMany({
      where: { userId },
      select: { date: true, questionsAnswered: true },
    }),
    prisma.studyProfile.findUnique({ where: { userId }, select: { dailyGoal: true } }),
  ]);

  const today = istDateString(now);
  const dateStrings = days.map((d) => d.date.toISOString().slice(0, 10));
  const { current, longest } = computeStreak(dateStrings, today);
  const todayRow = days.find((d) => d.date.toISOString().slice(0, 10) === today);

  return {
    current,
    longest,
    todayCount: todayRow?.questionsAnswered ?? 0,
    dailyGoal: profile?.dailyGoal ?? DEFAULT_DAILY_GOAL,
  };
};
