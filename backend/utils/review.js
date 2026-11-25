// Leitner spaced repetition. Must stay identical to the mobile app's
// ReviewScheduler, which computes the same state offline.

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 16, 35];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Review state implied by the full answer history of one (user, question).
 * Returns null when the question was never answered wrong.
 */
export const computeReviewState = (responses) => {
  const sorted = [...responses].sort(
    (a, b) => new Date(a.answeredAt) - new Date(b.answeredAt)
  );

  let wrongCount = 0;
  let box = 0;
  for (const r of sorted) {
    if (r.isCorrect) {
      box += 1;
    } else {
      wrongCount += 1;
      box = 0;
    }
  }
  if (wrongCount === 0) return null;

  const lastAnsweredAt = new Date(sorted[sorted.length - 1].answeredAt);
  const graduated = box >= REVIEW_INTERVAL_DAYS.length;
  const dueAt = graduated
    ? lastAnsweredAt
    : new Date(lastAnsweredAt.getTime() + REVIEW_INTERVAL_DAYS[box] * DAY_MS);

  return { box, dueAt, lastAnsweredAt, wrongCount, graduated };
};
