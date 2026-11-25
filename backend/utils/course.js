// A "course" is every previous-year paper of the same entrance exam, e.g. all
// "JMI MCA(M-54) Entrance Examination <year>" quizzes. Quiz titles are typed by
// hand, so the key has to survive punctuation and spacing differences.

const YEAR_PATTERN = /\b20[1-3]\d(?:\s*[-/]\s*(?:20)?\d{2})?\b/g;
const EXAM_WORDS_PATTERN = /\b(?:entrance\s+examination|entrance\s+exam|entrance|examination)\b/gi;

export const courseNameFromTitle = (title = '') =>
  String(title)
    .replace(YEAR_PATTERN, ' ')
    .replace(EXAM_WORDS_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const courseKeyFromTitle = (title = '') =>
  courseNameFromTitle(title).toLowerCase().replace(/[^a-z0-9]/g, '');

export const universityFromTitle = (title = '') => {
  const first = String(title).trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  if (first === 'JMI') return 'JMI';
  if (first === 'AMU') return 'AMU';
  return 'Other';
};

export const normalizeEducationLevel = (value) => {
  const v = String(value ?? '').trim().toLowerCase();
  if (['undergrads', 'undergraduate', 'ug'].includes(v)) return 'undergrad';
  if (['postgrad', 'pg', 'master'].includes(v)) return 'masters';
  return v;
};
