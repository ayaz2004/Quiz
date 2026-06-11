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
  deleteAttempt,
  grantQuizAccess,
  toggleQuizVisibility,
  revokeQuizAccess,
  getGrantedAccesses,
  getAllCutoffs,
  addCutoff,
  updateCutoff,
  deleteCutoff
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

router.post(
  "/grant-access",
  verifyToken,
  grantQuizAccess
);

router.delete(
  "/revoke-access",
  verifyToken,
  revokeQuizAccess
);

/////////////////////////////// Admin put Apis //////////////////////////////
router.put(
  "/update-quiz/:id",
  verifyToken,
  uploadMiddleware.any(),
  validateQuizUpdate,
  updateQuiz
);

router.put(
  "/quiz/:quizId/toggle-visibility",
  verifyToken,
  toggleQuizVisibility
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

router.get(
    "/granted-accesses",
    verifyToken,
    getGrantedAccesses
);

router.get(
  "/cutoffs",
  verifyToken,
  getAllCutoffs
);

router.post(
  "/cutoffs",
  verifyToken,
  addCutoff
);

router.put(
  "/cutoffs/:id",
  verifyToken,
  updateCutoff
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

router.delete(
  "/cutoffs/:id",
  verifyToken,
  deleteCutoff
);

/////////////////////////////// Admin Patch Apis //////////////////////////////

router.patch(
    "/suggestions/:id",
    verifyToken,
    updateSuggestionStatus
);

export default router;
