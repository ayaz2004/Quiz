import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";

// Utility to normalize category label to slug-like form (class-10)
const normalize = (s = '') => s.toString().trim().toLowerCase().replace(/\s+/g, '-');

// Public: list scholarships (only PUBLISHED)
export const listScholarships = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause - only published for public
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
      // Find category by normalized label
      const cats = await prisma.scholarshipCategory.findMany();
      const matched = cats.find(c => normalize(c.label) === normalize(category));
      if (matched) where.categoryId = matched.id;
      else {
        // no matching category -> return empty
        const empty = { scholarships: [], pagination: { currentPage: pageNum, totalPages: 0, total: 0, limit: limitNum } };
        return res.status(200).json(new ApiResponse(200, empty, 'No scholarships'));
      }
    }

    const total = await prisma.scholarship.count({ where });

    const rows = await prisma.scholarship.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    // Format results to match frontend shape
    const scholarships = rows.map(s => ({
      id: s.slug,
      slug: s.slug,
      title: s.title,
      provider: s.provider,
      categoryId: s.categoryId,
      amount: s.amount,
      deadline: s.deadline ? s.deadline.toDateString() : null,
      description: s.description,
      about: s.about,
      eligibility: s.eligibility || [],
      documents: s.documents || [],
      steps: s.steps || [],
      importantInfo: s.importantInfo,
      applyUrl: s.applyUrl,
      featured: s.featured,
      categoryLabel: null,
    }));

    // Fill categoryLabel by fetching categories for the returned categoryIds
    const catIds = Array.from(new Set(scholarships.map(s => s.categoryId).filter(Boolean)));
    if (catIds.length) {
      const cats = await prisma.scholarshipCategory.findMany({ where: { id: { in: catIds } } });
      scholarships.forEach(s => {
        const c = cats.find(x => x.id === s.categoryId);
        s.categoryLabel = c ? c.label : null;
      });
    }

    res.status(200).json(new ApiResponse(200, {
      scholarships,
      pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), total, limit: limitNum }
    }, 'Scholarships fetched successfully'));

  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarships'));
  }
};

// Public: get scholarship details by slug (only if published)
export const getScholarshipBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) return next(new ApiError(400, 'Invalid scholarship id'));

    const s = await prisma.scholarship.findFirst({ where: { slug, status: 'PUBLISHED' } });
    if (!s) return next(new ApiError(404, 'Scholarship not found'));

    // include category label
    const category = s.categoryId ? await prisma.scholarshipCategory.findUnique({ where: { id: s.categoryId } }) : null;

    const result = {
      id: s.slug,
      slug: s.slug,
      title: s.title,
      provider: s.provider,
      categoryId: s.categoryId,
      categoryLabel: category ? category.label : null,
      amount: s.amount,
      deadline: s.deadline ? s.deadline.toDateString() : null,
      description: s.description,
      about: s.about,
      eligibility: s.eligibility || [],
      documents: s.documents || [],
      steps: s.steps || [],
      importantInfo: s.importantInfo,
      applyUrl: s.applyUrl,
      featured: s.featured,
    };

    res.status(200).json(new ApiResponse(200, result, 'Scholarship fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarship'));
  }
};

// Admin: create scholarship
export const createScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can create scholarships'));

    const data = req.body.scholarshipData ? JSON.parse(req.body.scholarshipData) : req.body;

    // generate slug if missing
    let slug = data.slug && data.slug.trim() ? data.slug.trim() : null;
    if (!slug && data.title) {
      slug = data.title.toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // ensure unique slug
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
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        amount: data.amount || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        applyUrl: data.applyUrl || null,
        eligibility: data.eligibility || [],
        documents: data.documents || [],
        steps: data.steps || [],
        importantInfo: data.importantInfo || null,
        featured: !!data.featured,
        status: data.status === 'PUBLISHED' ? 'PUBLISHED' : 'UNPUBLISHED',
      }
    });

    res.status(201).json(new ApiResponse(201, created, 'Scholarship created'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error creating scholarship'));
  }
};

// Admin: list all scholarships (admin view)
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

    const total = await prisma.scholarship.count({ where });
    const rows = await prisma.scholarship.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } });

    const categoryIds = Array.from(new Set(rows.map(s => s.categoryId).filter(Boolean)));
    const categoryMap = new Map();

    if (categoryIds.length) {
      const categories = await prisma.scholarshipCategory.findMany({
        where: { id: { in: categoryIds } },
      });

      categories.forEach((category) => {
        categoryMap.set(category.id, category.label);
      });
    }

    const scholarships = rows.map((scholarship) => ({
      ...scholarship,
      categoryLabel: scholarship.categoryId ? categoryMap.get(scholarship.categoryId) || null : null,
    }));

    res.status(200).json(new ApiResponse(200, { scholarships, pagination: { currentPage: pageNum, totalPages: Math.ceil(total / limitNum), total, limit: limitNum } }, 'Admin scholarships'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error listing scholarships'));
  }
};

export const listScholarshipCategories = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can view scholarship categories'));

    const categories = await prisma.scholarshipCategory.findMany({
      orderBy: { id: 'asc' },
    });

    res.status(200).json(new ApiResponse(200, { categories }, 'Scholarship categories fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error listing scholarship categories'));
  }
};

// Admin: get scholarship by id (int)
export const adminGetScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can view this'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const s = await prisma.scholarship.findUnique({ where: { id } });
    if (!s) return next(new ApiError(404, 'Not found'));

    res.status(200).json(new ApiResponse(200, s, 'Scholarship retrieved'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error fetching scholarship'));
  }
};

// Admin: update scholarship
export const updateScholarship = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can update scholarships'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const data = req.body.scholarshipData ? JSON.parse(req.body.scholarshipData) : req.body;

    // If slug provided, ensure uniqueness
    if (data.slug) {
      const existing = await prisma.scholarship.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== id) return next(new ApiError(409, 'Slug already in use'));
    }

    const updated = await prisma.scholarship.update({ where: { id }, data: {
      slug: data.slug || undefined,
      title: data.title || undefined,
      provider: data.provider || undefined,
      description: data.description !== undefined ? data.description : undefined,
      about: data.about !== undefined ? data.about : undefined,
      categoryId: data.categoryId !== undefined ? (data.categoryId ? parseInt(data.categoryId) : null) : undefined,
      amount: data.amount !== undefined ? data.amount : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      applyUrl: data.applyUrl !== undefined ? data.applyUrl : undefined,
      eligibility: data.eligibility !== undefined ? data.eligibility : undefined,
      documents: data.documents !== undefined ? data.documents : undefined,
      steps: data.steps !== undefined ? data.steps : undefined,
      importantInfo: data.importantInfo !== undefined ? data.importantInfo : undefined,
      featured: data.featured !== undefined ? !!data.featured : undefined,
      status: data.status !== undefined ? data.status : undefined,
    }});

    res.status(200).json(new ApiResponse(200, updated, 'Scholarship updated'));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error updating scholarship'));
  }
};

// Admin: delete scholarship
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

// Admin: toggle publish
export const togglePublish = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.isAdmin !== 1) return next(new ApiError(403, 'Only admins can publish/unpublish'));

    const id = parseInt(req.params.id);
    if (!Number.isInteger(id)) return next(new ApiError(400, 'Invalid scholarship id'));

    const s = await prisma.scholarship.findUnique({ where: { id } });
    if (!s) return next(new ApiError(404, 'Not found'));

    const newStatus = s.status === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
    const updated = await prisma.scholarship.update({ where: { id }, data: { status: newStatus } });
    res.status(200).json(new ApiResponse(200, updated, `Scholarship ${newStatus.toLowerCase()}`));
  } catch (error) {
    next(new ApiError(500, error.message || 'Error toggling publish'));
  }
};
