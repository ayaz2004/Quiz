import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { courseKey } from "../utils/jmiPortal.js";
import { getVapidPublicKey, isWebPushConfigured } from "../utils/webPush.js";
import { runResultPoll } from "../jobs/resultPoller.js";

const MAX_TRACKED_COURSES = 20;

function normalizePhdId(value) {
  return (value || "").trim();
}

export const getVapidKey = async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        publicKey: getVapidPublicKey(),
        configured: isWebPushConfigured(),
      },
      "VAPID public key"
    )
  );
};

export const listTrackedCourses = async (req, res, next) => {
  try {
    const tracks = await prisma.trackedCourse.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!tracks.length) {
      return res.status(200).json(
        new ApiResponse(200, { courses: [] }, "No tracked courses")
      );
    }

    const snapshots = await prisma.courseResultSnapshot.findMany({
      where: {
        OR: tracks.map((t) => ({
          courseTypeId: t.courseTypeId,
          courseNameId: t.courseNameId,
          phdDisciplineId: t.phdDisciplineId || "",
        })),
      },
    });

    const snapshotByKey = new Map(
      snapshots.map((s) => [courseKey(s), s])
    );

    const courses = tracks.map((track) => {
      const snapshot = snapshotByKey.get(courseKey(track)) || null;
      return {
        ...track,
        snapshot: snapshot
          ? {
              fingerprint: snapshot.fingerprint,
              results: snapshot.resultsJson,
              lastCheckedAt: snapshot.lastCheckedAt,
              lastChangedAt: snapshot.lastChangedAt,
            }
          : null,
      };
    });

    return res.status(200).json(
      new ApiResponse(200, { courses }, "Tracked courses loaded")
    );
  } catch (error) {
    next(new ApiError(500, error.message || "Unable to load tracked courses"));
  }
};

export const addTrackedCourse = async (req, res, next) => {
  try {
    const {
      courseTypeId = "",
      courseTypeName = "",
      courseNameId = "",
      courseName = "",
      phdDisciplineId = "",
    } = req.body || {};

    if (!courseTypeId || !courseNameId || !courseTypeName || !courseName) {
      throw new ApiError(
        400,
        "courseTypeId, courseTypeName, courseNameId, and courseName are required"
      );
    }

    const count = await prisma.trackedCourse.count({
      where: { userId: req.user.id },
    });

    if (count >= MAX_TRACKED_COURSES) {
      throw new ApiError(
        400,
        `You can track at most ${MAX_TRACKED_COURSES} courses`
      );
    }

    const phd = normalizePhdId(phdDisciplineId);

    const existing = await prisma.trackedCourse.findUnique({
      where: {
        userId_courseTypeId_courseNameId_phdDisciplineId: {
          userId: req.user.id,
          courseTypeId: String(courseTypeId).trim(),
          courseNameId: String(courseNameId).trim(),
          phdDisciplineId: phd,
        },
      },
    });

    if (existing) {
      return res.status(200).json(
        new ApiResponse(200, { course: existing }, "Course already tracked")
      );
    }

    const course = await prisma.trackedCourse.create({
      data: {
        userId: req.user.id,
        courseTypeId: String(courseTypeId).trim(),
        courseTypeName: String(courseTypeName).trim(),
        courseNameId: String(courseNameId).trim(),
        courseName: String(courseName).trim(),
        phdDisciplineId: phd,
      },
    });

    return res.status(201).json(
      new ApiResponse(201, { course }, "Course tracking added")
    );
  } catch (error) {
    if (error?.code === "P2002") {
      return next(new ApiError(409, "Course already tracked"));
    }
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Unable to track course")
    );
  }
};

export const removeTrackedCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(400, "Invalid tracked course id");
    }

    const track = await prisma.trackedCourse.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!track) {
      throw new ApiError(404, "Tracked course not found");
    }

    await prisma.trackedCourse.delete({ where: { id } });

    return res.status(200).json(
      new ApiResponse(200, { id }, "Course tracking removed")
    );
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Unable to remove tracked course")
    );
  }
};

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.resultNotification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.resultNotification.count({
      where: { userId: req.user.id, readAt: null },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { notifications, unreadCount },
        "Notifications loaded"
      )
    );
  } catch (error) {
    next(new ApiError(500, error.message || "Unable to load notifications"));
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    const { ids, all } = req.body || {};
    const now = new Date();

    if (all) {
      const result = await prisma.resultNotification.updateMany({
        where: { userId: req.user.id, readAt: null },
        data: { readAt: now },
      });
      return res.status(200).json(
        new ApiResponse(200, { updated: result.count }, "All notifications marked read")
      );
    }

    if (!Array.isArray(ids) || !ids.length) {
      throw new ApiError(400, "Provide notification ids or all: true");
    }

    const numericIds = ids.map(Number).filter((id) => Number.isInteger(id) && id > 0);

    const result = await prisma.resultNotification.updateMany({
      where: {
        userId: req.user.id,
        id: { in: numericIds },
        readAt: null,
      },
      data: { readAt: now },
    });

    return res.status(200).json(
      new ApiResponse(200, { updated: result.count }, "Notifications marked read")
    );
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Unable to update notifications")
    );
  }
};

export const subscribePush = async (req, res, next) => {
  try {
    const { endpoint, keys, userAgent } = req.body || {};
    const p256dh = keys?.p256dh;
    const auth = keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      throw new ApiError(400, "endpoint, keys.p256dh, and keys.auth are required");
    }

    if (!isWebPushConfigured()) {
      throw new ApiError(503, "Web push is not configured on the server");
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: req.user.id,
        endpoint,
        p256dh,
        auth,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
      },
      update: {
        userId: req.user.id,
        p256dh,
        auth,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, { subscription: { id: subscription.id } }, "Push subscribed")
    );
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Unable to save push subscription")
    );
  }
};

export const unsubscribePush = async (req, res, next) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) {
      throw new ApiError(400, "endpoint is required");
    }

    await prisma.pushSubscription.deleteMany({
      where: { userId: req.user.id, endpoint },
    });

    return res.status(200).json(
      new ApiResponse(200, null, "Push unsubscribed")
    );
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Unable to unsubscribe")
    );
  }
};

export const triggerPoll = async (req, res, next) => {
  try {
    const secret = req.header("x-cron-secret") || req.header("authorization")?.replace("Bearer ", "");
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      throw new ApiError(401, "Unauthorized");
    }

    const result = await runResultPoll();
    return res.status(200).json(
      new ApiResponse(200, result, result.skipped ? "Poll already running" : "Poll completed")
    );
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(500, error.message || "Poll failed")
    );
  }
};
