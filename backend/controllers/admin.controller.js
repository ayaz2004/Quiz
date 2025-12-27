import prisma from "../config/db.config.js";
import { ApiError } from "../utils/error.js";
import { ApiResponse } from "../utils/apiResponse.js";

/**
 * Add a new quiz with questions
 * @route POST /api/admin/quiz
 * @access Admin only
 */
export const addQuiz = async (req, res, next) => {
    try {
        const { quiz, user } = req.body;
        if (!user || user.isAdmin !== 1) {
            return next(new ApiError(403, "Only admins can add quizzes"));
        }

        const newQuiz = await prisma.quiz.create({
            data: {
                title: quiz.title,
                description: quiz.description,
                subject: quiz.subject,
                examYear: parseInt(quiz.examYear),
                createdBy: parseInt(quiz.createdBy),
                isActive: quiz.isActive !== undefined ? quiz.isActive : true,
                isPaid: quiz.isPaid || false,
                price: quiz.price ? parseFloat(quiz.price) : 0,
                // Using the flat fields from your Question model
                questions: {
                    create: quiz.questions.map((q) => ({
                        questionText: q.questionText,
                        option1: q.option1,
                        option2: q.option2,
                        option3: q.option3,
                        option4: q.option4,
                        isCorrect: parseInt(q.isCorrect), // Should be 1, 2, 3, or 4
                        explanation: q.explanation || null,
                        imageUrl: q.imageUrl || null,
                    })),
                },
            },
            include: {
                questions: true,
            },
        });

        return res
            .status(201)
            .json(new ApiResponse(201, { quiz: newQuiz }, "Quiz added successfully"));
    } catch (error) {
        // ALWAYS pass the error to next() or send a response so the request doesn't hang
        console.error("Prisma Error:", error);
        return next(new ApiError(500, error.message || "Error creating quiz"));
    }
};

/**
 * Update an existing quiz and its questions
 * @route PUT /api/admin/quiz/:id
 * @access Admin only
 */
export const updateQuiz = async (req, res, next) => {
    try {
        const { id } = req.params; // Quiz ID from URL
        const { quiz } = req.body;

        // Use $transaction to ensure both operations succeed or fail together
        const updatedQuiz = await prisma.$transaction(async (tx) => {
            // 1. Delete all existing questions for this quiz
            await tx.question.deleteMany({
                where: { quizId: parseInt(id) },
            });

            // 2. Update Quiz metadata and recreate questions
            return await tx.quiz.update({
                where: { id: parseInt(id) },
                data: {
                    title: quiz.title,
                    description: quiz.description,
                    subject: quiz.subject,
                    examYear: parseInt(quiz.examYear),
                    isActive: quiz.isActive,
                    isPaid: quiz.isPaid,
                    price: quiz.isPaid ? parseFloat(quiz.price) : 0,
                    // Re-create the new set of questions
                    questions: {
                        create: quiz.questions.map((q) => ({
                            questionText: q.questionText,
                            option1: q.option1,
                            option2: q.option2,
                            option3: q.option3,
                            option4: q.option4,
                            isCorrect: parseInt(q.isCorrect),
                            explanation: q.explanation,
                            imageUrl: q.imageUrl,
                        })),
                    },
                },
                include: { questions: true },
            });
        });

        return res
            .status(200)
            .json(
                new ApiResponse(200, { quiz: updatedQuiz }, "Quiz updated successfully")
            );
    } catch (error) {
        return next(new ApiError(500, error.message || "Failed to update quiz"));
    }
};

/**
 * Get all users with pagination
 * @route GET /api/admin/users
 * @access Admin only
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { user } = req.body;
        if (!user || user.isAdmin !== 1) {
            return next(new ApiError(403, "Only admins can view all users"));
        }
        const [users, totalUsers] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    isEmailVerified: true,
                    createdAt: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.user.count(),
        ]);

        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    users,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalUsers,
                        limit,
                    },
                },
                "Users retrieved successfully"
            )
        );
    } catch (error) {
        return next(new ApiError(500, error.message || "Error retrieving users"));
    }
};

/**
 * Delete a user by ID
 * @route DELETE /api/admin/user/:userId
 * @access Admin only
 */
export const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { user } = req.body;
        if (!user || user.isAdmin !== 1) {
            return next(new ApiError(403, "Only admins can delete users"));
        }
        await prisma.user.delete({
            where: { id: parseInt(userId) },
        });
        return res
            .status(200)
            .json(new ApiResponse(200, null, "User deleted successfully"));
    } catch (error) {
        return next(new ApiError(500, error.message || "Error deleting user"));
    }
};
