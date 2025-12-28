import { ApiError } from "./error.js";

/**
 * Middleware to validate quiz creation data
 */
export const validateQuiz = (req, res, next) => {
  try {
    const { quiz } = req.body;

    // Check if quiz object exists
    if (!quiz) {
      return next(new ApiError(400, "Quiz data is required"));
    }
    console.log(quiz);
    // Validate title
    if (!quiz.title || typeof quiz.title !== "string") {
      return next(new ApiError(400, "Quiz title is required and must be a string"));
    }
    if (quiz.title.trim().length === 0) {
      return next(new ApiError(400, "Quiz title cannot be empty"));
    }
    if (quiz.title.length > 100) {
      return next(new ApiError(400, "Quiz title must not exceed 100 characters"));
    }

    // Validate description
    if (!quiz.description || typeof quiz.description !== "string") {
      return next(new ApiError(400, "Quiz description is required and must be a string"));
    }
    if (quiz.description.trim().length === 0) {
      return next(new ApiError(400, "Quiz description cannot be empty"));
    }

    // Validate subject
    if (!quiz.subject || typeof quiz.subject !== "string") {
      return next(new ApiError(400, "Subject is required and must be a string"));
    }
    if (quiz.subject.length > 100) {
      return next(new ApiError(400, "Subject must not exceed 100 characters"));
    }

    // Validate examYear
    if (!quiz.examYear) {
      return next(new ApiError(400, "Exam year is required"));
    }
    const year = parseInt(quiz.examYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
      return next(new ApiError(400, "Invalid exam year"));
    }

    // Validate createdBy
    if (!quiz.createdBy) {
      return next(new ApiError(400, "Creator ID (createdBy) is required"));
    }
    const createdBy = parseInt(quiz.createdBy);
    if (isNaN(createdBy) || createdBy <= 0) {
      return next(new ApiError(400, "Invalid creator ID"));
    }

    // Validate isActive (optional, defaults to true)
    if (quiz.isActive !== undefined && typeof quiz.isActive !== "boolean") {
      return next(new ApiError(400, "isActive must be a boolean"));
    }

    // Validate questions array
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      return next(new ApiError(400, "Questions array is required"));
    }
    if (quiz.questions.length === 0) {
      return next(new ApiError(400, "Quiz must contain at least one question"));
    }

    // Validate each question
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const questionNum = i + 1;

      // Validate questionText
      if (!question.questionText || typeof question.questionText !== "string") {
        return next(new ApiError(400, `Question ${questionNum}: Question text is required and must be a string`));
      }
      if (question.questionText.trim().length === 0) {
        return next(new ApiError(400, `Question ${questionNum}: Question text cannot be empty`));
      }

      // Validate options
      if (!question.option1 || typeof question.option1 !== "string" || question.option1.trim().length === 0) {
        return next(new ApiError(400, `Question ${questionNum}: Option 1 is required and must be a non-empty string`));
      }
      if (!question.option2 || typeof question.option2 !== "string" || question.option2.trim().length === 0) {
        return next(new ApiError(400, `Question ${questionNum}: Option 2 is required and must be a non-empty string`));
      }
      if (!question.option3 || typeof question.option3 !== "string" || question.option3.trim().length === 0) {
        return next(new ApiError(400, `Question ${questionNum}: Option 3 is required and must be a non-empty string`));
      }
      if (!question.option4 || typeof question.option4 !== "string" || question.option4.trim().length === 0) {
        return next(new ApiError(400, `Question ${questionNum}: Option 4 is required and must be a non-empty string`));
      }

      // Validate isCorrect (must be 1, 2, 3, or 4)
      if (!question.isCorrect) {
        return next(new ApiError(400, `Question ${questionNum}: Correct answer (isCorrect) is required`));
      }
      const correctAnswer = parseInt(question.isCorrect);
      if (isNaN(correctAnswer) || ![1, 2, 3, 4].includes(correctAnswer)) {
        return next(new ApiError(400, `Question ${questionNum}: isCorrect must be 1, 2, 3, or 4`));
      }

      // Validate explanation (optional)
      if (question.explanation !== undefined && question.explanation !== null) {
        if (typeof question.explanation !== "string") {
          return next(new ApiError(400, `Question ${questionNum}: Explanation must be a string`));
        }
      }

      // Validate imageUrl (optional)
      if (question.imageUrl !== undefined && question.imageUrl !== null) {
        if (typeof question.imageUrl !== "string") {
          return next(new ApiError(400, `Question ${questionNum}: Image URL must be a string`));
        }
        // Basic URL validation
        try {
          new URL(question.imageUrl);
        } catch (e) {
          return next(new ApiError(400, `Question ${questionNum}: Invalid image URL format`));
        }
      }
    }

    // If all validations pass, proceed to next middleware
    next();
  } catch (error) {
    return next(new ApiError(500, `Validation error: ${error.message}`));
  }
};

/**
 * Middleware to validate quiz update data
 */
export const validateQuizUpdate = (req, res, next) => {
  try {
    const { quiz } = req.body;

    if (!quiz) {
      return next(new ApiError(400, "Quiz data is required"));
    }

    // For updates, fields are optional but must be valid if provided
    if (quiz.title !== undefined) {
      if (typeof quiz.title !== "string" || quiz.title.trim().length === 0) {
        return next(new ApiError(400, "Quiz title must be a non-empty string"));
      }
      if (quiz.title.length > 100) {
        return next(new ApiError(400, "Quiz title must not exceed 100 characters"));
      }
    }

    if (quiz.description !== undefined) {
      if (typeof quiz.description !== "string" || quiz.description.trim().length === 0) {
        return next(new ApiError(400, "Quiz description must be a non-empty string"));
      }
    }

    if (quiz.subject !== undefined) {
      if (typeof quiz.subject !== "string" || quiz.subject.trim().length === 0) {
        return next(new ApiError(400, "Subject must be a non-empty string"));
      }
      if (quiz.subject.length > 100) {
        return next(new ApiError(400, "Subject must not exceed 100 characters"));
      }
    }

    if (quiz.examYear !== undefined) {
      const year = parseInt(quiz.examYear);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 5) {
        return next(new ApiError(400, "Invalid exam year"));
      }
    }

    if (quiz.isActive !== undefined && typeof quiz.isActive !== "boolean") {
      return next(new ApiError(400, "isActive must be a boolean"));
    }

    next();
  } catch (error) {
    return next(new ApiError(500, `Validation error: ${error.message}`));
  }
};
