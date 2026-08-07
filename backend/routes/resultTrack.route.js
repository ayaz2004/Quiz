import express from "express";
import {
  addTrackedCourse,
  getVapidKey,
  listNotifications,
  listTrackedCourses,
  markNotificationsRead,
  removeTrackedCourse,
  subscribePush,
  triggerPoll,
  unsubscribePush,
} from "../controllers/resultTrack.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/vapid-public-key", generalLimiter, getVapidKey);
router.post("/poll", generalLimiter, triggerPoll);

router.get("/courses", verifyToken, listTrackedCourses);
router.post("/courses", verifyToken, addTrackedCourse);
router.delete("/courses/:id", verifyToken, removeTrackedCourse);

router.get("/notifications", verifyToken, listNotifications);
router.patch("/notifications/read", verifyToken, markNotificationsRead);

router.post("/push/subscribe", verifyToken, subscribePush);
router.delete("/push/subscribe", verifyToken, unsubscribePush);

export default router;
