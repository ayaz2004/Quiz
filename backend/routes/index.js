import express from 'express';
import userRoutes from './user.route.js';
import quizRoutes from './quiz.route.js';
import purchaseRoutes from './purchase.route.js';
import adminRoutes from './admin.route.js'
const router = express.Router();

// Mount all route modules
router.use('/users', userRoutes);
router.use('/quiz', quizRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/admin', adminRoutes);

export default router;