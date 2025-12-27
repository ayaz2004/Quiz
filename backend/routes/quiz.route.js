import express from "express";
import { 
  listQuizzes, 
  getQuizById, 
  getSubjects, 
  getYears,
  submitQuizAttempt,
  getUserAttempts,
  getUserStats,
  getQuizLeaderboard
} from "../controllers/quiz.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { generalLimiter, quizAttemptLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public routes - with general rate limiting
router.get("/list", generalLimiter, listQuizzes);
router.get("/subjects", generalLimiter, getSubjects);
router.get("/years", generalLimiter, getYears);
router.get("/leaderboard/:quizId", generalLimiter, getQuizLeaderboard);

// Protected routes - require authentication
router.get("/my-attempts", verifyToken, generalLimiter, getUserAttempts);
router.get("/stats", verifyToken, generalLimiter, getUserStats);
router.post("/attempt/:quizId", verifyToken, quizAttemptLimiter, submitQuizAttempt);

// Optional auth - shows different data based on login status
router.get("/:id", optionalAuth, generalLimiter, getQuizById);


//////////////////////////////////Admin Routes////////////////////////////////////// 

export default router;
