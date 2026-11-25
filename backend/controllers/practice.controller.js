import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import {
  accessibleQuizWhere,
  practiceQuestionInclude,
  quizIdsForCourse,
  toPracticeQuestion,
} from "../services/practiceQuestions.js";
import { getStreak, recordResponses } from "../services/responseRecorder.js";

const MAX_PACK_SIZE = 2000;
const MAX_BATCH_SIZE = 200;
const MAX_TIME_TAKEN_MS = 60 * 60 * 1000;
const PRACTICE_SOURCES = ["practice", "review", "today"];

const positiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const shuffleInPlace = (items) => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/**
 * GET /api/practice/questions
 * Query: courseKey, subject, topicId, year, quizId, count (max 2000), shuffle
 * Unlike exam mode, practice questions include the correct option and explanation.
 */
export const getPracticeQuestions = async (req, res, next) => {
  try {
    const { courseKey, subject, topicId, year, quizId, count, shuffle } = req.query;

    if (!courseKey && !subject && !topicId && !quizId) {
      return next(new ApiError(400, "Provide courseKey, subject, topicId or quizId"));
    }

    const quizWhere = accessibleQuizWhere(req.user.id);
    const quizIdFilters = [];
    if (courseKey) quizIdFilters.push(await quizIdsForCourse(String(courseKey)));
    if (quizId) {
      const id = positiveInt(quizId);
      if (!id) return next(new ApiError(400, "Invalid quiz ID"));
      quizIdFilters.push([id]);
    }
    if (quizIdFilters.length > 0) {
      quizWhere.id = { in: quizIdFilters.reduce((a, b) => a.filter((id) => b.includes(id))) };
    }
    if (subject) quizWhere.subject = { equals: String(subject).trim(), mode: "insensitive" };
    if (year) {
      const y = positiveInt(year);
      if (!y) return next(new ApiError(400, "Invalid year"));
      quizWhere.examYear = y;
    }

    const where = { quiz: quizWhere };
    if (topicId) {
      const id = positiveInt(topicId);
      if (!id) return next(new ApiError(400, "Invalid topic ID"));
      where.topicId = id;
    }

    const take = Math.min(positiveInt(count) ?? MAX_PACK_SIZE, MAX_PACK_SIZE);
    const randomise = shuffle === "true";

    const [total, rows] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: practiceQuestionInclude,
        orderBy: [{ quiz: { examYear: "desc" } }, { quizId: "asc" }, { questionOrder: "asc" }],
        ...(randomise ? {} : { take }),
      }),
    ]);

    const picked = randomise ? shuffleInPlace(rows).slice(0, take) : rows;

    res.status(200).json(new ApiResponse(200, {
      questions: picked.map(toPracticeQuestion),
      total,
    }, "Practice questions fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching practice questions"));
  }
};

/**
 * POST /api/practice/responses
 * Body: { responses: [{ clientId, questionId, selectedOption, timeTakenMs, answeredAt, source }] }
 * Correctness is always computed here from the stored answer, never taken from the client.
 */
export const syncResponses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { responses } = req.body || {};

    if (!Array.isArray(responses) || responses.length === 0 || responses.length > MAX_BATCH_SIZE) {
      return next(new ApiError(400, `responses must be an array of 1 to ${MAX_BATCH_SIZE} items`));
    }

    const questionIds = [...new Set(responses.map((r) => positiveInt(r?.questionId)).filter(Boolean))];
    const questions = questionIds.length === 0 ? [] : await prisma.question.findMany({
      where: { id: { in: questionIds }, quiz: accessibleQuizWhere(userId) },
      select: { id: true, isCorrect: true },
    });
    const answerKey = new Map(questions.map((q) => [q.id, q.isCorrect]));

    const now = new Date();
    const rejected = [];
    const valid = [];
    for (const item of responses) {
      const clientId = typeof item?.clientId === "string" ? item.clientId.trim() : "";
      const reject = (reason) => rejected.push({ clientId: clientId || null, reason });

      if (!clientId || clientId.length > 80) { reject("invalid_client_id"); continue; }
      const questionId = positiveInt(item.questionId);
      if (!questionId || !answerKey.has(questionId)) { reject("question_not_found"); continue; }
      const selectedOption = Number(item.selectedOption);
      if (!Number.isInteger(selectedOption) || selectedOption < 1 || selectedOption > 4) {
        reject("invalid_selected_option"); continue;
      }
      if (!PRACTICE_SOURCES.includes(item.source)) { reject("invalid_source"); continue; }
      const answeredAt = new Date(item.answeredAt);
      if (typeof item.answeredAt !== "string" || Number.isNaN(answeredAt.getTime())) {
        reject("invalid_answered_at"); continue;
      }

      const timeTakenMs = Math.round(Number(item.timeTakenMs));
      valid.push({
        clientId,
        questionId,
        selectedOption,
        isCorrect: answerKey.get(questionId) === selectedOption,
        timeTakenMs: Number.isFinite(timeTakenMs) ? Math.min(Math.max(timeTakenMs, 0), MAX_TIME_TAKEN_MS) : 0,
        answeredAt: answeredAt > now ? now : answeredAt,
        source: item.source,
      });
    }

    const { accepted, duplicates } = await recordResponses(userId, valid);
    const streak = await getStreak(userId, now);

    res.status(200).json(new ApiResponse(200, {
      accepted,
      duplicates,
      rejected,
      streak,
    }, "Responses synced"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error syncing responses"));
  }
};

/**
 * GET /api/practice/review
 * The caller's spaced-repetition queue with full questions, soonest due first
 */
export const getReviewQueue = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await prisma.reviewItem.findMany({
      where: { userId, graduated: false, question: { quiz: accessibleQuizWhere(userId) } },
      include: { question: { include: practiceQuestionInclude } },
      orderBy: { dueAt: "asc" },
    });

    res.status(200).json(new ApiResponse(200, {
      items: items.map((item) => ({
        questionId: item.questionId,
        box: item.box,
        dueAt: item.dueAt,
        lastAnsweredAt: item.lastAnsweredAt,
        wrongCount: item.wrongCount,
        question: toPracticeQuestion(item.question),
      })),
    }, "Review queue fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching review queue"));
  }
};
