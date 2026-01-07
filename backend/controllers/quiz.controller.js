import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { checkQuizAccess } from "./purchase.controller.js";

/**
 * API 1: Get all quizzes with pagination and filters
 * GET /api/quiz/list
 * Query params: page, limit, subject, year, search
 */
export const listQuizzes = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      subject, 
      year, 
      search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where = {
      isActive: true
    };

    if (subject) {
      where.subject = subject;
    }

    if (year) {
      where.examYear = parseInt(year);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const totalQuizzes = await prisma.quiz.count({ where });

    // Get quizzes with question count
    const quizzes = await prisma.quiz.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        examYear: true,
        isPaid: true,
        price: true,
        prize: true,
        createdAt: true,
        _count: {
          select: { questions: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const formattedQuizzes = quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      examYear: quiz.examYear,
      isPaid: quiz.isPaid,
      price: quiz.price,
      prize: quiz.prize,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt
    }));

    res.status(200).json(
      new ApiResponse(200, {
        quizzes: formattedQuizzes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalQuizzes / limitNum),
          totalQuizzes,
          limit: limitNum
        }
      }, "Quizzes fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching quizzes"));
  }
};

/**
 * API 2: Get single quiz with all questions (without correct answers)
 * Optional authentication - shows access status if authenticated
 */
export const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quizId = parseInt(id);
    const userId = req.user?.id; // Optional - may not be authenticated

    if (!quizId || isNaN(quizId)) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: quizId,
        isActive: true 
      },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            option1: true,
            option2: true,
            option3: true,
            option4: true,
            imageUrl: true
            // Note: isCorrect and explanation are intentionally excluded for security
          }
        }
      }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found or inactive"));
    }

    // Check access if user is authenticated
    let hasAccess = !quiz.isPaid; // Free quizzes are accessible to all
    let accessMessage = null;

    if (userId && quiz.isPaid) {
      const accessCheck = await checkQuizAccess(userId, quizId);
      hasAccess = accessCheck.hasAccess;
      accessMessage = accessCheck.reason;
    } else if (!userId && quiz.isPaid) {
      accessMessage = "Please login to purchase and access this quiz";
    }

    res.status(200).json(
      new ApiResponse(200, {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        examYear: quiz.examYear,
        isPaid: quiz.isPaid,
        price: quiz.price,
        prize: quiz.prize,
        questionCount: quiz.questions.length,
        hasAccess,
        accessMessage,
        questions: hasAccess ? quiz.questions : []
      }, hasAccess ? "Quiz fetched successfully" : "Purchase required to view questions")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching quiz"));
  }
};

/**
 * API 3: Get all unique subjects from active quizzes
 * GET /api/quiz/subjects
 */
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await prisma.quiz.findMany({
      where: { isActive: true },
      select: { subject: true },
      distinct: ['subject'],
      orderBy: { subject: 'asc' }
    });

    const subjectList = subjects.map(s => s.subject);

    res.status(200).json(
      new ApiResponse(200, { subjects: subjectList }, "Subjects fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching subjects"));
  }
};

/**
 * API 4: Get all unique exam years from active quizzes
 * GET /api/quiz/years
 */
export const getYears = async (req, res, next) => {
  try {
    const years = await prisma.quiz.findMany({
      where: { isActive: true },
      select: { examYear: true },
      distinct: ['examYear'],
      orderBy: { examYear: 'desc' }
    });

    const yearList = years.map(y => y.examYear);

    res.status(200).json(
      new ApiResponse(200, { years: yearList }, "Years fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching years"));
  }
};

/**
 * API 5: Submit quiz attempt and calculate results
 * POST /api/quiz/attempt/:quizId
 * Body: { answers: [{questionId: 1, selectedOption: 2}, ...], timeTaken: 300 }
 * Requires authentication
 */
export const submitQuizAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!quizId || isNaN(parseInt(quizId))) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return next(new ApiError(400, "Answers are required"));
    }

    const quizIdNum = parseInt(quizId);

    // Check if user has access to this quiz
    const accessCheck = await checkQuizAccess(userId, quizIdNum);
    
    if (!accessCheck.hasAccess) {
      return next(new ApiError(403, accessCheck.reason || "Access denied"));
    }

    // Fetch quiz with all questions
    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: quizIdNum,
        isActive: true 
      },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found or inactive"));
    }

    if (quiz.questions.length === 0) {
      return next(new ApiError(400, "Quiz has no questions"));
    }

    // Validate all question IDs exist
    const questionIds = quiz.questions.map(q => q.id);
    const invalidAnswers = answers.filter(a => !questionIds.includes(a.questionId));
    
    if (invalidAnswers.length > 0) {
      return next(new ApiError(400, "Invalid question IDs in answers"));
    }

    // Calculate score
    let correctAnswers = 0;
    let wrongAnswers = 0;
    const detailedResults = [];

    answers.forEach(userAnswer => {
      const question = quiz.questions.find(q => q.id === userAnswer.questionId);
      
      if (question) {
        const isCorrect = question.isCorrect === userAnswer.selectedOption;
        
        if (isCorrect) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }

        detailedResults.push({
          questionId: question.id,
          questionText: question.questionText,
          userAnswer: userAnswer.selectedOption,
          correctAnswer: question.isCorrect,
          isCorrect,
          explanation: question.explanation,
          options: {
            option1: question.option1,
            option2: question.option2,
            option3: question.option3,
            option4: question.option4
          }
        });
      }
    });

    const totalQuestions = quiz.questions.length;
    const unanswered = totalQuestions - answers.length;
    wrongAnswers += unanswered; // Count unanswered as wrong
    const percentage = (correctAnswers / totalQuestions) * 100;
    const score = Math.round(percentage);

    // Save attempt to database
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId: quizIdNum,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        percentage,
        timeTaken: timeTaken || null,
        answers: JSON.stringify(answers)
      }
    });

    res.status(201).json(
      new ApiResponse(201, {
        attemptId: quizAttempt.id,
        quizTitle: quiz.title,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unanswered,
        score,
        percentage: parseFloat(percentage.toFixed(2)),
        timeTaken,
        results: detailedResults,
        attemptedAt: quizAttempt.attemptedAt
      }, "Quiz submitted successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error submitting quiz"));
  }
};

/**
 * API 6: Get user's quiz attempt history
 * GET /api/quiz/my-attempts
 * Query params: page, limit, quizId
 * Requires authentication
 */
export const getUserAttempts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, quizId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };
    
    if (quizId) {
      where.quizId = parseInt(quizId);
    }

    // Get total count
    const totalAttempts = await prisma.quizAttempt.count({ where });

    // Get attempts with quiz details
    const attempts = await prisma.quizAttempt.findMany({
      where,
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
        attemptedAt: 'desc'
      }
    });

    const formattedAttempts = attempts.map(attempt => ({
      attemptId: attempt.id,
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
        subject: attempt.quiz.subject,
        examYear: attempt.quiz.examYear
      },
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken,
      attemptedAt: attempt.attemptedAt
    }));

    res.status(200).json(
      new ApiResponse(200, {
        attempts: formattedAttempts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalAttempts / limitNum),
          totalAttempts,
          limit: limitNum
        }
      }, "Attempt history fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching attempt history"));
  }
};

/**
 * API 7: Get user's overall quiz statistics
 * GET /api/quiz/stats
 * Requires authentication
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all user attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: {
        score: true,
        totalQuestions: true,
        correctAnswers: true,
        wrongAnswers: true,
        percentage: true,
        timeTaken: true,
        quiz: {
          select: {
            subject: true
          }
        }
      }
    });

    if (attempts.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, {
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          totalQuestionsAttempted: 0,
          totalCorrect: 0,
          totalWrong: 0,
          bestScore: 0,
          worstScore: 0,
          subjectWiseStats: []
        }, "No attempts found")
      );
    }

    // Calculate overall stats
    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const totalPercentage = attempts.reduce((sum, a) => sum + a.percentage, 0);
    const totalQuestionsAttempted = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalWrong = attempts.reduce((sum, a) => sum + a.wrongAnswers, 0);
    const averageScore = Math.round(totalScore / totalAttempts);
    const averagePercentage = parseFloat((totalPercentage / totalAttempts).toFixed(2));
    const bestScore = Math.max(...attempts.map(a => a.score));
    const worstScore = Math.min(...attempts.map(a => a.score));

    // Calculate subject-wise stats
    const subjectStats = {};
    attempts.forEach(attempt => {
      const subject = attempt.quiz.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          subject,
          attempts: 0,
          totalScore: 0,
          totalCorrect: 0,
          totalWrong: 0,
          totalQuestions: 0
        };
      }
      subjectStats[subject].attempts++;
      subjectStats[subject].totalScore += attempt.score;
      subjectStats[subject].totalCorrect += attempt.correctAnswers;
      subjectStats[subject].totalWrong += attempt.wrongAnswers;
      subjectStats[subject].totalQuestions += attempt.totalQuestions;
    });

    const subjectWiseStats = Object.values(subjectStats).map(stat => ({
      subject: stat.subject,
      attempts: stat.attempts,
      averageScore: Math.round(stat.totalScore / stat.attempts),
      totalCorrect: stat.totalCorrect,
      totalWrong: stat.totalWrong,
      accuracy: parseFloat(((stat.totalCorrect / stat.totalQuestions) * 100).toFixed(2))
    }));

    res.status(200).json(
      new ApiResponse(200, {
        totalAttempts,
        averageScore,
        averagePercentage,
        totalQuestionsAttempted,
        totalCorrect,
        totalWrong,
        overallAccuracy: parseFloat(((totalCorrect / totalQuestionsAttempted) * 100).toFixed(2)),
        bestScore,
        worstScore,
        subjectWiseStats
      }, "User stats fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching user stats"));
  }
};

/**
 * API 8: Get leaderboard for a specific quiz
 * GET /api/quiz/leaderboard/:quizId
 * Query params: limit (default: 10)
 */
export const getQuizLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;

    const quizIdNum = parseInt(quizId);
    const limitNum = parseInt(limit);

    if (!quizIdNum || isNaN(quizIdNum)) {
      return next(new ApiError(400, "Invalid quiz ID"));
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizIdNum },
      select: { id: true, title: true }
    });

    if (!quiz) {
      return next(new ApiError(404, "Quiz not found"));
    }

    // Get top attempts for this quiz (best attempt per user)
    const topAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: quizIdNum },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeTaken: 'asc' },
        { attemptedAt: 'asc' }
      ]
    });

    // Get best attempt per user
    const userBestAttempts = new Map();
    topAttempts.forEach(attempt => {
      const userId = attempt.userId;
      if (!userBestAttempts.has(userId)) {
        userBestAttempts.set(userId, attempt);
      } else {
        const existing = userBestAttempts.get(userId);
        if (attempt.score > existing.score || 
           (attempt.score === existing.score && (attempt.timeTaken || 0) < (existing.timeTaken || 0))) {
          userBestAttempts.set(userId, attempt);
        }
      }
    });

    // Convert to array and sort
    const leaderboard = Array.from(userBestAttempts.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeTaken || Infinity) - (b.timeTaken || Infinity);
      })
      .slice(0, limitNum)
      .map((attempt, index) => ({
        rank: index + 1,
        userId: attempt.user.id,
        userEmail: attempt.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Mask email
        score: attempt.score,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        attemptedAt: attempt.attemptedAt
      }));

    res.status(200).json(
      new ApiResponse(200, {
        quizId: quiz.id,
        quizTitle: quiz.title,
        leaderboard
      }, "Leaderboard fetched successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching leaderboard"));
  }
};
