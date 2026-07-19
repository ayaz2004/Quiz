import express from "express";
import upload from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/verifyUser.js";
import { generalLimiter, housingPostLimiter } from "../middlewares/rateLimiter.js";
import {
  validateHousingCreate,
  validateHousingUpdate,
  validateOwnerStatus,
  validateAdminStatus,
} from "../utils/validateHousing.js";
import {
  validateGroupCreate,
  validateGroupUpdate,
  validateGroupStatus,
  validateJoinRequestAction,
} from "../utils/validateHousingGroup.js";
import {
  listCommunityListings,
  getCommunityListing,
  revealListingContact,
  createListing,
  updateListing,
  updateOwnerListingStatus,
  getMyListings,
  getAdminListings,
  moderateListing,
  deleteListing,
} from "../controllers/housing.controller.js";
import {
  listGroups,
  getMyGroups,
  getGroup,
  createGroup,
  updateGroup,
  updateGroupStatus,
  requestJoinGroup,
  joinGroupByInvite,
  handleJoinRequest,
  leaveGroup,
  revealGroupContact,
} from "../controllers/housingGroup.controller.js";

const router = express.Router();

// Groups (Phase 3) — auth required; static paths before :id
router.get("/groups", verifyToken, generalLimiter, listGroups);
router.get("/groups/my", verifyToken, generalLimiter, getMyGroups);
router.post("/groups", verifyToken, housingPostLimiter, validateGroupCreate, createGroup);
router.post("/groups/join/:inviteCode", verifyToken, housingPostLimiter, joinGroupByInvite);
router.get("/groups/:id", verifyToken, generalLimiter, getGroup);
router.put("/groups/:id", verifyToken, housingPostLimiter, validateGroupUpdate, updateGroup);
router.patch(
  "/groups/:id/status",
  verifyToken,
  validateGroupStatus,
  updateGroupStatus
);
router.post("/groups/:id/request-join", verifyToken, housingPostLimiter, requestJoinGroup);
router.post("/groups/:id/contact", verifyToken, housingPostLimiter, revealGroupContact);
router.post("/groups/:id/leave", verifyToken, leaveGroup);
router.patch(
  "/groups/:id/requests/:requestId",
  verifyToken,
  validateJoinRequestAction,
  handleJoinRequest
);

// Public — browse active community listings
router.get("/listings", generalLimiter, listCommunityListings);
router.get("/listings/:id", generalLimiter, getCommunityListing);

// Authenticated user
router.post(
  "/listings",
  verifyToken,
  housingPostLimiter,
  upload.array("images", 3),
  validateHousingCreate,
  createListing
);
router.put(
  "/listings/:id",
  verifyToken,
  housingPostLimiter,
  upload.array("images", 3),
  validateHousingUpdate,
  updateListing
);
router.patch(
  "/listings/:id/status",
  verifyToken,
  validateOwnerStatus,
  updateOwnerListingStatus
);
router.post(
  "/listings/:id/contact",
  verifyToken,
  housingPostLimiter,
  revealListingContact
);
router.get("/my-listings", verifyToken, generalLimiter, getMyListings);

// Admin moderation
router.get("/admin/listings", verifyToken, generalLimiter, getAdminListings);
router.patch(
  "/admin/listings/:id",
  verifyToken,
  validateAdminStatus,
  moderateListing
);
router.delete("/admin/listings/:id", verifyToken, deleteListing);

export default router;
