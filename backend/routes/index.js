import express from 'express';
import userRoutes from './user.route.js';
import quizRoutes from './quiz.route.js';
import scholarshipRoutes from './scholarship.route.js';
import purchaseRoutes from './purchase.route.js';
import adminRoutes from './admin.route.js';
import adminTopicRoutes from './adminTopic.route.js';
import monetizationRoutes from './monetization.route.js';
import suggestionRoutes from './suggestion.route.js';
import jmiResultRoutes from './jmiResult.route.js';
import qaRoutes from './qa.route.js';
import resultTrackRoutes from './resultTrack.route.js';
import { courseRouter, topicRouter } from './course.route.js';
import practiceRoutes from './practice.route.js';
import studyProfileRoutes from './studyProfile.route.js';
import bookmarkRoutes from './bookmark.route.js';
import deviceRoutes from './device.route.js';
import appHomeRoutes from './appHome.route.js';
const router = express.Router();

// Mount all route modules
router.use('/users', userRoutes);
router.use('/quiz', quizRoutes);
router.use('/purchase', purchaseRoutes);
router.use('/admin', adminRoutes);
router.use('/admin', adminTopicRoutes);
router.use('/admin', monetizationRoutes);
router.use('/suggestions', suggestionRoutes);
router.use('/jmi-result', jmiResultRoutes);
router.use('/qa', qaRoutes);
router.use('/result-track', resultTrackRoutes);
router.use('/scholarships', scholarshipRoutes);

// Mobile app
router.use('/courses', courseRouter);
router.use('/topics', topicRouter);
router.use('/practice', practiceRoutes);
router.use('/study-profile', studyProfileRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/devices', deviceRoutes);
router.use('/app', appHomeRoutes);

export default router;