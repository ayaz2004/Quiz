import { Router } from "express";
import { verifyToken } from "../middlewares/verifyUser.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import {
  askQuestion,
  getMyQuestions,
  getAllQuestions,
  answerQuestion,
  deleteQuestion,
  getQAStats
} from "../controllers/qa.controller.js";

const router = Router();

// User routes
router.post("/ask", askQuestion);
router.get("/my-questions", verifyToken, getMyQuestions);

// Admin routes - require both authentication AND admin privileges
router.get("/admin/questions", verifyToken, verifyAdmin, getAllQuestions);
router.post("/admin/answer/:id", verifyToken, verifyAdmin, answerQuestion);
router.delete("/admin/questions/:id", verifyToken, verifyAdmin, deleteQuestion);
router.get("/admin/stats", verifyToken, verifyAdmin, getQAStats);

export default router;
