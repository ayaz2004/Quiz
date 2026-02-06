import prisma from "../config/db.config.js";
import { ApiError } from "../utils/error.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadImage } from "../utils/cloudinary.js";
import fs from "fs";
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
    } = data;
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
      },
      include: {
        questions: true,
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
    const user = req.user;
    
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
    } = data;

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

    // 3. Database Transaction
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Delete old questions first (Replace strategy)
      await tx.question.deleteMany({
        where: { quizId: parseInt(id) },
      });

      // Update Quiz and recreate all questions
      return await tx.quiz.update({
        where: { id: parseInt(id) },
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
        },
        include: { questions: true },
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
        questions: {
          select: {
            id: true,
            questionText: true,
            option1: true,
            option2: true,
            option3: true,
            option4: true,
            isCorrect: true,
            explanation: true,
            imageUrl: true
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
