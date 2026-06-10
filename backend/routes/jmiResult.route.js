import express from "express";
import {
  getJmiProgramNames,
  getJmiProgramTypes,
  searchJmiResults,
} from "../controllers/jmiResult.controller.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/program-types", generalLimiter, getJmiProgramTypes);
router.get("/program-names", generalLimiter, getJmiProgramNames);
router.post("/search", generalLimiter, searchJmiResults);

export default router;
