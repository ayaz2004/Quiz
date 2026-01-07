import { createUser, signInUser, logoutUser, verifyEmail, forgotPassword, resetPassword, resendVerificationEmail } from "../controllers/user.controller.js";
import express from "express";

const router = express.Router();

router.post("/add",createUser);
router.post("/signin", signInUser);
router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/resend-verification", resendVerificationEmail);


export default router;