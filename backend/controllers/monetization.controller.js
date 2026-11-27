import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { dateOnly, istDateString, shiftDateString } from "../utils/istDate.js";
import { FEATURES, loadLimits } from "../services/entitlements.js";

const MONTHS_SHOWN = 6;

// Limits to test against real usage, besides the one currently set.
const CANDIDATE_LIMITS = {
  practice_questions_daily: [10, 20, 30, 50, 100],
  mock_tests_monthly: [1, 2, 3, 5, 10],
};

/** "YYYY-MM" for the IST month [offset] months before the current one. */
const monthKey = (offset) => {
  const [y, m] = istDateString().slice(0, 7).split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 - offset, 1));
  return d.toISOString().slice(0, 7);
};

/**
 * For each candidate limit, how many recently active users reached it at
 * least once. [peaks] is each user's highest usage in one period.
 */
const limitImpact = (peaks, limits) =>
  [...new Set(limits)].sort((a, b) => a - b).map((limit) => {
    const users = peaks.filter((p) => p >= limit).length;
    return {
      limit,
      users,
      percent: peaks.length ? Math.round((users / peaks.length) * 1000) / 10 : 0,
    };
  });

/**
 * GET /api/admin/monetization
 * Limits with their would-be impact, active users, revenue and running
 * costs per month, and the current Pro users.
 */
export const getMonetization = async (req, res, next) => {
  try {
    const firstMonth = monthKey(MONTHS_SHOWN - 1);
    const since = new Date(`${firstMonth}-01T00:00:00+05:30`);
    const since30Days = dateOnly(shiftDateString(istDateString(), -29));
    const since3Months = new Date(`${monthKey(2)}-01T00:00:00+05:30`);

    const [limits, active, revenue, signups, costs, practicePeaks, testPeaks, totalUsers, proUsers] = await Promise.all([
      loadLimits(),
      prisma.$queryRaw`
        SELECT month, COUNT(DISTINCT user_id)::int AS users FROM (
          SELECT user_id, to_char("date", 'YYYY-MM') AS month
            FROM daily_activities WHERE "date" >= ${dateOnly(`${firstMonth}-01`)}
          UNION ALL
          SELECT user_id, to_char(attempted_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM')
            FROM quiz_attempts WHERE attempted_at >= ${since}
        ) a GROUP BY month`,
      prisma.$queryRaw`
        SELECT to_char(purchased_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM') AS month,
               COALESCE(SUM(amount), 0)::float AS amount
          FROM purchases WHERE status = 'completed' AND purchased_at >= ${since} GROUP BY 1`,
      prisma.$queryRaw`
        SELECT to_char("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM') AS month,
               COUNT(*)::int AS users
          FROM "User" WHERE "createdAt" >= ${since} GROUP BY 1`,
      prisma.monthlyCost.findMany({
        where: { month: { gte: dateOnly(`${firstMonth}-01`) } },
        orderBy: [{ month: "desc" }, { item: "asc" }],
      }),
      prisma.$queryRaw`
        SELECT MAX(questions_answered)::int AS peak
          FROM daily_activities WHERE "date" >= ${since30Days} GROUP BY user_id`,
      prisma.$queryRaw`
        SELECT MAX(n)::int AS peak FROM (
          SELECT user_id, COUNT(*) AS n FROM quiz_attempts WHERE attempted_at >= ${since3Months}
          GROUP BY user_id, date_trunc('month', attempted_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')
        ) t GROUP BY user_id`,
      prisma.user.count(),
      prisma.user.findMany({
        where: { plan: "pro", OR: [{ planExpiresAt: null }, { planExpiresAt: { gt: new Date() } }] },
        select: { id: true, email: true, planExpiresAt: true },
        orderBy: { email: "asc" },
      }),
    ]);

    const byMonth = (rows, field) => new Map(rows.map((r) => [r.month, r[field]]));
    const activeBy = byMonth(active, "users");
    const revenueBy = byMonth(revenue, "amount");
    const signupsBy = byMonth(signups, "users");
    const costBy = new Map();
    for (const c of costs) {
      const key = c.month.toISOString().slice(0, 7);
      costBy.set(key, (costBy.get(key) ?? 0) + c.amount);
    }

    const months = [];
    for (let i = 0; i < MONTHS_SHOWN; i++) {
      const month = monthKey(i);
      const activeUsers = activeBy.get(month) ?? 0;
      const cost = costBy.get(month) ?? 0;
      months.push({
        month,
        activeUsers,
        newUsers: signupsBy.get(month) ?? 0,
        revenue: revenueBy.get(month) ?? 0,
        cost,
        costPerActiveUser: activeUsers ? Math.round((cost / activeUsers) * 100) / 100 : null,
      });
    }

    const peaks = {
      practice_questions_daily: { rows: practicePeaks, window: "last 30 days" },
      mock_tests_monthly: { rows: testPeaks, window: "last 3 months" },
    };
    const features = limits.map((f) => {
      const values = peaks[f.key].rows.map((r) => r.peak);
      return {
        ...f,
        window: peaks[f.key].window,
        activeUsers: values.length,
        impact: limitImpact(values, [...CANDIDATE_LIMITS[f.key], ...(f.freeLimit ? [f.freeLimit] : [])]),
      };
    });

    res.status(200).json(new ApiResponse(200, {
      features,
      months,
      costs: costs.map((c) => ({ id: c.id, month: c.month.toISOString().slice(0, 7), item: c.item, amount: c.amount })),
      totalUsers,
      proUsers,
    }, "Monetization data fetched"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error fetching monetization data"));
  }
};

/**
 * PUT /api/admin/limits/:key
 * Body: { freeLimit: integer >= 0 or null, enforced: boolean }
 */
export const updateFeatureLimit = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!FEATURES[key]) return next(new ApiError(404, "Unknown feature"));

    const { freeLimit = null, enforced = false } = req.body || {};
    if (freeLimit !== null && (!Number.isInteger(freeLimit) || freeLimit < 0)) {
      return next(new ApiError(400, "freeLimit must be a whole number or null"));
    }
    if (typeof enforced !== "boolean") return next(new ApiError(400, "enforced must be true or false"));
    if (enforced && freeLimit === null) {
      return next(new ApiError(400, "Set a limit before enforcing it"));
    }

    const row = await prisma.featureLimit.upsert({
      where: { key },
      create: { key, freeLimit, enforced },
      update: { freeLimit, enforced },
    });
    res.status(200).json(new ApiResponse(200, row, "Limit saved"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error saving limit"));
  }
};

/**
 * PUT /api/admin/plans
 * Body: { email, plan: "free" | "pro", planExpiresAt?: ISO date or null }
 */
export const setUserPlan = async (req, res, next) => {
  try {
    const { email, plan, planExpiresAt = null } = req.body || {};
    if (!["free", "pro"].includes(plan)) return next(new ApiError(400, "plan must be free or pro"));

    let expires = null;
    if (plan === "pro" && planExpiresAt) {
      expires = new Date(planExpiresAt);
      if (Number.isNaN(expires.getTime())) return next(new ApiError(400, "Invalid planExpiresAt"));
    }

    const user = await prisma.user.findUnique({ where: { email: String(email || "").trim() } });
    if (!user) return next(new ApiError(404, "No user with that email"));

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { plan, planExpiresAt: expires },
      select: { id: true, email: true, plan: true, planExpiresAt: true },
    });
    res.status(200).json(new ApiResponse(200, updated, "Plan updated"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error updating plan"));
  }
};

/**
 * PUT /api/admin/costs
 * Body: { month: "YYYY-MM", item, amount } — replaces the amount for that item and month.
 */
export const saveMonthlyCost = async (req, res, next) => {
  try {
    const { month, item, amount } = req.body || {};
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month))) return next(new ApiError(400, "month must be YYYY-MM"));
    const name = String(item || "").trim();
    if (!name || name.length > 100) return next(new ApiError(400, "Item name is required (up to 100 characters)"));
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return next(new ApiError(400, "amount must be a positive number"));

    const monthDate = dateOnly(`${month}-01`);
    const row = await prisma.monthlyCost.upsert({
      where: { month_item: { month: monthDate, item: name } },
      create: { month: monthDate, item: name, amount: value },
      update: { amount: value },
    });
    res.status(200).json(new ApiResponse(200, row, "Cost saved"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error saving cost"));
  }
};

/**
 * DELETE /api/admin/costs/:id
 */
export const deleteMonthlyCost = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return next(new ApiError(400, "Invalid cost id"));
    await prisma.monthlyCost.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Cost deleted"));
  } catch (error) {
    next(new ApiError(500, error.message || "Error deleting cost"));
  }
};
