import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

const normalize = (s = '') => s.toString().trim().toLowerCase().replace(/\s+/g, '-');

const categoryOrder = {
  '9th/10th': 1,
  '11th/12th': 2,
  'UG': 3,
  'PG': 4,
  'PhD': 5,
  'Others': 6,
  'Other': 6,
};

const sortCategories = (categories = []) => [...categories].sort((a, b) => {
  const labelA = a?.label || '';
  const labelB = b?.label || '';
  const rankA = categoryOrder[labelA] ?? 999;
  const rankB = categoryOrder[labelB] ?? 999;

  if (rankA !== rankB) return rankA - rankB;
  return labelA.localeCompare(labelB);
});

const sortLabels = (labels = []) => [...new Set(labels.map((label) => String(label || '').trim()).filter(Boolean))]
  .sort((a, b) => {
    const rankA = categoryOrder[a] ?? 999;
    const rankB = categoryOrder[b] ?? 999;
    if (rankA !== rankB) return rankA - rankB;
    return a.localeCompare(b);
  });

const toIsoDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
};

const parseCategoryIds = (data = {}) => {
  const raw = data.categoryIds !== undefined
    ? data.categoryIds
    : (data.categoryId !== undefined && data.categoryId !== null ? [data.categoryId] : []);

  return [...new Set(
    (Array.isArray(raw) ? raw : [raw])
      .map((id) => parseInt(id, 10))
      .filter((id) => Number.isInteger(id) && id > 0)
  )];
};

const resolveCategoryLabels = async (data = {}) => {
  const catalog = await prisma.scholarshipCategory.findMany();
  const byId = new Map(catalog.map((category) => [category.id, category.label]));
  const byNorm = new Map(catalog.map((category) => [normalize(category.label), category.label]));

  if (Array.isArray(data.categoryLabels) && data.categoryLabels.length) {
    return sortLabels(data.categoryLabels.map((label) => byNorm.get(normalize(label)) || String(label).trim()));
  }

  const ids = parseCategoryIds(data);
  return sortLabels(ids.map((id) => byId.get(id)).filter(Boolean));
};

const idsFromLabels = (labels, catalog) => {
  const byLabel = new Map(catalog.map((category) => [category.label, category.id]));
  return sortLabels(labels).map((label) => byLabel.get(label)).filter(Boolean);
};

const toPublicScholarship = (scholarship) => ({
  id: scholarship.slug,
  slug: scholarship.slug,
  title: scholarship.title,
  provider: scholarship.provider,
  amount: scholarship.amount,
  startDate: toIsoDate(scholarship.startDate),
  deadline: toIsoDate(scholarship.deadline),
  description: scholarship.description,
  about: scholarship.about,
  eligibility: scholarship.eligibility || [],
  documents: scholarship.documents || [],
  steps: scholarship.steps || [],
  importantInfo: scholarship.importantInfo,
  applyUrl: scholarship.applyUrl,
  featured: scholarship.featured,
  categoryLabels: sortLabels(scholarship.categories),
});

const toAdminScholarship = (scholarship, catalog = []) => {
  const categoryLabels = sortLabels(scholarship.categories);
  return {
    ...scholarship,
    categoryLabels,
    categoryIds: idsFromLabels(categoryLabels, catalog),
  };
};

export const listScholarships = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { status: 'PUBLISHED' };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { about: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const cats = await prisma.scholarshipCategory.findMany();
      const matched = cats.find((item) => normalize(item.label) === normalize(category));
      if (!matched) {
        const empty = { scholarships: [], pagination: { currentPage: pageNum, totalPages: 0, total: 0, limit: limitNum } };
        return res.status(200).json(new ApiResponse(200, empty, 'No scholarships'));
      }
      where.categories = { has: matched.label };
    }

    const total = await prisma.scholarship.count({ where });
    const rows = await prisma.scholarship.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(new ApiResponse(200, {
      scholarships: rows.map(toPublicScholarship),
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), total, limit: limitNum }
    }, 'Scholarships fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarships'));
  }
};

export const getScholarshipBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) return next(new ApiError(400, 'Invalid scholarship id'));

    const scholarship = await prisma.scholarship.findFirst({
      where: { slug, status: 'PUBLISHED' },
    });
    if (!scholarship) return next(new ApiError(404, 'Scholarship not found'));

    res.status(200).json(new ApiResponse(200, toPublicScholarship(scholarship), 'Scholarship fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarship'));
  }
};

export const createScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can create scholarships'));

    const data = req.body.scholarshipData ? JSON.parse(req.body.scholarshipData) : req.body;
    const catalog = await prisma.scholarshipCategory.findMany();
    const categories = await resolveCategoryLabels(data);
    if (!categories.length) return next(new ApiError(400, 'Select at least one education level'));

    let slug = data.slug && data.slug.trim() ? data.slug.trim() : null;
    if (!slug && data.title) {
      slug = data.title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (!slug) return next(new ApiError(400, 'slug or title required'));
    const existing = await prisma.scholarship.findUnique({ where: { slug } });
    if (existing) return next(new ApiError(409, 'Scholarship with this slug already exists'));

    const created = await prisma.scholarship.create({
      data: {
        slug,
        title: data.title,
        provider: data.provider,
        description: data.description || null,
        about: data.about || null,
        categories,
        amount: data.amount || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        applyUrl: data.applyUrl || null,
        eligibility: data.eligibility || [],
        documents: data.documents || [],
        steps: data.steps || [],
        importantInfo: data.importantInfo || null,
        featured: !!data.featured,
        status: data.status === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED',
      },
    });

    res.status(201).json(new ApiResponse(201, toAdminScholarship(created, catalog), 'Scholarship created'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error creating scholarship'));
  }
};

export const adminListScholarships = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can view scholarships'));

    const { page = 1, limit = 50, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
      ];
    }

    const catalog = await prisma.scholarshipCategory.findMany();
    const total = await prisma.scholarship.count({ where });
    const rows = await prisma.scholarship.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(new ApiResponse(200, {
      scholarships: rows.map((row) => toAdminScholarship(row, catalog)),
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), total, limit: limitNum },
    }, 'Admin scholarships'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error listing scholarships'));
  }
};

export const listPublicScholarshipCategories = async (req, res, next) => {
  try {
    const categories = sortCategories(await prisma.scholarshipCategory.findMany());
    res.status(200).json(new ApiResponse(200, { categories }, 'Scholarship categories fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error listing scholarship categories'));
  }
};

export const listScholarshipCategories = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can view scholarship categories'));

    const categories = sortCategories(await prisma.scholarshipCategory.findMany());
    res.status(200).json(new ApiResponse(200, { categories }, 'Scholarship categories fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error listing scholarship categories'));
  }
};

export const adminGetScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can view this'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const catalog = await prisma.scholarshipCategory.findMany();
    const scholarship = await prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) return next(new ApiError(404, 'Not found'));

    res.status(200).json(new ApiResponse(200, toAdminScholarship(scholarship, catalog), 'Scholarship retrieved'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarship'));
  }
};

export const updateScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can update scholarships'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const data = req.body.scholarshipData ? JSON.parse(req.body.scholarshipData) : req.body;

    if (data.slug) {
      const existing = await prisma.scholarship.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) return next(new ApiError(409, 'Slug already in use'));
    }

    const hasCategoryPayload = data.categoryIds !== undefined
      || data.categoryId !== undefined
      || data.categoryLabels !== undefined;

    const catalog = await prisma.scholarshipCategory.findMany();
    const categories = hasCategoryPayload ? await resolveCategoryLabels(data) : null;
    if (hasCategoryPayload && !categories.length) {
      return next(new ApiError(400, 'Select at least one education level'));
    }

    const updated = await prisma.scholarship.update({
      where: { id },
      data: {
        slug: data.slug || undefined,
        title: data.title || undefined,
        provider: data.provider || undefined,
        description: data.description !== undefined ? data.description : undefined,
        about: data.about !== undefined ? data.about : undefined,
        amount: data.amount !== undefined ? data.amount : undefined,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        deadline: data.deadline !== undefined ? (data.deadline ? new Date(data.deadline) : null) : undefined,
        applyUrl: data.applyUrl !== undefined ? data.applyUrl : undefined,
        eligibility: data.eligibility !== undefined ? data.eligibility : undefined,
        documents: data.documents !== undefined ? data.documents : undefined,
        steps: data.steps !== undefined ? data.steps : undefined,
        importantInfo: data.importantInfo !== undefined ? data.importantInfo : undefined,
        featured: data.featured !== undefined ? !!data.featured : undefined,
        status: data.status !== undefined ? data.status : undefined,
        ...(categories ? { categories } : {}),
      },
    });

    res.status(200).json(new ApiResponse(200, toAdminScholarship(updated, catalog), 'Scholarship updated'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error updating scholarship'));
  }
};

export const deleteScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can delete scholarships'));

    const id = parseInt(req.params.scholarshipId);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    await prisma.scholarship.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, 'Scholarship deleted'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error deleting scholarship'));
  }
};

export const togglePublish = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can publish/unpublish'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const scholarship = await prisma.scholarship.findUnique({ where: { id } });
    if (!scholarship) return next(new ApiError(404, 'Not found'));

    const newStatus = scholarship.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    const updated = await prisma.scholarship.update({ where: { id }, data: { status: newStatus } });
    res.status(200).json(new ApiResponse(200, updated, `Scholarship ${newStatus.toLowerCase()}`));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error toggling publish'));
  }
};
