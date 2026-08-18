import prisma from "../config/db.config.js";
import cron from "node-cron";

export async function syncExpiredScholarships() {
  const now = new Date();

  const expiredResult = await prisma.scholarship.updateMany({
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

  const republishResult = await prisma.scholarship.updateMany({
    where: {
      status: "UNPUBLISHED",
      deadline: {
        not: null,
        gt: now,
      },
      startDate: {
        not: null,
        gt: now,
      },
    },
    data: {
      status: "PUBLISHED",
    },
  });

  return {
    expired: expiredResult.count || 0,
    republished: republishResult.count || 0,
  };
}

export function startScholarshipExpiryJob() {
  const cronExpr = process.env.SCHOLARSHIP_EXPIRY_CRON || "0 * * * *";

  if (!cron.validate(cronExpr)) {
    console.error("Invalid SCHOLARSHIP_EXPIRY_CRON expression:", cronExpr);
    return;
  }

  cron.schedule(cronExpr, async () => {
    try {
      const result = await syncExpiredScholarships();
      if (result.expired > 0 || result.republished > 0) {
        console.log(`Scholarship visibility sync: unpublished ${result.expired}, republished ${result.republished}`);
      }
    } catch (error) {
      console.error("Scholarship expiry job failed:", error?.message || error);
    }
  });

  console.log(`Scholarship expiry job scheduled (${cronExpr})`);

  setTimeout(() => {
    syncExpiredScholarships()
      .then((result) => {
        if (result.expired > 0 || result.republished > 0) {
          console.log(`Initial scholarship visibility sync: unpublished ${result.expired}, republished ${result.republished}`);
        }
      })
      .catch((error) => {
        console.error("Initial scholarship expiry sync failed:", error?.message || error);
      });
  }, 15_000);
}
