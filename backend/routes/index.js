import express from 'express';
import userRoutes from './user.route.js';

const router = express.Router();

// Mount all route modules
router.use('/users', userRoutes);

// You can add more routes here as your app grows
// router.use('/auth', authRoutes);
// router.use('/quiz', quizRoutes);
// router.use('/questions', questionRoutes);

export default router;