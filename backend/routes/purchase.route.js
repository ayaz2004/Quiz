import express from "express";
import { 
  getUserPurchases,
  checkUserAccess,
  getMyQuizzes
} from "../controllers/purchase.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// All purchase routes require authentication
// Note: User purchase route removed - only admin can grant access
router.get("/my-purchases", verifyToken, generalLimiter, getUserPurchases);
router.get("/check-access/:quizId", verifyToken, generalLimiter, checkUserAccess);
router.get("/my-quizzes", verifyToken, generalLimiter, getMyQuizzes);

export default router;
