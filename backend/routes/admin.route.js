import { Router } from "express";
import {
  getAllUsers,
  addQuiz,
  deleteUser,
  updateQuiz,
} from "../controllers/admin.controller.js";
import { validateQuiz, validateQuizUpdate } from "../utils/validateQuiz.js";
import uploadMiddleware from "../middlewares/multer.js";
const router = Router();

/////////////////////////////// Admin post Apis //////////////////////////////
router.post(
  "/add-quiz",
  uploadMiddleware.any(),
  validateQuiz,
  addQuiz
);
router.patch(
  "/update-quiz/:id",
  uploadMiddleware.any(),
  validateQuizUpdate,
  updateQuiz
);

//////////////////////////////Admin get Apis //////////////////////////////

router.get(
    "/get-all-users",
     getAllUsers
);

///////////////////////////////Admin Delete Apis //////////////////////////////

router.post(
    "/delete-user/:userId",
     deleteUser
);

export default router;
