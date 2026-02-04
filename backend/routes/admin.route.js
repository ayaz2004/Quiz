import { Router } from "express";
import {
  getAllUsers,
  addQuiz,
  deleteUser,
  deleteQuiz,
  updateQuiz,
  getDashboardStats,
  getQuizByIdForAdmin,
  getAllAttempts,
  deleteAttempt
} from "../controllers/admin.controller.js";
import {
  getAllSuggestions,
  updateSuggestionStatus,
  deleteSuggestion
} from "../controllers/suggestion.controller.js";
import { validateQuiz, validateQuizUpdate } from "../utils/validateQuiz.js";
import uploadMiddleware from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/verifyUser.js";
const router = Router();

/////////////////////////////// Admin post Apis //////////////////////////////
router.post(
  "/add-quiz",
  verifyToken,
  uploadMiddleware.any(),
  validateQuiz,
  addQuiz
);

/////////////////////////////// Admin put Apis //////////////////////////////
router.put(
  "/update-quiz/:id",
  verifyToken,
  uploadMiddleware.any(),
  validateQuizUpdate,
  updateQuiz
);

//////////////////////////////Admin get Apis //////////////////////////////

router.get(
    "/get-all-users",
    verifyToken,
     getAllUsers
);

router.get(
    "/dashboard-stats",
    verifyToken,
    getDashboardStats
);

router.get(
    "/quiz/:id",
    verifyToken,
    getQuizByIdForAdmin
);

router.get(
    "/suggestions",
    verifyToken,
    getAllSuggestions
);

router.get(
    "/attempts",
    verifyToken,
    getAllAttempts
);

///////////////////////////////Admin Delete Apis //////////////////////////////

router.delete(
    "/delete-user/:userId",
    verifyToken,
     deleteUser
);

router.delete(
    "/suggestions/:id",
    verifyToken,
    deleteSuggestion
);

router.delete(
    "/delete-quiz/:quizId",
    verifyToken,
    deleteQuiz
);

router.delete(
    "/attempts/:id",
    verifyToken,
    deleteAttempt
);

/////////////////////////////// Admin Patch Apis //////////////////////////////

router.patch(
    "/suggestions/:id",
    verifyToken,
    updateSuggestionStatus
);

export default router;
