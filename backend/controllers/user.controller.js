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

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    // If user exists and email is verified, they should sign in instead
    if (existingUser && existingUser.isEmailVerified) {
      return next(new ApiError(409, "User already exists. Please sign in."));
    }

    // If user exists but email is NOT verified, regenerate token and resend email
    if (existingUser && !existingUser.isEmailVerified) {
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with new token and password (in case they forgot)
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword, // Update password in case they changed it
          emailVerificationToken,
          emailVerificationExpires
        }
      });

      // Send response first
      res.status(200).json(new ApiResponse(200, { 
        user: { 
          id: existingUser.id, 
          email: existingUser.email, 
          isEmailVerified: false 
        },
        requiresVerification: true
      }, "Account exists but not verified. A new verification email has been sent."));

      // Resend verification email after response (fire and forget)
      setImmediate(() => {
        sendVerificationEmail(email, emailVerificationToken).catch(err => {
          console.error('Failed to send verification email:', err);
        });
      });
      
      return;
    }

    // Create new user
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

    // Send response first (don't wait for email)
    res.status(201).json(new ApiResponse(201, { 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        isEmailVerified: newUser.isEmailVerified 
      },
      requiresVerification: true
    }, "Registration successful! Please check your email to verify your account."));

    // Send email asynchronously after response (fire and forget)
    setImmediate(() => {
      sendVerificationEmail(email, emailVerificationToken).catch(err => {
        console.error('Failed to send verification email:', err);
      });
    });
    
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const signInUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new ApiError(400, "Email and password are required"));
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    // Check if email is verified - return specific error without tokens
    if (!user.isEmailVerified) {
      return res.status(403).json(
        new ApiResponse(403, {
          email: user.email,
          isEmailVerified: false,
          requiresVerification: true
        }, "Please verify your email before signing in. Check your inbox or request a new verification email.")
      );
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Generate session token (long-lived refresh token)
    const sessionToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store tokens in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken,
        sessionToken
      }
    });

    // Set cookies with security options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    res.cookie('access_token', accessToken, cookieOptions);
    res.cookie('session_token', sessionToken, cookieOptions);

    // Return success response (exclude password and tokens)
    const { password: _, emailVerificationToken, emailVerificationExpires, resetPasswordToken, resetPasswordExpires, accessToken: __, sessionToken: ___, ...userWithoutPassword } = user;
    
    return res.status(200).json(
      new ApiResponse(200, {
        user: userWithoutPassword,
        accessToken,
        sessionToken
      }, "Sign in successful")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error signing in"));
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return next(new ApiError(400, "Verification token is required"));
    }

    // First, check if user exists with this token (regardless of expiration)
    const userWithToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    });

    if (!userWithToken) {
      return next(new ApiError(400, "Invalid verification token. The link may be incorrect."));
    }

    // Check if token is expired
    if (userWithToken.emailVerificationExpires < new Date()) {
      return next(new ApiError(400, "Verification token has expired. Please request a new verification email."));
    }

    // Check if already verified
    if (userWithToken.isEmailVerified) {
      return res.status(200).json(
        new ApiResponse(200, null, "Email is already verified. You can sign in now.")
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: userWithToken.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    res.status(200).json(
      new ApiResponse(200, null, "Email verified successfully! You can now sign in.")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error verifying email"));
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, "Email is required"));
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ApiError(404, "User not found"));
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

    // Send response first
    res.status(200).json(
      new ApiResponse(200, null, "Password reset email sent successfully")
    );

    // Send reset email after response (fire and forget)
    setImmediate(() => {
      sendPasswordResetEmail(email, resetToken).catch(err => {
        console.error('Failed to send password reset email:', err);
      });
    });

  } catch (error) {
    next(new ApiError(500, error.message || "Error processing forgot password"));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new ApiError(400, "Password is required"));
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
      return next(new ApiError(400, "Invalid or expired reset token"));
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
    next(new ApiError(500, error.message || "Error resetting password"));
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, "Email is required"));
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    if (user.isEmailVerified) {
      return next(new ApiError(400, "Email is already verified"));
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

    // Send response first
    res.status(200).json(
      new ApiResponse(200, null, "Verification email sent successfully")
    );

    // Send verification email after response (fire and forget)
    setImmediate(() => {
      sendVerificationEmail(email, emailVerificationToken).catch(err => {
        console.error('Failed to send verification email:', err);
      });
    });

  } catch (error) {
    next(new ApiError(500, error.message || "Error resending verification email"));
  }
};

// Helper functions for sending emails
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
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
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
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

export const logoutUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
    
    if (accessToken) {
      // Find user by access token and clear tokens from database
      const user = await prisma.user.findFirst({
        where: { accessToken }
      });

      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            accessToken: null,
            sessionToken: null
          }
        });
      }
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('session_token');

    return res.status(200).json(
      new ApiResponse(200, null, "Logged out successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error logging out"));
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // This endpoint is called with verifyToken middleware
    // So req.user is already set
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }

    // Return user data without sensitive fields
    const { password, emailVerificationToken, emailVerificationExpires, resetPasswordToken, resetPasswordExpires, accessToken, sessionToken, ...userWithoutPassword } = req.user;
    
    return res.status(200).json(
      new ApiResponse(200, userWithoutPassword, "User data retrieved")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error getting user"));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }

    const { email, profilePhoto } = req.body;

    // Validate input
    if (!email && !profilePhoto) {
      return next(new ApiError(400, "At least one field (email or profilePhoto) is required"));
    }

    // Check if email is already taken by another user
    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return next(new ApiError(409, "Email is already in use"));
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(email && { email }),
        ...(profilePhoto && { profilePhoto })
      }
    });

    // Return updated user without sensitive fields
    const { password, emailVerificationToken, emailVerificationExpires, resetPasswordToken, resetPasswordExpires, accessToken, sessionToken, ...userWithoutPassword } = updatedUser;

    return res.status(200).json(
      new ApiResponse(200, userWithoutPassword, "Profile updated successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error updating profile"));
  }
};

export const changePassword = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return next(new ApiError(400, "Current password and new password are required"));
    }

    if (newPassword.length < 6) {
      return next(new ApiError(400, "New password must be at least 6 characters"));
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return next(new ApiError(401, "Current password is incorrect"));
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Password changed successfully")
    );

  } catch (error) {
    next(new ApiError(500, error.message || "Error changing password"));
  }
};
