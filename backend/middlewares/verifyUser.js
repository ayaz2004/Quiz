import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";


export const verifyToken = async (req, res, next) => {
    const accessToken =
        req.cookies.access_token ||
        req.header("Authorization")?.replace("Bearer ", "");
    const sessionToken =
        req.cookies.session_token ||
        req.header("RefreshToken")?.replace("Bearer ", "");

    if (!accessToken || !sessionToken) {
        return next(errorHandler(401, "Unauthorized"));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (
            !user ||
            user.accessToken !== accessToken ||
            user.sessionToken !== sessionToken
        ) {
            return next(
                errorHandler(403, "Session expired or invalid. Please login again.")
            );
        }

        req.user = user;
        req.decodedToken = decoded;
        next();
    } catch (error) {
        next(errorHandler(400, "Invalid accessToken."));
    }
};