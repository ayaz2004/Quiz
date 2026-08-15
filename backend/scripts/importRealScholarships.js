import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import prisma from '../config/db.config.js';

const PYTHON_PATH = 'C:/Users/haroo/OneDrive/Desktop/Quiz/.venv/Scripts/python.exe';
const SCRIPT_PATH = path.resolve('scripts/exportScholarshipWorkbook.py');
const JSON_PATH = path.resolve('scripts/scholarshipWorkbook.json');

const categoryMap = {
  'Class 9': '9th/10th',
  'Class 10': '9th/10th',
  'Class 11': '11th/12th',
  'Class 12': '11th/12th',
  'Class 12 / UG': 'UG',
  'UG': 'UG',
  'PG': 'PG',
  'Post Graduate': 'PG',
  'Postgraduate': 'PG',
  'Others': 'Others',
  'Other': 'Others',
};

const preferredCategoryOrder = ['9th/10th', '11th/12th', 'UG', 'PG', 'Others'];

const normalize = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const parseDate = (value) => {
  const text = normalize(value);
  if (!text) return null;

  const dateValue = new Date(text);
  if (!Number.isNaN(dateValue.getTime())) return dateValue;

  const altValue = new Date(`${text}T00:00:00`);
  if (!Number.isNaN(altValue.getTime())) return altValue;

  return null;
};

const splitList = (value) => {
  const text = normalize(value);
  if (!text) return [];
  return text
    .split(/\n|;|\|/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
};

const slugify = (title, index) => {
  const base = normalize(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `scholarship-${index + 1}`;
  return `${base}-${index + 1}`;
};

const isClosedOrExpired = (statusText, deadline) => {
  const text = normalize(statusText).toLowerCase();
  const ignoreTokens = [
    'closed',
    'call-specific',
    'cycle-specific',
    'verify current social justice / nsp notice',
    'verify on aicte portal',
  ];

  const statusClosed = ignoreTokens.some((token) => text.includes(token));
  const expired = Boolean(deadline && deadline < new Date());
  return statusClosed || expired;
};

async function importScholarships() {
  try {
    execFileSync(PYTHON_PATH, [SCRIPT_PATH], { stdio: 'inherit' });

    if (!fs.existsSync(JSON_PATH)) {
      throw new Error('Workbook export JSON was not created.');
    }

    const raw = fs.readFileSync(JSON_PATH, 'utf8');
    const rows = JSON.parse(raw);

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error('No scholarships were exported from the workbook.');
    }

    const categoryLabels = [...new Set(
      rows
        .map((row) => normalize(row['Category (Website)']))
        .filter(Boolean)
        .map((label) => categoryMap[label] || label || 'Others')
    )];

    const orderedCategoryLabels = [...new Set([...preferredCategoryOrder, ...categoryLabels])].filter((label) =>
      label && (preferredCategoryOrder.includes(label) || categoryLabels.includes(label))
    );

    await prisma.scholarship.deleteMany();
    await prisma.scholarshipCategory.deleteMany();

    const createdCategories = [];
    for (const label of orderedCategoryLabels) {
      const category = await prisma.scholarshipCategory.create({ data: { label } });
      createdCategories.push(category);
    }

    const categoryIdMap = new Map(createdCategories.map((category) => [category.label, category.id]));
    let inserted = 0;

    for (const [index, row] of rows.entries()) {
      const title = normalize(row['Scholarship Name']);
      const provider = normalize(row['Provider / Offering Body']);
      if (!title || !provider) continue;

      const rawCategory = normalize(row['Category (Website)']);
      const categoryLabel = categoryMap[rawCategory] || rawCategory || 'Others';
      const categoryId = categoryIdMap.get(categoryLabel) ?? null;

      const startDate = parseDate(row['Application Start Date']);
      const deadline = parseDate(row['Application Deadline']);
      const status = isClosedOrExpired(row['Application Status'], deadline) ? 'UNPUBLISHED' : 'PUBLISHED';

      const eligibility = [
        row['Eligibility - Course Level'],
        row['Eligibility - Min. Marks'],
        row['Eligibility - Income Ceiling'],
        row['Eligibility - Other Criteria'],
      ]
        .map((value) => normalize(value))
        .filter(Boolean);

      const documents = splitList(row['Required Documents']);
      const steps = [
        row['Selection Process'],
        row['Notes / Special Instructions'],
        row['FAQ / Help Link'],
      ]
        .map((value) => normalize(value))
        .filter(Boolean);

      await prisma.scholarship.create({
        data: {
          slug: slugify(title, index),
          title,
          provider,
          description: normalize(row['Short Description']) || null,
          about: normalize(row['Detailed Description']) || null,
          categoryId,
          amount: normalize(row['Scholarship Amount']) || null,
          startDate,
          deadline,
          applyUrl: normalize(row['Application Portal / Link']) || normalize(row['Official Website']) || null,
          eligibility,
          documents,
          steps,
          importantInfo: normalize(row['Verification Notes']) || normalize(row['Notes / Special Instructions']) || null,
          featured: false,
          status,
        },
      });

      inserted += 1;
    }

    console.log(`Imported ${inserted} scholarships from the real workbook.`);
    console.log('Categories:', categoryLabels);
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error?.message || error);
    process.exit(1);
  }
}

importScholarships();
