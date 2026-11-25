import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { normalizeEducationLevel, universityFromTitle } from "../utils/course.js";
import { loadCourses, quizIdsForCourse } from "../services/practiceQuestions.js";

/**
 * GET /api/courses
 * Active previous-year papers grouped by entrance exam
 */
export const listCourses = async (req, res, next) => {
  try {
    const courses = [...(await loadCourses()).values()]
      .map(({ key, name, latest, quizzes }) => ({
        key,
        name,
        subject: latest.subject,
        educationLevel: normalizeEducationLevel(latest.educationLevel),
        university: universityFromTitle(latest.title),
        paperCount: quizzes.length,
        questionCount: quizzes.reduce((sum, q) => sum + q._count.questions, 0),
        years: [...new Set(quizzes.map((q) => q.examYear))].sort((a, b) => b - a),
        hasCutoffs: quizzes.some((q) => q._count.cutoffs > 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json(new ApiResponse(200, { courses }, "Courses fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching courses"));
  }
};

/**
 * GET /api/topics?subject=&courseKey=
 * Approved topics with the number of questions tagged in active quizzes
 */
export const listTopics = async (req, res, next) => {
  try {
    const subject = typeof req.query.subject === "string" ? req.query.subject.trim() : "";
    const courseKey = typeof req.query.courseKey === "string" ? req.query.courseKey.trim() : "";

    const quizWhere = { isActive: true };
    if (courseKey) quizWhere.id = { in: await quizIdsForCourse(courseKey) };

    const topics = await prisma.topic.findMany({
      where: subject ? { subject: { equals: subject, mode: "insensitive" } } : {},
      select: {
        id: true,
        subject: true,
        name: true,
        _count: { select: { questions: { where: { quiz: quizWhere } } } },
      },
      orderBy: [{ subject: "asc" }, { name: "asc" }],
    });

    res.status(200).json(new ApiResponse(200, {
      topics: topics
        .map((t) => ({ id: t.id, subject: t.subject, name: t.name, questionCount: t._count.questions }))
        .filter((t) => !courseKey || t.questionCount > 0),
    }, "Topics fetched successfully"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching topics"));
  }
};
