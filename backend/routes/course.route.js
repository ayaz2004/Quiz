import express from "express";
import { listCourses, listTopics } from "../controllers/course.controller.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { generalLimiter } from "../middlewares/rateLimiter.js";

export const courseRouter = express.Router();
courseRouter.get("/", optionalAuth, generalLimiter, listCourses);

export const topicRouter = express.Router();
topicRouter.get("/", optionalAuth, generalLimiter, listTopics);
