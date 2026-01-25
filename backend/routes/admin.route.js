import { Router } from "express";
import {
  getAllUsers,
  addQuiz,
  deleteUser,
  updateQuiz,
  getDashboardStats,
} from "../controllers/admin.controller.js";
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

///////////////////////////////Admin Delete Apis //////////////////////////////

router.delete(
    "/delete-user/:userId",
    verifyToken,
     deleteUser
);

export default router;
