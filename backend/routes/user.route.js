import { createUser, signInUser, logoutUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword, resendVerificationEmail, getCurrentUser, updateProfile, changePassword, deleteAccount } from "../controllers/user.controller.js";
import express from "express";
import { verifyToken } from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/add",createUser);
router.post("/signin", signInUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshAccessToken);
router.get("/me", verifyToken, getCurrentUser);
router.delete("/me", verifyToken, deleteAccount);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);


export default router;