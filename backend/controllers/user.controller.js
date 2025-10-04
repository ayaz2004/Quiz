import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return next(new ApiError(409, "User already exists."));
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
        isEmailVerified: false
      },
    });

    await sendVerificationEmail(email, emailVerificationToken);

    res.status(201).json(new ApiResponse(201, { user: { 
        id: newUser.id, 
        email: newUser.email, 
        isEmailVerified: newUser.isEmailVerified 
      }  
    }, "User created successfully. Please check your email to verify your account."));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const signInUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email and password are required")
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json(
        new ApiResponse(401, null, "Invalid credentials")
      );
    }

     // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json(
        new ApiResponse(401, null, "Please verify your email before signing in")
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json(
        new ApiResponse(401, null, "Invalid credentials")
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response (exclude password)
    const { password: _, emailVerificationToken, emailVerificationExpires, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user;
    
    return res.status(200).json(
      new ApiResponse(200, {
        user: userWithoutPassword,
        token
      }, "Sign in successful")
    );

  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid or expired verification token")
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    res.status(200).json(
      new ApiResponse(200, null, "Email verified successfully")
    );

  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email is required")
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    });

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json(
      new ApiResponse(200, null, "Password reset email sent successfully")
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json(
        new ApiResponse(400, null, "Password is required")
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json(
        new ApiResponse(400, null, "Invalid or expired reset token")
      );
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.status(200).json(
      new ApiResponse(200, null, "Password reset successfully")
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email is required")
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json(
        new ApiResponse(404, null, "User not found")
      );
    }

    if (user.isEmailVerified) {
      return res.status(400).json(
        new ApiResponse(400, null, "Email is already verified")
      );
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    });

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken);

    res.status(200).json(
      new ApiResponse(200, null, "Verification email sent successfully")
    );

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json(
      new ApiResponse(500, null, "Internal server error")
    );
  }
};

// Helper functions for sending emails
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BACKEND_URL}/api/users/verify-email/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Quiz App',
    html: `
      <h2>Email Verification</h2>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.BACKEND_URL}/api/users/reset-password/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - Quiz App',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy and paste this link in your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

