import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { loadCourses } from "../services/practiceQuestions.js";
import { getStreak } from "../services/responseRecorder.js";
import { toStudyProfile } from "./studyProfile.controller.js";

const WEAK_TOPIC_MIN_ATTEMPTS = 5;
const WEAK_TOPIC_LIMIT = 5;
const ATTEMPTS_FOR_CURRENT_LEVEL = 3;

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * How far the student's recent mock scores are from the latest known cutoff
 * of their target course, in marks. A positive gap means below the cutoff.
 */
const computeCutoffGap = async (userId, profile, courses) => {
  const course = profile?.targetCourseKey ? courses.get(profile.targetCourseKey) : null;
  if (!course) return null;

  const category = profile.category || "general";
  const quizIds = course.quizzes.map((q) => q.id);
  const quizById = new Map(course.quizzes.map((q) => [q.id, q]));

  const cutoffRows = await prisma.quizCutoff.findMany({
    where: { quizId: { in: quizIds }, [category]: { not: null } },
    orderBy: { year: "desc" },
  });
  const best = cutoffRows
    .sort((a, b) => b.year - a.year || quizById.get(b.quizId).examYear - quizById.get(a.quizId).examYear)[0];

  const cutoff = best ? {
    year: best.year,
    value: best[category],
    quizId: best.quizId,
    totalMarks: quizById.get(best.quizId)._count.questions,
  } : null;

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, quizId: { in: quizIds } },
    select: { percentage: true },
    orderBy: { attemptedAt: "desc" },
    take: ATTEMPTS_FOR_CURRENT_LEVEL,
  });

  let current = null;
  if (attempts.length > 0) {
    const percentage = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
    const totalMarks = cutoff ? cutoff.totalMarks : course.latest._count.questions;
    current = {
      value: round1((percentage / 100) * totalMarks),
      percentage: round1(percentage),
      basedOnAttempts: attempts.length,
    };
  }

  return {
    courseKey: course.key,
    courseName: course.name,
    category,
    cutoff,
    current,
    gap: cutoff && current ? round1(cutoff.value - current.value) : null,
  };
};

const computeWeakTopics = async (userId, quizIds) => {
  if (quizIds && quizIds.length === 0) return [];

  // Untagged questions fall back to their paper's subject so weak areas show from day one.
  const rows = quizIds
    ? await prisma.$queryRaw`
        SELECT q.topic_id AS "topicId", t.name AS "topicName", t.subject AS "topicSubject",
               CASE WHEN q.topic_id IS NULL THEN z.subject END AS "fallback",
               COUNT(*)::int AS attempted,
               COUNT(*) FILTER (WHERE r.is_correct)::int AS correct
        FROM question_responses r
        JOIN "Question" q ON q.question_id = r.question_id
        JOIN "Quiz" z ON z.quiz_id = q.quiz_id
        LEFT JOIN topics t ON t.topic_id = q.topic_id
        WHERE r.user_id = ${userId} AND q.quiz_id = ANY(${quizIds})
        GROUP BY 1, 2, 3, 4`
    : await prisma.$queryRaw`
        SELECT q.topic_id AS "topicId", t.name AS "topicName", t.subject AS "topicSubject",
               CASE WHEN q.topic_id IS NULL THEN z.subject END AS "fallback",
               COUNT(*)::int AS attempted,
               COUNT(*) FILTER (WHERE r.is_correct)::int AS correct
        FROM question_responses r
        JOIN "Question" q ON q.question_id = r.question_id
        JOIN "Quiz" z ON z.quiz_id = q.quiz_id
        LEFT JOIN topics t ON t.topic_id = q.topic_id
        WHERE r.user_id = ${userId}
        GROUP BY 1, 2, 3, 4`;

  return rows
    .filter((r) => r.attempted >= WEAK_TOPIC_MIN_ATTEMPTS)
    .map((r) => ({
      topicId: r.topicId,
      name: r.topicName ?? r.fallback,
      subject: r.topicSubject ?? r.fallback,
      attempted: r.attempted,
      correct: r.correct,
      accuracy: round1((r.correct / r.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted)
    .slice(0, WEAK_TOPIC_LIMIT);
};

/**
 * GET /api/app/home
 * Everything the app home screen needs in one round trip
 */
export const getAppHome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [profileRow, courses, streak, dueCount, totalInQueue, totalsRow] = await Promise.all([
      prisma.studyProfile.findUnique({ where: { userId } }),
      loadCourses(),
      getStreak(userId, now),
      prisma.reviewItem.count({ where: { userId, graduated: false, dueAt: { lte: now } } }),
      prisma.reviewItem.count({ where: { userId, graduated: false } }),
      prisma.questionResponse.groupBy({
        by: ["isCorrect"],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    const course = profileRow?.targetCourseKey ? courses.get(profileRow.targetCourseKey) : null;
    const [cutoffGap, weakTopics] = await Promise.all([
      computeCutoffGap(userId, profileRow, courses),
      computeWeakTopics(userId, course ? course.quizzes.map((q) => q.id) : null),
    ]);

    const answered = totalsRow.reduce((sum, r) => sum + r._count._all, 0);
    const correct = totalsRow.find((r) => r.isCorrect)?._count._all ?? 0;

    res.status(200).json(new ApiResponse(200, {
      profile: toStudyProfile(profileRow),
      streak,
      review: { dueCount, totalInQueue },
      cutoffGap,
      weakTopics,
      totals: {
        questionsAnswered: answered,
        accuracy: answered > 0 ? round1((correct / answered) * 100) : 0,
      },
    }, "Home fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching home"));
  }
};
