import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

/**
 * Check if user has access to a quiz
 * Used internally by other controllers
 */
export const checkQuizAccess = async (userId, quizId) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId }
  });

  if (!quiz) {
    return { hasAccess: false, reason: "Quiz not found" };
  }

  // Free quizzes are accessible to everyone
  if (!quiz.isPaid) {
    return { hasAccess: true, quiz };
  }

  // Check if user has purchased this quiz
  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_quizId: {
        userId,
        quizId
      },
      status: "completed"
    }
  });

  if (purchase) {
    return { hasAccess: true, quiz };
  }

  return { 
    hasAccess: false, 
    reason: "This is a paid quiz. Please purchase to access.",
    quiz
  };
};

/**
 * API 1: Purchase a quiz
 * POST /api/purchase/quiz/:quizId
 * Requires authentication
 */
export const purchaseQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const quizIdNum = parseInt(quizId);

    if (!quizIdNum || isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    // Check if quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: quizIdNum,
        isActive: true 
      }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found or inactive"));
    }

    // Check if quiz is free
    if (!quiz.isPaid) {
      return next(new ApiError(400, "This quiz is free. No purchase required."));
    }

    if (!quiz.price || quiz.price <= 0) {
      return next(new ApiError(400, "Invalid quiz price"));
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId: quizIdNum
        }
      }
    });

    if (existingPurchase) {
      return next(new ApiError(400, "You have already purchased this quiz"));
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        quizId: quizIdNum,
        amount: quiz.price,
        status: "completed" // In real app, this would be "pending" until payment confirmation
      }
    });

    // Update user's purchasedExams array
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const purchasedExams = typeof user.purchasedExams === 'string' 
      ? JSON.parse(user.purchasedExams) 
      : user.purchasedExams;
    
    if (!purchasedExams.includes(quizIdNum)) {
      purchasedExams.push(quizIdNum);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          purchasedExams: JSON.stringify(purchasedExams)
        }
      });
    }

    res.status(201).json(
      new ApiResponse(201, {
        purchase: {
          id: purchase.id,
          quizId: quiz.id,
          quizTitle: quiz.title,
          amount: purchase.amount,
          status: purchase.status,
          purchasedAt: purchase.purchasedAt
        },
        message: "Purchase successful! You can now access this quiz."
      }, "Quiz purchased successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error purchasing quiz"));
  }
};

/**
 * API 2: Get user's purchases
 * GET /api/purchase/my-purchases
 * Query params: page, limit
 * Requires authentication
 */
export const getUserPurchases = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalPurchases = await prisma.purchase.count({ 
      where: { userId } 
    });

    // Get purchases with quiz details
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      skip,
      take: limitNum,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            subject: true,
            examYear: true,
            price: true,
            prize: true,
            _count: {
              select: { questions: true }
            }
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });

    const formattedPurchases = purchases.map(purchase => ({
      purchaseId: purchase.id,
      quiz: {
        id: purchase.quiz.id,
        title: purchase.quiz.title,
        description: purchase.quiz.description,
        subject: purchase.quiz.subject,
        examYear: purchase.quiz.examYear,
        price: purchase.quiz.price,
        prize: purchase.quiz.prize,
        questionCount: purchase.quiz._count.questions
      },
      amount: purchase.amount,
      status: purchase.status,
      purchasedAt: purchase.purchasedAt
    }));

    res.status(200).json(
      new ApiResponse(200, {
        purchases: formattedPurchases,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalPurchases / limitNum),
          totalPurchases,
          limit: limitNum
        }
      }, "Purchases fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching purchases"));
  }
};

/**
 * API 3: Check if user has access to a specific quiz
 * GET /api/purchase/check-access/:quizId
 * Requires authentication
 */
export const checkUserAccess = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;
    const quizIdNum = parseInt(quizId);

    if (!quizIdNum || isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    const result = await checkQuizAccess(userId, quizIdNum);

    if (!result.quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    res.status(200).json(
      new ApiResponse(200, {
        hasAccess: result.hasAccess,
        quiz: {
          id: result.quiz.id,
          title: result.quiz.title,
          isPaid: result.quiz.isPaid,
          price: result.quiz.price,
          prize: result.quiz.prize
        },
        reason: result.reason || null
      }, result.hasAccess ? "Access granted" : "Access denied")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error checking access"));
  }
};

/**
 * API 4: Get all purchased quizzes (simplified list)
 * GET /api/purchase/my-quizzes
 * Requires authentication
 */
export const getMyQuizzes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const purchases = await prisma.purchase.findMany({
      where: { 
        userId,
        status: "completed"
      },
      include: {
        quiz: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            subject: true,
            examYear: true,
            prize: true,
            _count: {
              select: { questions: true }
            }
          }
        }
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });

    const myQuizzes = purchases
      .filter(p => p.quiz !== null)
      .map(purchase => ({
        quizId: purchase.quiz.id,
        title: purchase.quiz.title,
        subject: purchase.quiz.subject,
        examYear: purchase.quiz.examYear,
        prize: purchase.quiz.prize,
        questionCount: purchase.quiz._count.questions,
        purchasedAt: purchase.purchasedAt
      }));

    res.status(200).json(
      new ApiResponse(200, {
        quizzes: myQuizzes,
        totalPurchased: myQuizzes.length
      }, "Your purchased quizzes fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching your quizzes"));
  }
};
