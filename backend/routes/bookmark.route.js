import express from "express";
import { addBookmark, listBookmarks, removeBookmark } from "../controllers/bookmark.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/", verifyToken, generalLimiter, listBookmarks);
router.put("/:questionId", verifyToken, generalLimiter, addBookmark);
router.delete("/:questionId", verifyToken, generalLimiter, removeBookmark);

export default router;
