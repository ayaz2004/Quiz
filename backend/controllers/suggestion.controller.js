import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

/**
 * Submit a suggestion for a quiz
 * POST /api/suggestions
 * Protected route - requires authentication
 */
export const submitSuggestion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { quizId, attemptId, suggestionText } = req.body;

    // Validate input
    if (!quizId || !suggestionText || suggestionText.trim() === '') {
      return next(new ApiError(400, "Quiz ID and suggestion text are required"));
    }

    if (suggestionText.length > 2000) {
      return next(new ApiError(400, "Suggestion text must be less than 2000 characters"));
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    // Create suggestion
    const suggestion = await prisma.suggestion.create({
      data: {
        userId,
        quizId: parseInt(quizId),
        attemptId: attemptId ? parseInt(attemptId) : null,
        suggestionText: suggestionText.trim(),
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json(
      new ApiResponse(201, suggestion, "Suggestion submitted successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all suggestions (Admin only)
 * GET /api/admin/suggestions
 * Query params: page, limit, status
 */
export const getAllSuggestions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Cap at 50
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count and suggestions in parallel
    const [totalSuggestions, suggestions] = await Promise.all([
      prisma.suggestion.count({ where }),
      prisma.suggestion.findMany({
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
          },
          quiz: {
            select: {
              id: true,
              title: true,
              subject: true,
              examYear: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        suggestions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalSuggestions / limitNum),
          totalSuggestions,
          limit: limitNum
        }
      }, "Suggestions fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update suggestion status (Admin only)
 * PATCH /api/admin/suggestions/:id
 */
export const updateSuggestionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return next(new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`));
    }

    // Check if suggestion exists
    const existingSuggestion = await prisma.suggestion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSuggestion) {
      return next(new ApiError(404, "Suggestion not found"));
    }

    // Update suggestion
    const updatedSuggestion = await prisma.suggestion.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        quiz: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(200).json(
      new ApiResponse(200, updatedSuggestion, "Suggestion status updated successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a suggestion (Admin only)
 * DELETE /api/admin/suggestions/:id
 */
export const deleteSuggestion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if suggestion exists
    const suggestion = await prisma.suggestion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!suggestion) {
      return next(new ApiError(404, "Suggestion not found"));
    }

    // Delete suggestion
    await prisma.suggestion.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json(
      new ApiResponse(200, null, "Suggestion deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's own suggestions
 * GET /api/suggestions/my-suggestions
 */
export const getMySuggestions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalSuggestions = await prisma.suggestion.count({
      where: { userId }
    });

    // Get user's suggestions
    const suggestions = await prisma.suggestion.findMany({
      where: { userId },
      skip,
      take: limitNum,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            examYear: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(
      new ApiResponse(200, {
        suggestions,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalSuggestions / limitNum),
          totalSuggestions,
          limit: limitNum
        }
      }, "Your suggestions fetched successfully")
    );
  } catch (error) {
    next(error);
  }
};
