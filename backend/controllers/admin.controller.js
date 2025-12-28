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
    const {user}= req.body;
    // if(!user || user.isAdmin !==1){
    //     return next(new ApiError(403, "Only admins can add quizzes"));
    // }
    const data = JSON.parse(req.body.quizData);
 
    const {
      title,
      description,
      subject,
      examYear,
      createdBy,
      isActive,
      isPaid,
      price,
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
        }
      })
    );

    // 3. Save to Database
    const newQuiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subject,
        examYear: parseInt(examYear),
        createdBy: parseInt(createdBy),
        isActive: isActive !== undefined ? isActive : true,
        isPaid: isPaid || false,
        price: price ? parseFloat(price) : 0,
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

    // 1. Parse the JSON string from form-data (consistent with addQuiz)
    const data = JSON.parse(req.body.quizData);
    const {
      title,
      description,
      subject,
      examYear,
      isActive,
      isPaid,
      price,
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
          isActive: isActive !== undefined ? isActive : true,
          isPaid: isPaid || false,
          price: price ? parseFloat(price) : 0,
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
