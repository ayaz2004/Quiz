// Students live in India, so "a day" for streaks is the Asia/Kolkata calendar
// day. IST is a fixed UTC+5:30 with no daylight saving.

const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const istDateString = (date = new Date()) =>
  new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** Midnight UTC of a YYYY-MM-DD string, the value Prisma expects for @db.Date. */
export const dateOnly = (dateString) => new Date(`${dateString}T00:00:00.000Z`);

export const shiftDateString = (dateString, days) =>
  new Date(dateOnly(dateString).getTime() + days * DAY_MS).toISOString().slice(0, 10);

/**
 * `current` counts consecutive active days ending today, or ending yesterday
 * when there is no activity yet today: a streak only breaks after a full
 * missed day.
 */
export const computeStreak = (dateStrings, todayString) => {
  const days = new Set(dateStrings);
  if (days.size === 0) return { current: 0, longest: 0 };

  let cursor = days.has(todayString) ? todayString : shiftDateString(todayString, -1);
  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = shiftDateString(cursor, -1);
  }

  const sorted = [...days].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = shiftDateString(sorted[i - 1], 1) === sorted[i] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest: Math.max(longest, current) };
};
