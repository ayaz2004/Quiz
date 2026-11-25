import express from "express";
import { registerDevice, unregisterDevice } from "../controllers/device.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", verifyToken, generalLimiter, registerDevice);
router.delete("/", verifyToken, generalLimiter, unregisterDevice);

export default router;
