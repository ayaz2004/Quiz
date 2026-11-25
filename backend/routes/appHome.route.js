import express from "express";
import { getAppHome } from "../controllers/appHome.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/home", verifyToken, generalLimiter, getAppHome);

export default router;
