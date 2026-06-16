import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

/**
 * Submit a new question (User or Guest)
 * POST /api/qa/ask
 */
export const askQuestion = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { question, category, guestEmail } = req.body;

    // Validate input
    if (!question || question.trim() === "") {
      return next(new ApiError(400, "Question is required"));
    }

    if (question.length > 2000) {
      return next(new ApiError(400, "Question must be less than 2000 characters"));
    }

    // For guest users, require email
    if (!userId && (!guestEmail || guestEmail.trim() === "")) {
      return next(new ApiError(400, "Email is required to submit a question"));
    }

    // Validate email format for guests
    if (!userId && guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return next(new ApiError(400, "Please provide a valid email address"));
      }
    }

    // Validate category
    const validCategories = ["JMI", "AMU", "general"];
    const selectedCategory = category && validCategories.includes(category) ? category : "general";

    // Create question
    const createData = {
      userId: userId || null,
      guestEmail: userId ? null : guestEmail.trim().toLowerCase(),
      question: question.trim(),
      category: selectedCategory,
      status: "pending"
    };

    // Only include user relation if userId exists
    const includeUser = userId ? {
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    } : {};

    const newQuestion = await prisma.userQuestion.create({
      data: createData,
      ...includeUser
    });

    res.status(201).json(
      new ApiResponse(201, newQuestion, "Question submitted successfully. Sign up with the same email to view the answer.")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's own questions with answers (User)
 * GET /api/qa/my-questions
 */
export const getMyQuestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Get total count and questions in parallel
    const [totalQuestions, questions] = await Promise.all([
      prisma.userQuestion.count({ where: { userId } }),
      prisma.userQuestion.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" }
      })
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        questions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalQuestions / limitNum),
          totalQuestions,
          limit: limitNum
        }
      }, "Your questions fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all questions (Admin only)
 * GET /api/admin/qa/questions
 */
export const getAllQuestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (category && category !== "all") {
      where.category = category;
    }

    // Get total count and questions in parallel
    const [totalQuestions, questions] = await Promise.all([
      prisma.userQuestion.count({ where }),
      prisma.userQuestion.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profilePhoto: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        questions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalQuestions / limitNum),
          totalQuestions,
          limit: limitNum
        }
      }, "Questions fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Answer a question (Admin only)
 * POST /api/admin/qa/answer/:id
 */
export const answerQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!answer || answer.trim() === "") {
      return next(new ApiError(400, "Answer is required"));
    }

    if (answer.length > 3000) {
      return next(new ApiError(400, "Answer must be less than 3000 characters"));
    }

    // Check if question exists
    const existingQuestion = await prisma.userQuestion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingQuestion) {
      return next(new ApiError(404, "Question not found"));
    }

    // Update question with answer
    const updatedQuestion = await prisma.userQuestion.update({
      where: { id: parseInt(id) },
      data: {
        answer: answer.trim(),
        answeredBy: adminId,
        answeredAt: new Date(),
        status: "answered"
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.status(200).json(
      new ApiResponse(200, updatedQuestion, "Answer submitted successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a question (Admin only)
 * DELETE /api/admin/qa/questions/:id
 */
export const deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if question exists
    const question = await prisma.userQuestion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!question) {
      return next(new ApiError(404, "Question not found"));
    }

    // Delete question
    await prisma.userQuestion.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json(
      new ApiResponse(200, null, "Question deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Q&A stats for admin dashboard
 * GET /api/admin/qa/stats
 */
export const getQAStats = async (req, res, next) => {
  try {
    const [totalQuestions, pendingQuestions, answeredQuestions] = await Promise.all([
      prisma.userQuestion.count(),
      prisma.userQuestion.count({ where: { status: "pending" } }),
      prisma.userQuestion.count({ where: { status: "answered" } })
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        totalQuestions,
        pendingQuestions,
        answeredQuestions
      }, "Q&A stats fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};
