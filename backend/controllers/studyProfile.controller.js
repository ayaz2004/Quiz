import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { loadCourses } from "../services/practiceQuestions.js";
import { universityFromTitle } from "../utils/course.js";

// Same names as the QuizCutoff category columns
export const CUTOFF_CATEGORIES = [
  "general", "muslim", "muslimObcSt", "muslimWomen", "jk", "km",
  "pwd", "pwdLocomoter", "pwdBlindVision", "pwdHearing", "jamiaInternal",
];

export const toStudyProfile = (p) => p && ({
  targetCourseKey: p.targetCourseKey,
  targetCourseName: p.targetCourseName,
  targetUniversity: p.targetCourseName ? universityFromTitle(p.targetCourseName) : null,
  category: p.category,
  dailyGoal: p.dailyGoal,
  examDate: p.examDate,
});

/**
 * GET /api/study-profile
 */
export const getStudyProfile = async (req, res, next) => {
  try {
    const profile = await prisma.studyProfile.findUnique({ where: { userId: req.user.id } });
    res.status(200).json(new ApiResponse(200, { profile: toStudyProfile(profile) }, "Study profile fetched"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching study profile"));
  }
};

/**
 * PUT /api/study-profile
 * Body: any subset of { targetCourseKey, category, dailyGoal, examDate }.
 * targetCourseName is always derived from the course key.
 */
export const updateStudyProfile = async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = {};

    if (body.targetCourseKey !== undefined) {
      if (body.targetCourseKey === null || body.targetCourseKey === "") {
        data.targetCourseKey = null;
        data.targetCourseName = null;
      } else {
        const course = (await loadCourses()).get(String(body.targetCourseKey));
        if (!course) return next(new ApiError(400, "Unknown target course"));
        data.targetCourseKey = course.key;
        data.targetCourseName = course.name;
      }
    }

    if (body.category !== undefined) {
      if (body.category !== null && !CUTOFF_CATEGORIES.includes(body.category)) {
        return next(new ApiError(400, "Invalid category"));
      }
      data.category = body.category;
    }

    if (body.dailyGoal !== undefined) {
      const goal = Number(body.dailyGoal);
      if (!Number.isInteger(goal) || goal < 5 || goal > 100) {
        return next(new ApiError(400, "dailyGoal must be an integer from 5 to 100"));
      }
      data.dailyGoal = goal;
    }

    if (body.examDate !== undefined) {
      if (body.examDate === null) {
        data.examDate = null;
      } else {
        const date = new Date(body.examDate);
        if (typeof body.examDate !== "string" || Number.isNaN(date.getTime())) {
          return next(new ApiError(400, "Invalid examDate"));
        }
        data.examDate = date;
      }
    }

    const profile = await prisma.studyProfile.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, ...data },
      update: data,
    });

    res.status(200).json(new ApiResponse(200, { profile: toStudyProfile(profile) }, "Study profile saved"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error saving study profile"));
  }
};
