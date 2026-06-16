import { ApiError } from "../utils/error.js";

/**
 * Middleware to verify if the user is an admin
 * Must be used after verifyToken middleware
 */
export const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(401, "Unauthorized - No user found"));
    }

    if (req.user.isAdmin !== 1) {
        return next(new ApiError(403, "Forbidden - Admin access required"));
    }

    next();
};
