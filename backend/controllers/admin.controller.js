import prisma from "../config/db.config.js";
import { ApiError } from "../utils/error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadImage } from "../utils/cloudinary.js";
import fs from "fs";

const CUTOFF_FIELDS = [
  "general",
  "muslim",
  "muslimObcSt",
  "muslimWomen",
  "jk",
  "km",
  "pwd",
  "pwdLocomoter",
  "pwdBlindVision",
  "pwdHearing",
  "jamiaInternal",
];

const parseCutoffValue = (value) => {
  if (value === null || value === undefined) return null;
  if (value === "" || value === "-") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeCutoffRow = (row = {}) => {
  const year = parseInt(row.year);

  if (!Number.isInteger(year)) {
    return null;
  }

  const normalized = { year };

  for (const field of CUTOFF_FIELDS) {
    normalized[field] = parseCutoffValue(row[field]);
  }

  return normalized;
};
/**
 * Add a new quiz with questions
 * @route POST /api/admin/quiz
 * @access Admin only
 */
export const addQuiz = async (req, res, next) => {
  try {
    // 1. Parse the JSON string from the form-data
    // In Postman, you will send a field named "quizData"
    const user = req.user;
   
    if(!user || user.isAdmin !==1){
        return next(new ApiError(403, "Only admins can add quizzes"));
    }
    const data = JSON.parse(req.body.quizData);
    console.log(data);
    const {
      title,
      description,
      subject,
      examYear,
      educationLevel,
      createdBy,
      isActive,
      isPaid,
      price,
      timeLimit,
      hasNegativeMarking,
      negativeMarks,
      questions,
      cutoffs = [],
    } = data;

    const existingQuiz = await prisma.quiz.findUnique({
      where: { title },
      select: { id: true },
    });
    if (existingQuiz) {
      return next(new ApiError(409, "A quiz with this title already exists"));
    }
    // 2. Process Questions and Upload Images
    // We use Promise.all because uploading to Cloudinary is asynchronous
    const questionsWithImages = await Promise.all(
      questions.map(async (q, index) => {
        let cloudinaryUrl = null;

        // Look for a file in req.files that matches "questions[index][image]"
        // or a flat name like "image_0", "image_1" etc.
        const file = req.files.find((f) => f.fieldname === `image_${index}`);

        if (file) {
          //     // Upload to Cloudinary using your util
          //     // Note: Your util currently returns result.public_id,
          //     // you might want result.secure_url for the frontend.
          const uploadResult = await uploadImage(file.path);

          //     // Construct the URL or use the returned ID
          cloudinaryUrl = uploadResult;

          //     // Clean up: delete local file after successful upload
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          // }

          
        }

        return {
          questionOrder: index + 1,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          isCorrect: parseInt(q.isCorrect),
          explanation: q.explanation || null,
          imageUrl: cloudinaryUrl || null,
        };
      })
    );

    const cutoffRows = Array.isArray(cutoffs)
      ? cutoffs.map(normalizeCutoffRow).filter(Boolean)
      : [];

    // 3. Save to Database
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subject,
        examYear: parseInt(examYear),
        educationLevel: educationLevel || 'undergrad', // Default to undergrad if empty
        createdBy: parseInt(createdBy),
        isActive: isActive !== undefined ? isActive : true,
        isPaid: isPaid || false,
        price: price ? parseFloat(price) : 0,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        hasNegativeMarking: hasNegativeMarking || false,
        negativeMarks: negativeMarks ? parseFloat(negativeMarks) : null,
        questions: {
          create: questionsWithImages,
        },
        cutoffs: cutoffRows.length
          ? {
              create: cutoffRows,
            }
          : undefined,
      },
      include: {
        questions: true,
        cutoffs: {
          orderBy: { year: 'desc' },
        },
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { quiz: newQuiz }, "Quiz added successfully"));
  } catch (error) {
    console.error("Quiz Upload Error:", error);
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
    const { id } = req.params;
    const quizId = Number(id);
    const user = req.user;
    
    // Validate quiz ID
    if (!id || !Number.isInteger(quizId)) {
      return next(new ApiError(400, "Valid quiz ID is required"));
    }
    
    if(!user || user.isAdmin !==1){
        return next(new ApiError(403, "Only admins can update quizzes"));
    }
    // 1. Parse the JSON string from form-data (consistent with addQuiz)
    const data = JSON.parse(req.body.quizData);
    const {
      title,
      description,
      subject,
      examYear,
      educationLevel,
      isActive,
      isPaid,
      price,
      timeLimit,
      hasNegativeMarking,
      negativeMarks,
      questions,
      cutoffs = [],
    } = data;

    if (title) {
      const existingQuiz = await prisma.quiz.findUnique({
        where: { title },
        select: { id: true },
      });
      if (existingQuiz && existingQuiz.id !== quizId) {
        return next(new ApiError(409, "A quiz with this title already exists"));
      }
    }

    // 2. Process Questions and handle new image uploads
    const questionsWithImages = await Promise.all(
      questions.map(async (q, index) => {
        let finalImageUrl = q.imageUrl; // Default to existing URL if provided

        // Check if a new file is uploaded for this index (image_0, image_1, etc.)
        const file = req.files?.find((f) => f.fieldname === `image_${index}`);

        if (file) {
          const uploadResult = await uploadImage(file.path);
          finalImageUrl = uploadResult; // Update with new Cloudinary URL

          // Clean up local temp file
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        return {
          questionOrder: index + 1,
          questionText: q.questionText,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          isCorrect: parseInt(q.isCorrect),
          explanation: q.explanation || null,
          imageUrl: finalImageUrl || null,
        };
      })
    );

    const cutoffRows = Array.isArray(cutoffs)
      ? cutoffs.map(normalizeCutoffRow).filter(Boolean)
      : [];

    // 3. Database Transaction
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Delete old questions first (Replace strategy)
      await tx.question.deleteMany({
        where: { quizId },
      });

      await tx.quizCutoff.deleteMany({
        where: { quizId },
      });

      // Update Quiz and recreate all questions
      return await tx.quiz.update({
        where: { id: quizId },
        data: {
          title,
          description,
          subject,
          examYear: parseInt(examYear),
          educationLevel: educationLevel || 'undergrad', // Default to undergrad if empty
          isActive: isActive !== undefined ? isActive : true,
          isPaid: isPaid || false,
          timeLimit: timeLimit ? parseInt(timeLimit) : null,
          price: price ? parseFloat(price) : 0,
          hasNegativeMarking: hasNegativeMarking || false,
          negativeMarks: negativeMarks ? parseFloat(negativeMarks) : null,
          questions: {
            create: questionsWithImages,
          },
          cutoffs: cutoffRows.length
            ? {
                create: cutoffRows,
              }
            : undefined,
        },
        include: {
          questions: true,
          cutoffs: {
            orderBy: { year: 'desc' },
          },
        },
      });
    });

    return res
      .status(200)
      .json(new ApiResponse(200, { quiz: updatedQuiz }, "Quiz updated successfully"));
  } catch (error) {
    console.error("Update Quiz Error:", error);
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

    const user = req.user;

    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can view all users"));
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
   
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: {
              quizAttempts: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    // Format users with attempt count
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      attemptCount: user._count.quizAttempts
    }));

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: formattedUsers,
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
    const user = req.user;
    console.log("Admin User:", user);
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

/**
 * Delete a quiz by ID
 * @route DELETE /api/admin/delete-quiz/:quizId
 * @access Admin only
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can delete quizzes"));
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: { questions: true }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    // Delete quiz (questions will be deleted automatically due to cascade)
    await prisma.quiz.delete({
      where: { id: parseInt(quizId) }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Quiz deleted successfully"));
  } catch (error) {
    console.error("Delete Quiz Error:", error);
    return next(new ApiError(500, error.message || "Error deleting quiz"));
  }
};

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard-stats
 * @access Admin only
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can view dashboard stats"));
    }

    // Get all statistics in parallel
    const [totalUsers, totalQuizzes, freeQuizzes, paidQuizzes, totalAttempts, recentActiveUsers] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total quizzes count
      prisma.quiz.count(),
      
      // Free quizzes count
      prisma.quiz.count({
        where: { isPaid: false }
      }),
      
      // Paid quizzes count
      prisma.quiz.count({
        where: { isPaid: true }
      }),
      
      // Total quiz attempts
      prisma.quizAttempt.count(),
      
      // Active users (users who made attempts in last 30 days)
      prisma.quizAttempt.findMany({
        where: {
          attemptedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      })
    ]);

    const activeUsers = recentActiveUsers.length;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalUsers,
          totalQuizzes,
          freeQuizzes,
          paidQuizzes,
          totalAttempts,
          activeUsers
        },
        "Dashboard stats retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return next(new ApiError(500, error.message || "Error retrieving dashboard stats"));
  }
};

/**
 * Get quiz by ID for admin editing (includes all fields including explanation and correct answers)
 * @route GET /api/admin/quiz/:id
 * @access Admin only
 */
export const getQuizByIdForAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const { id } = req.params;
    const quizId = parseInt(id);

    if (!quizId || isNaN(quizId)) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        cutoffs: {
          orderBy: {
            year: 'desc'
          }
        },
        questions: {
          select: {
            id: true,
            questionOrder: true,
            questionText: true,
            option1: true,
            option2: true,
            option3: true,
            option4: true,
            isCorrect: true,
            explanation: true,
            imageUrl: true
          },
          orderBy: {
            questionOrder: 'asc'
          }
        }
      }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    return res.status(200).json(
      new ApiResponse(200, quiz, "Quiz retrieved successfully")
    );
  } catch (error) {
    console.error("Get Quiz By ID Error:", error);
    return next(new ApiError(500, error.message || "Error retrieving quiz"));
  }
};

export const getAllCutoffs = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const { quizId } = req.query;
    const where = {};

    if (quizId) {
      where.quizId = parseInt(quizId);
    }

    const cutoffs = await prisma.quizCutoff.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            examYear: true,
            educationLevel: true,
          },
        },
      },
      orderBy: [
        { quizId: 'asc' },
        { year: 'desc' },
      ],
    });

    return res.status(200).json(
      new ApiResponse(200, { cutoffs }, "Cutoffs retrieved successfully")
    );
  } catch (error) {
    console.error("Get All Cutoffs Error:", error);
    return next(new ApiError(500, error.message || "Error retrieving cutoffs"));
  }
};

export const addCutoff = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const {
      quizId,
      year,
      ...rest
    } = req.body || {};

    const quizIdNum = parseInt(quizId);
    const yearNum = parseInt(year);

    if (!Number.isInteger(quizIdNum) || !Number.isInteger(yearNum)) {
      return next(new ApiError(400, "quizId and year are required"));
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizIdNum }, select: { id: true } });
    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    const data = { quizId: quizIdNum, year: yearNum };
    for (const field of CUTOFF_FIELDS) {
      data[field] = parseCutoffValue(rest[field]);
    }

    const created = await prisma.quizCutoff.create({ data });

    return res.status(201).json(
      new ApiResponse(201, created, "Cutoff added successfully")
    );
  } catch (error) {
    console.error("Add Cutoff Error:", error);
    return next(new ApiError(500, error.message || "Error adding cutoff"));
  }
};

export const updateCutoff = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const cutoffId = parseInt(req.params.id);
    if (!Number.isInteger(cutoffId)) {
      return next(new ApiError(400, "Valid cutoff ID is required"));
    }

    const existing = await prisma.quizCutoff.findUnique({ where: { id: cutoffId } });
    if (!existing) {
      return next(new ApiError(404, "Cutoff not found"));
    }

    const { year, ...rest } = req.body || {};
    const data = {};

    if (year !== undefined) {
      const yearNum = parseInt(year);
      if (!Number.isInteger(yearNum)) {
        return next(new ApiError(400, "Valid year is required"));
      }
      data.year = yearNum;
    }

    for (const field of CUTOFF_FIELDS) {
      if (rest[field] !== undefined) {
        data[field] = parseCutoffValue(rest[field]);
      }
    }

    const updated = await prisma.quizCutoff.update({
      where: { id: cutoffId },
      data,
    });

    return res.status(200).json(
      new ApiResponse(200, updated, "Cutoff updated successfully")
    );
  } catch (error) {
    console.error("Update Cutoff Error:", error);
    return next(new ApiError(500, error.message || "Error updating cutoff"));
  }
};

export const deleteCutoff = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const cutoffId = parseInt(req.params.id);
    if (!Number.isInteger(cutoffId)) {
      return next(new ApiError(400, "Valid cutoff ID is required"));
    }

    await prisma.quizCutoff.delete({ where: { id: cutoffId } });

    return res.status(200).json(
      new ApiResponse(200, null, "Cutoff deleted successfully")
    );
  } catch (error) {
    console.error("Delete Cutoff Error:", error);
    return next(new ApiError(500, error.message || "Error deleting cutoff"));
  }
};

/**
 * Get all quiz attempts (Admin only)
 * @route GET /api/admin/attempts
 * @access Admin only
 */
export const getAllAttempts = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can access this endpoint"));
    }

    const { page = 1, limit = 20, quizId, userId } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (quizId) where.quizId = parseInt(quizId);
    if (userId) where.userId = parseInt(userId);

    // Get total count and attempts in parallel
    const [totalAttempts, attempts] = await Promise.all([
      prisma.quizAttempt.count({ where }),
      prisma.quizAttempt.findMany({
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
          attemptedAt: 'desc'
        }
      })
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        attempts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalAttempts / limitNum),
          totalAttempts,
          limit: limitNum
        }
      }, "Attempts retrieved successfully")
    );
  } catch (error) {
    console.error("Get All Attempts Error:", error);
    return next(new ApiError(500, error.message || "Error retrieving attempts"));
  }
};

/**
 * Delete a quiz attempt (Admin only)
 * @route DELETE /api/admin/attempts/:id
 * @access Admin only
 */
export const deleteAttempt = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can delete attempts"));
    }

    const { id } = req.params;
    const attemptId = parseInt(id);

    if (!attemptId || isNaN(attemptId)) {
      return next(new ApiError(400, "Invalid attempt ID"));
    }

    // Check if attempt exists
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId }
    });

    if (!attempt) {
      return next(new ApiError(404, "Attempt not found"));
    }

    // Delete the attempt
    await prisma.quizAttempt.delete({
      where: { id: attemptId }
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Attempt deleted successfully")
    );
  } catch (error) {
    console.error("Delete Attempt Error:", error);
    return next(new ApiError(500, error.message || "Error deleting attempt"));
  }
};

/**
 * Grant quiz access to a user (Admin only)
 * @route POST /api/admin/grant-access
 * @access Admin only
 */
export const grantQuizAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can grant quiz access"));
    }

    const { userId, quizId } = req.body;

    if (!userId || !quizId) {
      return next(new ApiError(400, "User ID and Quiz ID are required"));
    }

    const userIdNum = parseInt(userId);
    const quizIdNum = parseInt(quizId);

    if (isNaN(userIdNum) || isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid User ID or Quiz ID"));
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    if (!targetUser) {
      return next(new ApiError(404, "User not found"));
    }

    // Check if quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizIdNum }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    // Check if access already granted
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_quizId: {
          userId: userIdNum,
          quizId: quizIdNum
        }
      }
    });

    if (existingPurchase) {
      return next(new ApiError(400, "User already has access to this quiz"));
    }

    // Grant access by creating a purchase record with amount 0 (admin granted)
    const purchase = await prisma.purchase.create({
      data: {
        userId: userIdNum,
        quizId: quizIdNum,
        amount: 0, // Admin granted access, no payment
        status: "completed"
      }
    });

    // Update user's purchasedExams array
    const purchasedExams = typeof targetUser.purchasedExams === 'string' 
      ? JSON.parse(targetUser.purchasedExams) 
      : targetUser.purchasedExams;
    
    if (!purchasedExams.includes(quizIdNum)) {
      purchasedExams.push(quizIdNum);
      
      await prisma.user.update({
        where: { id: userIdNum },
        data: {
          purchasedExams: JSON.stringify(purchasedExams)
        }
      });
    }

    return res.status(201).json(
      new ApiResponse(201, {
        purchase: {
          id: purchase.id,
          userId: userIdNum,
          quizId: quizIdNum,
          quizTitle: quiz.title,
          grantedBy: user.email
        }
      }, "Quiz access granted successfully")
    );
  } catch (error) {
    console.error("Grant Quiz Access Error:", error);
    return next(new ApiError(500, error.message || "Error granting quiz access"));
  }
};

/**
 * Toggle quiz visibility (isActive)
 * @route PUT /api/admin/quiz/:quizId/toggle-visibility
 * @access Admin only
 */
export const toggleQuizVisibility = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can toggle quiz visibility"));
    }

    const { quizId } = req.params;
    const quizIdNum = parseInt(quizId);

    if (isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid Quiz ID"));
    }

    // Get current quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizIdNum }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    // Toggle isActive
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizIdNum },
      data: {
        isActive: !quiz.isActive
      },
      select: {
        id: true,
        title: true,
        isActive: true
      }
    });

    console.log(`Quiz ${quizIdNum} visibility toggled to isActive: ${updatedQuiz.isActive}`);

    return res.status(200).json(
      new ApiResponse(200, {
        quiz: updatedQuiz
      }, `Quiz ${updatedQuiz.isActive ? 'shown' : 'hidden'} successfully`)
    );
  } catch (error) {
    console.error("Toggle Quiz Visibility Error:", error);
    return next(new ApiError(500, error.message || "Error toggling quiz visibility"));
  }
};

/**
 * Revoke quiz access from a user
 * @route DELETE /api/admin/revoke-access
 * @access Admin only
 */
export const revokeQuizAccess = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can revoke quiz access"));
    }

    const { userId, quizId } = req.body;

    if (!userId || !quizId) {
      return next(new ApiError(400, "User ID and Quiz ID are required"));
    }

    const userIdNum = parseInt(userId);
    const quizIdNum = parseInt(quizId);

    if (isNaN(userIdNum) || isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid User ID or Quiz ID"));
    }

    // Check if purchase exists
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_quizId: {
          userId: userIdNum,
          quizId: quizIdNum
        }
      },
      include: {
        user: { select: { email: true } },
        quiz: { select: { title: true } }
      }
    });

    if (!purchase) {
      return next(new ApiError(404, "Access record not found"));
    }

    // Delete purchase record
    await prisma.purchase.delete({
      where: {
        userId_quizId: {
          userId: userIdNum,
          quizId: quizIdNum
        }
      }
    });

    // Update user's purchasedExams array
    const targetUser = await prisma.user.findUnique({
      where: { id: userIdNum }
    });

    const purchasedExams = typeof targetUser.purchasedExams === 'string' 
      ? JSON.parse(targetUser.purchasedExams) 
      : targetUser.purchasedExams;
    
    const updatedExams = purchasedExams.filter(id => id !== quizIdNum);
    
    await prisma.user.update({
      where: { id: userIdNum },
      data: {
        purchasedExams: JSON.stringify(updatedExams)
      }
    });

    return res.status(200).json(
      new ApiResponse(200, {
        userId: userIdNum,
        quizId: quizIdNum,
        userEmail: purchase.user.email,
        quizTitle: purchase.quiz.title
      }, "Quiz access revoked successfully")
    );
  } catch (error) {
    console.error("Revoke Quiz Access Error:", error);
    return next(new ApiError(500, error.message || "Error revoking quiz access"));
  }
};

/**
 * Get all granted accesses with pagination
 * @route GET /api/admin/granted-accesses
 * @access Admin only
 */
export const getGrantedAccesses = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user || user.isAdmin !== 1) {
      return next(new ApiError(403, "Only admins can view granted accesses"));
    }

    const { page = 1, limit = 20, userId, quizId } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      amount: 0 // Only show admin-granted accesses (amount = 0)
    };

    if (userId) {
      where.userId = parseInt(userId);
    }

    if (quizId) {
      where.quizId = parseInt(quizId);
    }

    const [total, accesses] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        skip,
        take: limitNum,
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
              title: true,
              subject: true,
              isPaid: true
            }
          }
        },
        orderBy: {
          purchasedAt: 'desc'
        }
      })
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        accesses: accesses.map(a => ({
          id: a.id,
          userId: a.userId,
          userEmail: a.user.email,
          quizId: a.quizId,
          quizTitle: a.quiz.title,
          quizSubject: a.quiz.subject,
          isPaid: a.quiz.isPaid,
          grantedAt: a.purchasedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }, "Granted accesses retrieved successfully")
    );
  } catch (error) {
    console.error("Get Granted Accesses Error:", error);
    return next(new ApiError(500, error.message || "Error fetching granted accesses"));
  }
};
