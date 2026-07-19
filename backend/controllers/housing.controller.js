import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import { uploadImage } from "../utils/cloudinary.js";
import {
  PUBLIC_LISTING_SELECT,
  formatPublicListing,
  normalizePhone,
} from "../utils/validateHousing.js";
import fs from "fs";

const MAX_IMAGES = 3;
const MAX_LISTINGS_PER_DAY = 5;

const isAdmin = (user) => user?.isAdmin === 1;

const uploadListingImages = async (files = []) => {
  const urls = [];
  for (const file of files.slice(0, MAX_IMAGES)) {
    const url = await uploadImage(file.path);
    if (url) urls.push(url);
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
  return urls;
};

const cleanupUploadedFiles = (files = []) => {
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};

/**
 * GET /api/housing/listings — active community listings (public)
 */
export const listCommunityListings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      listingType,
      genderPreference,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      status: "active",
      university: "JMI",
    };

    if (listingType && ["room", "pg", "hostel"].includes(listingType)) {
      where.listingType = listingType;
    }

    if (genderPreference && ["male", "female", "any"].includes(genderPreference)) {
      where.genderPreference = genderPreference;
    }

    const q = search.trim();
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { area: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, listings] = await prisma.$transaction([
      prisma.housingListing.count({ where }),
      prisma.housingListing.findMany({
        where,
        skip,
        take: limitNum,
        select: PUBLIC_LISTING_SELECT,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        listings: listings.map(formatPublicListing),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      }, "Community listings fetched")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/housing/listings/:id — single listing (public, no contact)
 */
export const getCommunityListing = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return next(new ApiError(400, "Invalid listing ID"));
    }

    const listing = await prisma.housingListing.findFirst({
      where: { id, status: "active" },
      select: PUBLIC_LISTING_SELECT,
    });

    if (!listing) {
      return next(new ApiError(404, "Listing not found"));
    }

    await prisma.housingListing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.status(200).json(
      new ApiResponse(200, formatPublicListing({ ...listing, viewCount: listing.viewCount + 1 }), "Listing fetched")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/listings/:id/contact — reveal contact (auth required)
 */
export const revealListingContact = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      return next(new ApiError(400, "Invalid listing ID"));
    }

    const listing = await prisma.housingListing.findFirst({
      where: { id, status: "active" },
      select: {
        id: true,
        contactPhone: true,
        whatsappNumber: true,
        title: true,
      },
    });

    if (!listing) {
      return next(new ApiError(404, "Listing not found"));
    }

    await prisma.housingListing.update({
      where: { id },
      data: { contactRevealCount: { increment: 1 } },
    });

    res.status(200).json(
      new ApiResponse(200, {
        contactPhone: listing.contactPhone,
        whatsappNumber: listing.whatsappNumber || listing.contactPhone,
        title: listing.title,
      }, "Contact revealed")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/listings — create listing (auth)
 */
export const createListing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.housingPayload;

    const since = new Date();
    since.setHours(since.getHours() - 24);

    const recentCount = await prisma.housingListing.count({
      where: { userId, createdAt: { gte: since } },
    });

    if (recentCount >= MAX_LISTINGS_PER_DAY) {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(429, "You can only post 5 listings per day"));
    }

    let images = [];
    try {
      images = await uploadListingImages(req.files);
    } catch (uploadError) {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(500, "Failed to upload images"));
    }

    const listing = await prisma.housingListing.create({
      data: {
        ...payload,
        userId,
        images,
        status: "pending_review",
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json(
      new ApiResponse(201, listing, "Listing submitted for admin review")
    );
  } catch (error) {
    cleanupUploadedFiles(req.files);
    next(error);
  }
};

/**
 * PUT /api/housing/listings/:id — update own listing (auth)
 */
export const updateListing = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id)) {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(400, "Invalid listing ID"));
    }

    const existing = await prisma.housingListing.findUnique({ where: { id } });
    if (!existing) {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(404, "Listing not found"));
    }
    if (existing.userId !== userId) {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(403, "You can only edit your own listings"));
    }
    if (existing.status === "rejected") {
      cleanupUploadedFiles(req.files);
      return next(new ApiError(400, "Rejected listings cannot be edited. Please create a new listing."));
    }

    const payload = req.housingPayload;
    let images = Array.isArray(existing.images) ? [...existing.images] : [];

    if (req.files?.length) {
      const newImages = await uploadListingImages(req.files);
      images = [...images, ...newImages].slice(0, MAX_IMAGES);
    }

    if (req.body.replaceImages === "true" && req.files?.length) {
      images = await uploadListingImages(req.files);
    }

    const listing = await prisma.housingListing.update({
      where: { id },
      data: { ...payload, images },
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    res.status(200).json(new ApiResponse(200, listing, "Listing updated"));
  } catch (error) {
    cleanupUploadedFiles(req.files);
    next(error);
  }
};

/**
 * PATCH /api/housing/listings/:id/status — owner marks filled/inactive
 */
export const updateOwnerListingStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    const status = req.housingStatus;

    const existing = await prisma.housingListing.findUnique({ where: { id } });
    if (!existing) return next(new ApiError(404, "Listing not found"));
    if (existing.userId !== userId) return next(new ApiError(403, "Forbidden"));

    const listing = await prisma.housingListing.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    res.status(200).json(new ApiResponse(200, listing, "Listing status updated"));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/housing/my-listings — owner's listings
 */
export const getMyListings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };

    const [total, listings] = await prisma.$transaction([
      prisma.housingListing.count({ where }),
      prisma.housingListing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        listings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      }, "Your listings fetched")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/housing/admin/listings — admin moderation queue
 */
export const getAdminListings = async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) {
      return next(new ApiError(403, "Only admins can access housing moderation"));
    }

    const { page = 1, limit = 10, status = "pending_review" } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status !== "all") {
      where.status = status;
    }

    const [total, listings] = await prisma.$transaction([
      prisma.housingListing.count({ where }),
      prisma.housingListing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, phoneNumber: true } },
        },
      }),
    ]);

    res.status(200).json(
      new ApiResponse(200, {
        listings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      }, "Admin housing listings fetched")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/housing/admin/listings/:id — approve / reject / inactive
 */
export const moderateListing = async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) {
      return next(new ApiError(403, "Only admins can moderate listings"));
    }

    const id = parseInt(req.params.id, 10);
    const status = req.housingStatus;

    const existing = await prisma.housingListing.findUnique({ where: { id } });
    if (!existing) return next(new ApiError(404, "Listing not found"));

    const listing = await prisma.housingListing.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    res.status(200).json(new ApiResponse(200, listing, `Listing marked as ${status}`));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/housing/admin/listings/:id — admin delete
 */
export const deleteListing = async (req, res, next) => {
  try {
    if (!isAdmin(req.user)) {
      return next(new ApiError(403, "Only admins can delete listings"));
    }

    const id = parseInt(req.params.id, 10);
    const existing = await prisma.housingListing.findUnique({ where: { id } });
    if (!existing) return next(new ApiError(404, "Listing not found"));

    await prisma.housingListing.delete({ where: { id } });

    res.status(200).json(new ApiResponse(200, { id }, "Listing deleted"));
  } catch (error) {
    next(error);
  }
};

export { normalizePhone };
