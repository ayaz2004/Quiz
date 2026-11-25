import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

const PLATFORMS = ["android", "ios", "web"];
const MAX_TOKEN_LENGTH = 4096;

/**
 * POST /api/devices
 * Body: { token, platform }. Registers an FCM token for push; a token that
 * was registered by another account moves to the caller (same phone, new login).
 */
export const registerDevice = async (req, res, next) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const { platform } = req.body || {};

    if (!token || token.length > MAX_TOKEN_LENGTH) {
      return next(new ApiError(400, "A valid device token is required"));
    }
    if (!PLATFORMS.includes(platform)) {
      return next(new ApiError(400, "platform must be android, ios or web"));
    }

    await prisma.deviceToken.upsert({
      where: { token },
      create: { token, platform, userId: req.user.id },
      update: { platform, userId: req.user.id },
    });

    res.status(200).json(new ApiResponse(200, { registered: true }, "Device registered"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error registering device"));
  }
};

/**
 * DELETE /api/devices
 * Body: { token }. Only removes the token if it belongs to the caller.
 */
export const unregisterDevice = async (req, res, next) => {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token) return next(new ApiError(400, "A valid device token is required"));

    await prisma.deviceToken.deleteMany({ where: { token, userId: req.user.id } });

    res.status(200).json(new ApiResponse(200, { registered: false }, "Device unregistered"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error unregistering device"));
  }
};
