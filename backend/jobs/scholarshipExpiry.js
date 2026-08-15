import prisma from "../config/db.config.js";
import cron from "node-cron";

export async function syncExpiredScholarships() {
  const now = new Date();

  const result = await prisma.scholarship.updateMany({
    where: {
      status: "PUBLISHED",
      deadline: {
        not: null,
        lt: now,
      },
    },
    data: {
      status: "UNPUBLISHED",
    },
  });

  return result.count || 0;
}

export function startScholarshipExpiryJob() {
  const cronExpr = process.env.SCHOLARSHIP_EXPIRY_CRON || "0 * * * *";

  if (!cron.validate(cronExpr)) {
    console.error("Invalid SCHOLARSHIP_EXPIRY_CRON expression:", cronExpr);
    return;
  }

  cron.schedule(cronExpr, async () => {
    try {
      const count = await syncExpiredScholarships();
      if (count > 0) {
        console.log(`Auto-unpublished ${count} expired scholarship(s)`);
      }
    } catch (error) {
      console.error("Scholarship expiry job failed:", error?.message || error);
    }
  });

  console.log(`Scholarship expiry job scheduled (${cronExpr})`);

  setTimeout(() => {
    syncExpiredScholarships()
      .then((count) => {
        if (count > 0) {
          console.log(`Initial expiry sync unpublished ${count} scholarship(s)`);
        }
      })
      .catch((error) => {
        console.error("Initial scholarship expiry sync failed:", error?.message || error);
      });
  }, 15_000);
}
