import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

export const createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return next(new ApiError(409, "User already exists."));
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json(new ApiResponse(201, { user: newUser }));
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
    const { password: _, ...userWithoutPassword } = user;
    
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

