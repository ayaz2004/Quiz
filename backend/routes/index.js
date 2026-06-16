import express from 'express';
import userRoutes from './user.route.js';
import quizRoutes from './quiz.route.js';
import purchaseRoutes from './purchase.route.js';
import adminRoutes from './admin.route.js';
import suggestionRoutes from './suggestion.route.js';
import jmiResultRoutes from './jmiResult.route.js';
import qaRoutes from './qa.route.js';
const router = express.Router();

// Mount all route modules
router.use('/users', userRoutes);
router.use('/quiz', quizRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/admin', adminRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/jmi-result', jmiResultRoutes);
router.use('/qa', qaRoutes);

export default router;