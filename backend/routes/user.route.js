import { createUser, signInUser, logoutUser, verifyEmail, forgotPassword, resetPassword, resendVerificationEmail, getCurrentUser, updateProfile, changePassword } from "../controllers/user.controller.js";
import express from "express";
import { verifyToken } from "../middlewares/verifyUser.js";

const router = express.Router();

router.post("/add",createUser);
router.post("/signin", signInUser);
router.post("/logout", logoutUser);
router.get("/me", verifyToken, getCurrentUser);
router.put("/update-profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);


export default router;