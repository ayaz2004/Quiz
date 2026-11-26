import { createUser, signInUser, logoutUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword, resendVerificationEmail, getCurrentUser, updateProfile, uploadProfilePhoto, removeProfilePhoto, getEntitlements, changePassword, deleteAccount } from "../controllers/user.controller.js";
import express from "express";
import { verifyToken } from "../middlewares/verifyUser.js";
import upload from "../middlewares/multer.js";
import { authLimiter, loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/add", authLimiter, createUser);
router.post("/signin", loginLimiter, signInUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyToken, getCurrentUser);
router.delete("/me", verifyToken, deleteAccount);
router.post("/me/photo", verifyToken, upload.single("photo"), uploadProfilePhoto);
router.delete("/me/photo", verifyToken, removeProfilePhoto);
router.get("/me/entitlements", verifyToken, getEntitlements);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", authLimiter, resendVerificationEmail);


export default router;
