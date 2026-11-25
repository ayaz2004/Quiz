import jwt from "jsonwebtoken";
import { ApiError } from "../utils/error.js";
import { resolveSession } from "../services/session.js";

// Clients rely on these exact statuses and messages: 401 means "refresh and
// retry", 403 "Session expired..." means "sign out".
export const verifyToken = async (req, res, next) => {
    const accessToken =
        req.cookies?.access_token ||
        req.header("Authorization")?.replace("Bearer ", "");
    const sessionToken =
        req.cookies?.session_token ||
        req.header("RefreshToken")?.replace("Bearer ", "");

    if (!accessToken || !sessionToken) {
        return next(new ApiError(401, "Unauthorized"));
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

        const resolved = await resolveSession(decoded, accessToken, sessionToken, req);

        if (!resolved) {
            return next(
                new ApiError(403, "Session expired or invalid. Please login again.")
            );
        }

        req.user = resolved.user;
        req.session = resolved.session;
        req.decodedToken = decoded;
        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired access token."));
    }
};
