import prisma from "../config/db.config.js";
import { courseKeyFromTitle, courseNameFromTitle } from "../utils/course.js";

/**
 * Quizzes a user may practise from: active, and free or purchased.
 * Same rule as checkQuizAccess, expressed as one Prisma filter so whole
 * question packs can be loaded in a single query.
 */
export const accessibleQuizWhere = (userId) => ({
  isActive: true,
  OR: [
    { isPaid: false },
    { purchases: { some: { userId, status: "completed" } } },
  ],
});

export const practiceQuestionInclude = {
  quiz: { select: { id: true, title: true, subject: true, examYear: true } },
  topic: { select: { id: true, name: true } },
};

// Practice packs carry the answer so the app can give instant feedback offline.
export const toPracticeQuestion = (q) => ({
  id: q.id,
  quizId: q.quizId,
  quizTitle: q.quiz.title,
  courseKey: courseKeyFromTitle(q.quiz.title),
  subject: q.quiz.subject,
  examYear: q.quiz.examYear,
  questionOrder: q.questionOrder,
  questionText: q.questionText,
  options: [q.option1, q.option2, q.option3, q.option4],
  correctOption: q.isCorrect,
  explanation: q.explanation,
  imageUrl: q.imageUrl,
  topicId: q.topicId ?? null,
  topicName: q.topic?.name ?? null,
  difficulty: q.difficulty ?? null,
});

/** Active quizzes grouped into courses, newest paper first within each course. */
export const loadCourses = async () => {
  const quizzes = await prisma.quiz.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      subject: true,
      examYear: true,
      educationLevel: true,
      createdAt: true,
      _count: { select: { questions: true, cutoffs: true } },
    },
    orderBy: [{ examYear: "desc" }, { createdAt: "desc" }],
  });

  const courses = new Map();
  for (const quiz of quizzes) {
    const key = courseKeyFromTitle(quiz.title);
    if (!key) continue;
    if (!courses.has(key)) {
      courses.set(key, { key, name: courseNameFromTitle(quiz.title), latest: quiz, quizzes: [] });
    }
    courses.get(key).quizzes.push(quiz);
  }
  return courses;
};

export const quizIdsForCourse = async (courseKey) => {
  const course = (await loadCourses()).get(courseKey);
  return course ? course.quizzes.map((q) => q.id) : [];
};
