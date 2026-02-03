import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";

/**
 * Optional authentication middleware
 * Attaches user to req if token is valid, but doesn't block if no token
 */
export const optionalAuth = async (req, res, next) => {
    const accessToken =
        req.cookies?.access_token ||
        req.header("Authorization")?.replace("Bearer ", "");

    // If no token, continue without user
    if (!accessToken) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (user) {
            req.user = user;
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        // Invalid token, continue without user
        req.user = null;
        next();
    }
};
