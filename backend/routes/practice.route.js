import express from "express";
import { getPracticeQuestions, getReviewQueue, syncResponses } from "../controllers/practice.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter, practiceSyncLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/questions", verifyToken, generalLimiter, getPracticeQuestions);
router.post("/responses", verifyToken, practiceSyncLimiter, syncResponses);
router.get("/review", verifyToken, generalLimiter, getReviewQueue);

export default router;
