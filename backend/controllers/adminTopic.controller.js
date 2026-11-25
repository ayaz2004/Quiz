import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

const MAX_BULK = 500;
const MAX_PAGE_SIZE = 200;
const DIFFICULTIES = ["easy", "medium", "hard"];
const STATUS_FILTERS = {
  pending: { topicId: null, suggestedTopicId: { not: null } },
  approved: { topicId: { not: null } },
  untagged: { topicId: null, suggestedTopicId: null },
  all: {},
};

const positiveInt = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const parseIdList = (value) => {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_BULK) return null;
  const ids = value.map(positiveInt);
  return ids.every(Boolean) ? [...new Set(ids)] : null;
};

/**
 * GET /api/admin/topics?subject=
 */
export const adminListTopics = async (req, res, next) => {
  try {
    const subject = typeof req.query.subject === "string" ? req.query.subject.trim() : "";
    const topics = await prisma.topic.findMany({
      where: subject ? { subject: { equals: subject, mode: "insensitive" } } : {},
      select: {
        id: true,
        subject: true,
        name: true,
        _count: {
          select: {
            questions: true,
            suggestedQuestions: { where: { topicId: null } },
          },
        },
      },
      orderBy: [{ subject: "asc" }, { name: "asc" }],
    });

    res.status(200).json(new ApiResponse(200, {
      topics: topics.map((t) => ({
        id: t.id,
        subject: t.subject,
        name: t.name,
        questionCount: t._count.questions,
        suggestedCount: t._count.suggestedQuestions,
      })),
    }, "Topics fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching topics"));
  }
};

/**
 * POST /api/admin/topics
 * Body: { subject, name }
 */
export const adminCreateTopic = async (req, res, next) => {
  try {
    const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";

    if (!subject || subject.length > 100) {
      return next(new ApiError(400, "subject is required (max 100 characters)"));
    }
    if (!name || name.length > 150) {
      return next(new ApiError(400, "name is required (max 150 characters)"));
    }

    const existing = await prisma.topic.findUnique({ where: { subject_name: { subject, name } } });
    if (existing) return next(new ApiError(409, "Topic already exists"));

    const topic = await prisma.topic.create({ data: { subject, name } });
    res.status(201).json(new ApiResponse(201, {
      topic: { id: topic.id, subject: topic.subject, name: topic.name },
    }, "Topic created"));
  } catch (error) {
    if (error.code === "P2002") return next(new ApiError(409, "Topic already exists"));
    next(new ApiError(500, error.message || "Error creating topic"));
  }
};

/**
 * GET /api/admin/topic-review?status=pending|approved|untagged|all&subject=&quizId=&search=&page=&limit=
 * `subject` filters on the quiz subject. `counts` ignore `status`.
 */
export const adminTopicReviewList = async (req, res, next) => {
  try {
    const status = req.query.status ?? "pending";
    if (!(status in STATUS_FILTERS)) {
      return next(new ApiError(400, "status must be pending, approved, untagged or all"));
    }

    const page = positiveInt(req.query.page) ?? 1;
    const limit = Math.min(positiveInt(req.query.limit) ?? 50, MAX_PAGE_SIZE);

    const base = {};
    const quizWhere = {};
    if (typeof req.query.subject === "string" && req.query.subject.trim()) {
      quizWhere.subject = { equals: req.query.subject.trim(), mode: "insensitive" };
    }
    if (req.query.quizId) {
      const quizId = positiveInt(req.query.quizId);
      if (!quizId) return next(new ApiError(400, "Invalid quiz ID"));
      quizWhere.id = quizId;
    }
    if (Object.keys(quizWhere).length > 0) base.quiz = quizWhere;
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      base.questionText = { contains: req.query.search.trim(), mode: "insensitive" };
    }

    const where = { ...base, ...STATUS_FILTERS[status] };
    const [totalItems, questions, pending, approved, untagged] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        include: {
          quiz: { select: { title: true, subject: true } },
          topic: { select: { name: true } },
          suggestedTopic: { select: { name: true, subject: true } },
        },
        orderBy: [{ suggestionConfidence: { sort: "desc", nulls: "last" } }, { id: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where: { ...base, ...STATUS_FILTERS.pending } }),
      prisma.question.count({ where: { ...base, ...STATUS_FILTERS.approved } }),
      prisma.question.count({ where: { ...base, ...STATUS_FILTERS.untagged } }),
    ]);

    res.status(200).json(new ApiResponse(200, {
      questions: questions.map((q) => ({
        id: q.id,
        quizId: q.quizId,
        quizTitle: q.quiz.title,
        subject: q.quiz.subject,
        questionOrder: q.questionOrder,
        questionText: q.questionText,
        options: [q.option1, q.option2, q.option3, q.option4],
        correctOption: q.isCorrect,
        imageUrl: q.imageUrl,
        explanation: q.explanation,
        topicId: q.topicId,
        topicName: q.topic?.name ?? null,
        suggestedTopicId: q.suggestedTopicId,
        suggestedTopicName: q.suggestedTopic?.name ?? null,
        suggestedTopicSubject: q.suggestedTopic?.subject ?? null,
        suggestionConfidence: q.suggestionConfidence,
        difficulty: q.difficulty,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        limit,
      },
      counts: { pending, approved, untagged },
    }, "Topic review fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching topic review"));
  }
};

/**
 * POST /api/admin/topic-review/approve
 * Body: { items: [{ questionId, topicId?, difficulty? }] }. topicId defaults to the suggestion.
 */
export const adminApproveTopics = async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_BULK) {
      return next(new ApiError(400, `items must be an array of 1 to ${MAX_BULK} entries`));
    }

    const questionIds = [...new Set(items.map((i) => positiveInt(i?.questionId)).filter(Boolean))];
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, suggestedTopicId: true },
    });
    const suggestionOf = new Map(questions.map((q) => [q.id, q.suggestedTopicId]));

    const requestedTopicIds = [...new Set(items.map((i) => positiveInt(i?.topicId)).filter(Boolean))];
    const knownTopics = new Set((await prisma.topic.findMany({
      where: { id: { in: requestedTopicIds } },
      select: { id: true },
    })).map((t) => t.id));

    const skipped = [];
    const groups = new Map();
    const handled = new Set();
    for (const item of items) {
      const questionId = positiveInt(item?.questionId);
      if (!questionId || !suggestionOf.has(questionId)) {
        skipped.push({ questionId: item?.questionId ?? null, reason: "unknown_question" });
        continue;
      }
      if (handled.has(questionId)) continue;

      let topicId = suggestionOf.get(questionId);
      if (item.topicId !== undefined && item.topicId !== null) {
        topicId = positiveInt(item.topicId);
        if (!topicId || !knownTopics.has(topicId)) {
          skipped.push({ questionId, reason: "unknown_topic" });
          continue;
        }
      }
      if (!topicId) {
        skipped.push({ questionId, reason: "nothing_to_approve" });
        continue;
      }
      if (item.difficulty !== undefined && item.difficulty !== null && !DIFFICULTIES.includes(item.difficulty)) {
        skipped.push({ questionId, reason: "invalid_difficulty" });
        continue;
      }

      handled.add(questionId);
      const key = `${topicId}|${item.difficulty ?? ""}`;
      if (!groups.has(key)) groups.set(key, { topicId, difficulty: item.difficulty ?? null, ids: [] });
      groups.get(key).ids.push(questionId);
    }

    const results = await prisma.$transaction([...groups.values()].map((g) => prisma.question.updateMany({
      where: { id: { in: g.ids } },
      data: {
        topicId: g.topicId,
        suggestedTopicId: null,
        suggestionConfidence: null,
        ...(g.difficulty ? { difficulty: g.difficulty } : {}),
      },
    })));

    res.status(200).json(new ApiResponse(200, {
      updated: results.reduce((sum, r) => sum + r.count, 0),
      skipped,
    }, "Topics approved"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error approving topics"));
  }
};

/**
 * POST /api/admin/topic-review/reject
 * Body: { questionIds: [...] }. Drops the suggestion only.
 */
export const adminRejectSuggestions = async (req, res, next) => {
  try {
    const ids = parseIdList(req.body?.questionIds);
    if (!ids) return next(new ApiError(400, `questionIds must be 1 to ${MAX_BULK} question IDs`));

    const { count } = await prisma.question.updateMany({
      where: { id: { in: ids } },
      data: { suggestedTopicId: null, suggestionConfidence: null },
    });
    res.status(200).json(new ApiResponse(200, { updated: count }, "Suggestions rejected"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error rejecting suggestions"));
  }
};

/**
 * POST /api/admin/topic-review/clear
 * Body: { questionIds: [...] }. Removes the approved topic (back to untagged).
 */
export const adminClearTopics = async (req, res, next) => {
  try {
    const ids = parseIdList(req.body?.questionIds);
    if (!ids) return next(new ApiError(400, `questionIds must be 1 to ${MAX_BULK} question IDs`));

    const { count } = await prisma.question.updateMany({
      where: { id: { in: ids } },
      data: { topicId: null },
    });
    res.status(200).json(new ApiResponse(200, { updated: count }, "Topics cleared"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error clearing topics"));
  }
};
