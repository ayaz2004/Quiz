import prisma from "../config/db.config.js";
import {
  courseKey,
  fetchJmiResults,
  fingerprintResults,
} from "../utils/jmiPortal.js";
import { sendResultUpdateEmail } from "../utils/email.js";
import { sendPushToSubscriptions } from "../utils/webPush.js";

let isRunning = false;

function primaryResultLink(results = []) {
  const withLink = results.find((row) => row.link);
  return withLink?.link || null;
}

async function getDistinctTrackedCourses() {
  const rows = await prisma.trackedCourse.groupBy({
    by: ["courseTypeId", "courseNameId", "phdDisciplineId"],
    _min: {
      courseTypeName: true,
      courseName: true,
    },
  });

  return rows.map((row) => ({
    courseTypeId: row.courseTypeId,
    courseNameId: row.courseNameId,
    phdDisciplineId: row.phdDisciplineId || "",
    courseTypeName: row._min.courseTypeName || "",
    courseName: row._min.courseName || "",
  }));
}

async function notifyTrackers(changedCourses) {
  if (!changedCourses.length) return;

  const orFilters = changedCourses.map((course) => ({
    courseTypeId: course.courseTypeId,
    courseNameId: course.courseNameId,
    phdDisciplineId: course.phdDisciplineId || "",
  }));

  const trackers = await prisma.trackedCourse.findMany({
    where: { OR: orFilters },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          pushSubscriptions: true,
        },
      },
    },
  });

  const changedByKey = new Map(
    changedCourses.map((course) => [courseKey(course), course])
  );

  const notificationRows = [];
  const deliveryJobs = [];

  for (const track of trackers) {
    const key = courseKey(track);
    const changed = changedByKey.get(key);
    if (!changed) continue;

    const title = `JMI result update: ${changed.courseName}`;
    const body =
      changed.results?.length > 0
        ? `${changed.results.length} result row(s) found for ${changed.courseName}.`
        : `Results updated for ${changed.courseName}.`;
    const resultLink = primaryResultLink(changed.results);

    notificationRows.push({
      userId: track.userId,
      courseTypeId: changed.courseTypeId,
      courseNameId: changed.courseNameId,
      phdDisciplineId: changed.phdDisciplineId || "",
      courseTypeName: changed.courseTypeName || track.courseTypeName,
      courseName: changed.courseName || track.courseName,
      title,
      body,
      resultLink,
      fingerprint: changed.fingerprint,
    });

    deliveryJobs.push({
      userId: track.userId,
      email: track.user.email,
      subscriptions: track.user.pushSubscriptions,
      title,
      body,
      resultLink,
      courseName: changed.courseName || track.courseName,
      courseTypeName: changed.courseTypeName || track.courseTypeName,
      courseTypeId: changed.courseTypeId,
      courseNameId: changed.courseNameId,
      phdDisciplineId: changed.phdDisciplineId || "",
    });
  }

  if (!notificationRows.length) return;

  await prisma.resultNotification.createMany({ data: notificationRows });

  // Fetch created notifications for deep links (one query)
  const created = await prisma.resultNotification.findMany({
    where: {
      userId: { in: [...new Set(deliveryJobs.map((j) => j.userId))] },
      fingerprint: { in: [...new Set(changedCourses.map((c) => c.fingerprint))] },
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
    orderBy: { createdAt: "desc" },
  });

  const notifByUserCourse = new Map();
  for (const n of created) {
    const key = `${n.userId}::${courseKey(n)}`;
    if (!notifByUserCourse.has(key)) {
      notifByUserCourse.set(key, n);
    }
  }

  await Promise.all(
    deliveryJobs.map(async (job) => {
      const notif = notifByUserCourse.get(
        `${job.userId}::${courseKey(job)}`
      );
      const notificationId = notif?.id;
      const url = notificationId
        ? `/tracked-results?n=${notificationId}`
        : "/tracked-results";

      try {
        await sendPushToSubscriptions(job.subscriptions, {
          title: job.title,
          body: job.body,
          url,
          notificationId,
          resultLink: job.resultLink,
        });
      } catch (error) {
        console.error("Push fanout error:", error?.message || error);
      }

      try {
        if (notificationId) {
          await sendResultUpdateEmail({
            to: job.email,
            courseName: job.courseName,
            courseTypeName: job.courseTypeName,
            notificationId,
            resultLink: job.resultLink,
          });
        }
      } catch (error) {
        console.error("Email fanout error:", error?.message || error);
      }
    })
  );
}

/**
 * Poll JMI for all uniquely tracked courses and notify on fingerprint change.
 * @returns {{ skipped?: boolean, checked: number, changed: number, errors: number }}
 */
export async function runResultPoll() {
  if (isRunning) {
    return { skipped: true, checked: 0, changed: 0, errors: 0 };
  }

  isRunning = true;
  const now = new Date();

  try {
    const courses = await getDistinctTrackedCourses();
    if (!courses.length) {
      return { checked: 0, changed: 0, errors: 0 };
    }

    const snapshots = await prisma.courseResultSnapshot.findMany({
      where: {
        OR: courses.map((c) => ({
          courseTypeId: c.courseTypeId,
          courseNameId: c.courseNameId,
          phdDisciplineId: c.phdDisciplineId || "",
        })),
      },
    });

    const snapshotByKey = new Map(
      snapshots.map((s) => [courseKey(s), s])
    );

    const unchangedIds = [];
    const changedCourses = [];
    let errors = 0;

    for (const course of courses) {
      try {
        const results = await fetchJmiResults({
          courseTypeId: course.courseTypeId,
          courseNameId: course.courseNameId,
          phdDisciplineId: course.phdDisciplineId || "",
        });
        const fingerprint = fingerprintResults(results);
        const key = courseKey(course);
        const existing = snapshotByKey.get(key);

        if (existing && existing.fingerprint === fingerprint) {
          unchangedIds.push(existing.id);
          continue;
        }

        const isChange = Boolean(existing && existing.fingerprint !== fingerprint);

        await prisma.courseResultSnapshot.upsert({
          where: {
            courseTypeId_courseNameId_phdDisciplineId: {
              courseTypeId: course.courseTypeId,
              courseNameId: course.courseNameId,
              phdDisciplineId: course.phdDisciplineId || "",
            },
          },
          create: {
            courseTypeId: course.courseTypeId,
            courseNameId: course.courseNameId,
            phdDisciplineId: course.phdDisciplineId || "",
            courseTypeName: course.courseTypeName,
            courseName: course.courseName,
            fingerprint,
            resultsJson: results,
            lastCheckedAt: now,
            lastChangedAt: null,
          },
          update: {
            courseTypeName: course.courseTypeName,
            courseName: course.courseName,
            fingerprint,
            resultsJson: results,
            lastCheckedAt: now,
            ...(isChange ? { lastChangedAt: now } : {}),
          },
        });

        // First scrape only sets baseline; notify only when fingerprint changes
        if (isChange) {
          changedCourses.push({
            ...course,
            fingerprint,
            results,
          });
        }
      } catch (error) {
        errors += 1;
        console.error(
          `Result poll failed for ${course.courseName}:`,
          error?.message || error
        );
      }
    }

    if (unchangedIds.length) {
      await prisma.courseResultSnapshot.updateMany({
        where: { id: { in: unchangedIds } },
        data: { lastCheckedAt: now },
      });
    }

    if (changedCourses.length) {
      await notifyTrackers(changedCourses);
    }

    return {
      checked: courses.length,
      changed: changedCourses.length,
      errors,
    };
  } finally {
    isRunning = false;
  }
}

export function startResultPoller() {
  const cronExpr = process.env.RESULT_POLL_CRON || "*/15 * * * *";

  import("node-cron")
    .then((mod) => {
      const cron = mod.default;
      if (!cron.validate(cronExpr)) {
        console.error("Invalid RESULT_POLL_CRON expression:", cronExpr);
        return;
      }

      cron.schedule(cronExpr, () => {
        runResultPoll().catch((error) => {
          console.error("Result poller tick failed:", error?.message || error);
        });
      });

      console.log(`JMI result poller scheduled (${cronExpr})`);

      // Delayed first run so migrations / boot settle
      setTimeout(() => {
        runResultPoll().catch((error) => {
          console.error("Initial result poll failed:", error?.message || error);
        });
      }, 60_000);
    })
    .catch((error) => {
      console.error("Failed to start result poller:", error?.message || error);
    });
}
