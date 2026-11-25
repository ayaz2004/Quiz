import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

/**
 * Indian mobile carriers put many users behind one IP, so signed-in requests
 * are limited per user. Only the JWT signature is checked here (no DB lookup);
 * the auth middleware still decides whether the request is allowed.
 */
export const rateLimitKey = (req) => {
  if (req.rateLimitKey) return req.rateLimitKey;

  const accessToken =
    req.cookies?.access_token ||
    req.header('Authorization')?.replace('Bearer ', '');

  let key = null;
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      if (decoded?.id) key = `user:${decoded.id}`;
    } catch {
      // Invalid or expired token: fall back to the IP
    }
  }

  req.rateLimitKey = key || `ip:${ipKeyGenerator(req.ip || '')}`;
  return req.rateLimitKey;
};

const isUserKey = (req) => rateLimitKey(req).startsWith('user:');

// General API rate limiter - per 15 minutes: 300 per signed-in user, 100 per IP otherwise
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req) => (isUserKey(req) ? 300 : 100),
  keyGenerator: rateLimitKey,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Quiz attempt rate limiter - 10 attempts per hour
export const quizAttemptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: rateLimitKey,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many quiz attempts, please try again after 1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Answer uploads from the mobile app - 120 batches per 15 minutes per user
export const practiceSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  keyGenerator: rateLimitKey,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many sync requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiter - 5 requests per 15 minutes (for sensitive operations)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
