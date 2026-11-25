import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import {
  accessibleQuizWhere,
  practiceQuestionInclude,
  toPracticeQuestion,
} from "../services/practiceQuestions.js";

const parseQuestionId = (req) => {
  const id = Number(req.params.questionId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * GET /api/bookmarks
 */
export const listBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId, question: { quiz: accessibleQuizWhere(userId) } },
      include: { question: { include: practiceQuestionInclude } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(new ApiResponse(200, {
      bookmarks: bookmarks.map((b) => ({
        questionId: b.questionId,
        createdAt: b.createdAt,
        question: toPracticeQuestion(b.question),
      })),
    }, "Bookmarks fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching bookmarks"));
  }
};

/**
 * PUT /api/bookmarks/:questionId (idempotent)
 */
export const addBookmark = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const questionId = parseQuestionId(req);
    if (!questionId) return next(new ApiError(400, "Invalid question ID"));

    const question = await prisma.question.findFirst({
      where: { id: questionId, quiz: accessibleQuizWhere(userId) },
      select: { id: true },
    });
    if (!question) return next(new ApiError(404, "Question not found"));

    await prisma.bookmark.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: { userId, questionId },
      update: {},
    });

    res.status(200).json(new ApiResponse(200, { questionId, bookmarked: true }, "Bookmarked"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error saving bookmark"));
  }
};

/**
 * DELETE /api/bookmarks/:questionId (idempotent)
 */
export const removeBookmark = async (req, res, next) => {
  try {
    const questionId = parseQuestionId(req);
    if (!questionId) return next(new ApiError(400, "Invalid question ID"));

    await prisma.bookmark.deleteMany({ where: { userId: req.user.id, questionId } });

    res.status(200).json(new ApiResponse(200, { questionId, bookmarked: false }, "Bookmark removed"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error removing bookmark"));
  }
};
