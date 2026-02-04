import { Router } from "express";
import {
  submitSuggestion,
  getMySuggestions
} from "../controllers/suggestion.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// User routes - require authentication
router.post("/", verifyToken, generalLimiter, submitSuggestion);
router.get("/my-suggestions", verifyToken, generalLimiter, getMySuggestions);

export default router;
