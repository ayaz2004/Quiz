import prisma from "../config/db.config.js";
import { dateOnly, istDateString } from "../utils/istDate.js";

// What a free plan can be limited on. Usage is read from tables the apps
// already write (daily_activities, quiz_attempts), so nothing extra is tracked.
export const FEATURES = {
  practice_questions_daily: {
    label: "Practice questions per day",
    blockedMessage: (n) => `The free plan includes ${n} practice questions a day. Come back tomorrow or upgrade to Pro.`,
  },
  mock_tests_monthly: {
    label: "Mock tests per month",
    blockedMessage: (n) => `The free plan includes ${n} mock tests a month. Upgrade to Pro for unlimited tests.`,
  },
};

export const isPro = (user) =>
  user.isAdmin === 1 ||
  (user.plan === "pro" && (!user.planExpiresAt || user.planExpiresAt > new Date()));

/** Start of the current Asia/Kolkata calendar month. */
export const istMonthStart = (now = new Date()) =>
  new Date(`${istDateString(now).slice(0, 8)}01T00:00:00+05:30`);

/** Every feature with its free-plan limit; features never configured are unlimited. */
export const loadLimits = async () => {
  const rows = new Map((await prisma.featureLimit.findMany()).map((r) => [r.key, r]));
  return Object.entries(FEATURES).map(([key, { label }]) => ({
    key,
    label,
    freeLimit: rows.get(key)?.freeLimit ?? null,
    enforced: rows.get(key)?.enforced ?? false,
  }));
};

const usageFor = async (userId) => {
  const [today, tests] = await Promise.all([
    prisma.dailyActivity.findUnique({
      where: { userId_date: { userId, date: dateOnly(istDateString()) } },
      select: { questionsAnswered: true },
    }),
    prisma.quizAttempt.count({ where: { userId, attemptedAt: { gte: istMonthStart() } } }),
  ]);
  return {
    practice_questions_daily: today?.questionsAnswered ?? 0,
    mock_tests_monthly: tests,
  };
};

/**
 * The user's plan and, per feature, the limit that applies to them, what they
 * have used, and whether they are blocked right now.
 */
export const entitlementsFor = async (user) => {
  const pro = isPro(user);
  const [limits, used] = await Promise.all([loadLimits(), usageFor(user.id)]);
  return {
    plan: pro ? "pro" : "free",
    planExpiresAt: pro ? user.planExpiresAt ?? null : null,
    features: limits.map((f) => {
      const limit = pro ? null : f.freeLimit;
      const blocked = f.enforced && limit !== null && used[f.key] >= limit;
      return {
        key: f.key,
        label: f.label,
        limit,
        used: used[f.key],
        enforced: f.enforced,
        blocked,
        message: blocked ? FEATURES[f.key].blockedMessage(limit) : null,
      };
    }),
  };
};

/** The message to show when [user] may not use [key] now, otherwise null. */
export const featureBlockMessage = async (user, key) => {
  if (isPro(user)) return null;
  const { features } = await entitlementsFor(user);
  return features.find((f) => f.key === key)?.message ?? null;
};
