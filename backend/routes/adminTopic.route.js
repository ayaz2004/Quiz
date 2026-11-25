import { Router } from "express";
import {
  adminApproveTopics,
  adminClearTopics,
  adminCreateTopic,
  adminListTopics,
  adminRejectSuggestions,
  adminTopicReviewList,
} from "../controllers/adminTopic.controller.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = Router();

router.use(["/topics", "/topic-review"], verifyToken, verifyAdmin);

router.get("/topics", adminListTopics);
router.post("/topics", adminCreateTopic);
router.get("/topic-review", adminTopicReviewList);
router.post("/topic-review/approve", adminApproveTopics);
router.post("/topic-review/reject", adminRejectSuggestions);
router.post("/topic-review/clear", adminClearTopics);

export default router;
