import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../config/env.js';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSON_PATH = path.join(__dirname, 'scholarships.json');
const preferredCategoryOrder = ['9th/10th', '11th/12th', 'UG', 'PG', 'Others'];

const prisma = new PrismaClient();

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

const toDateOnly = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  return parseDate(value)?.toISOString().split('T')[0] ?? null;
};

const asStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => normalize(item)).filter(Boolean);
};

const loadSeed = () => {
  if (!fs.existsSync(JSON_PATH)) {
    throw new Error(`Scholarship JSON was not found at ${JSON_PATH}`);
  }

  const payload = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  const scholarships = Array.isArray(payload) ? payload : payload?.scholarships;
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];

  if (!Array.isArray(scholarships) || scholarships.length === 0) {
    throw new Error('No scholarships were found in scholarships.json.');
  }

  return { categories, scholarships };
};

const resolveCategories = (seedCategories, scholarships) => {
  const usedLabels = new Set(
    scholarships
      .map((item) => normalize(item.category))
      .filter(Boolean)
  );

  return [...new Set([
    ...preferredCategoryOrder,
    ...seedCategories.map((label) => normalize(label)).filter(Boolean),
    ...usedLabels,
  ])].filter((label) => preferredCategoryOrder.includes(label) || usedLabels.has(label));
};

async function importScholarships() {
  const { categories: seedCategories, scholarships } = loadSeed();
  const categoryLabels = resolveCategories(seedCategories, scholarships);

  await prisma.scholarship.deleteMany();
  await prisma.scholarshipCategory.deleteMany();

  const createdCategories = [];
  for (const label of categoryLabels) {
    createdCategories.push(await prisma.scholarshipCategory.create({ data: { label } }));
  }

  const categoryIdMap = new Map(createdCategories.map((category) => [category.label, category.id]));
  let inserted = 0;

  for (const item of scholarships) {
    const title = normalize(item.title);
    const provider = normalize(item.provider);
    if (!title || !provider) continue;

    const slug = normalize(item.slug);
    if (!slug) {
      throw new Error(`Scholarship "${title}" is missing a slug.`);
    }

    const categoryLabel = normalize(item.category) || 'Others';
    const categoryId = categoryIdMap.get(categoryLabel) ?? null;
    const status = item.status === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED';
    const startDate = parseDate(item.startDate);

    await prisma.scholarship.create({
      data: {
        slug,
        title,
        provider,
        description: normalize(item.description) || null,
        about: normalize(item.about) || null,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
        amount: normalize(item.amount) || null,
        deadline: parseDate(item.deadline),
        applyUrl: normalize(item.applyUrl) || null,
        eligibility: asStringArray(item.eligibility),
        documents: asStringArray(item.documents),
        steps: asStringArray(item.steps),
        importantInfo: normalize(item.importantInfo) || null,
        featured: Boolean(item.featured),
        status,
      },
    });

    if (startDate) {
      await prisma.$executeRaw`UPDATE "scholarships" SET "start_date" = ${startDate} WHERE slug = ${slug}`;
    }

    inserted += 1;
  }

  console.log(`Imported ${inserted} scholarships from scholarships.json.`);
  console.log('Categories:', categoryLabels.join(', '));
}

async function exportScholarships() {
  const categories = await prisma.scholarshipCategory.findMany({
    orderBy: { id: 'asc' },
  });
  const scholarships = await prisma.scholarship.findMany({
    orderBy: { id: 'asc' },
  });

  const categoryMap = new Map(categories.map((category) => [category.id, category.label]));
  const usedLabels = [...new Set(scholarships.map((item) => categoryMap.get(item.categoryId)).filter(Boolean))];
  const orderedCategories = [...new Set([...preferredCategoryOrder, ...usedLabels])]
    .filter((label) => preferredCategoryOrder.includes(label) || usedLabels.includes(label));

  const startRows = await prisma.$queryRaw`SELECT slug, start_date FROM scholarships`;
  const startDateBySlug = new Map(startRows.map((row) => [row.slug, row.start_date]));

  const payload = {
    categories: orderedCategories,
    scholarships: scholarships.map((item) => ({
      slug: item.slug,
      title: item.title,
      provider: item.provider,
      description: item.description,
      about: item.about,
      category: categoryMap.get(item.categoryId) || 'Others',
      amount: item.amount,
      startDate: toDateOnly(item.startDate ?? startDateBySlug.get(item.slug)),
      deadline: toDateOnly(item.deadline),
      applyUrl: item.applyUrl,
      eligibility: asStringArray(item.eligibility),
      documents: asStringArray(item.documents),
      steps: asStringArray(item.steps),
      importantInfo: item.importantInfo,
      featured: Boolean(item.featured),
      status: item.status === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED',
    })),
  };

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Exported ${payload.scholarships.length} scholarships to ${JSON_PATH}`);
}

async function main() {
  const shouldExport = process.argv.includes('--export');

  try {
    if (shouldExport) {
      await exportScholarships();
    } else {
      await importScholarships();
    }
  } catch (error) {
    console.error(`${shouldExport ? 'Export' : 'Import'} failed:`, error?.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
