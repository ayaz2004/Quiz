import { ApiError } from "./error.js";

/**
 * Middleware to validate quiz creation data
 * Expects req.body.quizData as a JSON string
 */
export const validateQuiz = (req, res, next) => {
  try {
    // Check if quizData exists
    if (!req.body.quizData) {
      return next(new ApiError(400, "quizData field is required"));
    }

    // Parse the JSON string
    let quiz;
    try {
      quiz = JSON.parse(req.body.quizData);
    } catch (parseError) {
      return next(new ApiError(400, "quizData must be valid JSON string"));
    }

    console.log("Parsed Quiz Data:", quiz);

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

    // Validate isPaid (optional, defaults to false)
    if (quiz.isPaid !== undefined && typeof quiz.isPaid !== "boolean") {
      return next(new ApiError(400, "isPaid must be a boolean"));
    }

    // Validate price if isPaid is true
    if (quiz.isPaid && quiz.price !== undefined) {
      const price = parseFloat(quiz.price);
      if (isNaN(price) || price < 0) {
        return next(new ApiError(400, "Price must be a non-negative number"));
      }
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
 * Expects req.body.quizData as a JSON string
 */
export const validateQuizUpdate = (req, res, next) => {
  try {
    // Check if quizData exists
    if (!req.body.quizData) {
      return next(new ApiError(400, "quizData field is required"));
    }

    // Parse the JSON string
    let quiz;
    try {
      quiz = JSON.parse(req.body.quizData);
    } catch (parseError) {
      return next(new ApiError(400, "quizData must be valid JSON string"));
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

    if (quiz.isPaid !== undefined && typeof quiz.isPaid !== "boolean") {
      return next(new ApiError(400, "isPaid must be a boolean"));
    }

    if (quiz.price !== undefined) {
      const price = parseFloat(quiz.price);
      if (isNaN(price) || price < 0) {
        return next(new ApiError(400, "Price must be a non-negative number"));
      }
    }

    // Validate questions if provided
    if (quiz.questions !== undefined) {
      if (!Array.isArray(quiz.questions)) {
        return next(new ApiError(400, "Questions must be an array"));
      }
      if (quiz.questions.length === 0) {
        return next(new ApiError(400, "Quiz must contain at least one question"));
      }

      // Validate each question
      for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i];
        const questionNum = i + 1;

        if (!question.questionText || typeof question.questionText !== "string") {
          return next(new ApiError(400, `Question ${questionNum}: Question text is required`));
        }

        if (!question.option1 || !question.option2 || !question.option3 || !question.option4) {
          return next(new ApiError(400, `Question ${questionNum}: All 4 options are required`));
        }

        const correctAnswer = parseInt(question.isCorrect);
        if (isNaN(correctAnswer) || ![1, 2, 3, 4].includes(correctAnswer)) {
          return next(new ApiError(400, `Question ${questionNum}: isCorrect must be 1, 2, 3, or 4`));
        }
      }
    }

    next();
  } catch (error) {
    return next(new ApiError(500, `Validation error: ${error.message}`));
  }
};
