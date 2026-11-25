import express from "express";
import { getStudyProfile, updateStudyProfile } from "../controllers/studyProfile.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/", verifyToken, generalLimiter, getStudyProfile);
router.put("/", verifyToken, generalLimiter, updateStudyProfile);

export default router;
