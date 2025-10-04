import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import bcryptjs from "bcryptjs";

export const createUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation

    const hashedPassword = bcryptjs.hashSync(password, 10);

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
