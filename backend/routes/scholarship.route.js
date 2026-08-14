import express from 'express';
import { listScholarships, getScholarshipBySlug } from '../controllers/scholarship.controller.js';
import { generalLimiter } from '../middlewares/rateLimiter.js';
import { optionalAuth } from '../middlewares/optionalAuth.js';

const router = express.Router();

// Public listing with optional auth
router.get('/', optionalAuth, generalLimiter, listScholarships);
router.get('/:slug', optionalAuth, generalLimiter, getScholarshipBySlug);

export default router;
