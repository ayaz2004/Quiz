import { ApiError } from './error.js';

// Validate scholarship creation/update payload
export const validateScholarship = (req, res, next) => {
  try {
    const data = req.body.scholarshipData ? JSON.parse(req.body.scholarshipData) : req.body;

    if (!data) return next(new ApiError(400, 'scholarshipData is required'));

    if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      return next(new ApiError(400, 'Scholarship title is required'));
    }

    if (!data.provider || typeof data.provider !== 'string' || data.provider.trim().length === 0) {
      return next(new ApiError(400, 'Provider is required'));
    }

    if (data.applyUrl && typeof data.applyUrl === 'string') {
      try {
        const u = new URL(data.applyUrl);
      } catch (e) {
        return next(new ApiError(400, 'applyUrl must be a valid URL'));
      }
    }

    if (data.deadline && isNaN(Date.parse(data.deadline))) {
      return next(new ApiError(400, 'deadline must be a valid date'));
    }

    // Arrays
    if (data.eligibility && !Array.isArray(data.eligibility)) {
      return next(new ApiError(400, 'eligibility must be an array'));
    }
    if (data.documents && !Array.isArray(data.documents)) {
      return next(new ApiError(400, 'documents must be an array'));
    }
    if (data.steps && !Array.isArray(data.steps)) {
      return next(new ApiError(400, 'steps must be an array'));
    }

    // status if provided
    if (data.status && !['PUBLISHED', 'UNPUBLISHED'].includes(data.status)) {
      return next(new ApiError(400, 'Invalid status'));
    }

    // categoryId if provided should be integer
    if (data.categoryId !== undefined && data.categoryId !== null) {
      const cid = parseInt(data.categoryId);
      if (isNaN(cid)) return next(new ApiError(400, 'categoryId must be an integer'));
    }

    // attach parsed data back
    req.body = req.body.scholarshipData ? { ...req.body, scholarshipData: data } : { ...data };
    next();
  } catch (error) {
    return next(new ApiError(400, 'Invalid scholarshipData'));
  }
};
