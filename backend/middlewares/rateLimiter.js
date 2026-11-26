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
    message: 'Too many sync requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth routes are signed out, so there is no user to key on, and a bare IP
 * would lock out everyone sharing a carrier address (see above). Key on the
 * address AND the email being targeted: one person guessing at one account
 * is stopped, while strangers behind the same IP are not affected.
 */
const authKey = (req) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase().slice(0, 254);
  return `${ipKeyGenerator(req.ip || '')}|${email}`;
};

const authMessage = {
  success: false,
  statusCode: 429,
  message: 'Too many attempts, please try again after 15 minutes',
};

// Sign-in: 10 FAILED attempts per 15 minutes per address+email. Successful
// sign-ins are not counted, so a normal user is never slowed down.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: authKey,
  skipSuccessfulRequests: true,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

// Sign-up, forgot-password and resend-verification each send an email, so
// every request counts: 5 per 15 minutes per address+email.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: authKey,
  message: authMessage,
  standardHeaders: true,
  legacyHeaders: false,
});
