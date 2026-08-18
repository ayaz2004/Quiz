const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})/;

const parseScholarshipDate = (value) => {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = value.trim().match(DATE_ONLY);
    if (match) {
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatScholarshipDate = (value) => {
  const date = parseScholarshipDate(value);
  if (!date) return 'Not announced';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
