const LISTING_TYPES = new Set(["room", "pg", "hostel"]);
const GENDER_OPTIONS = new Set(["male", "female", "any"]);
const OWNER_STATUS = new Set(["filled", "inactive"]);
const ADMIN_STATUS = new Set(["active", "rejected", "inactive"]);
const SAFE_MAPS_PATTERN = /^https:\/\/([\w-]+\.)?(google\.com|googleapis\.com|goo\.gl|maps\.app\.goo\.gl)(\/|$)/i;

export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return null;
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.length >= 10 ? digits.slice(-10) : null;
};

const parseListingBody = (body) => {
  const data = typeof body === "string" ? JSON.parse(body) : body;

  const title = data.title?.trim();
  const address = data.address?.trim();
  const listingType = data.listingType?.toLowerCase();
  const genderPreference = (data.genderPreference || "female").toLowerCase();
  const contactPhone = normalizePhone(data.contactPhone);
  const whatsappNumber = data.whatsappNumber ? normalizePhone(data.whatsappNumber) : null;

  const errors = [];
  if (!title || title.length > 150) errors.push("Title is required (max 150 characters)");
  if (!address || address.length > 500) errors.push("Address is required (max 500 characters)");
  if (!LISTING_TYPES.has(listingType)) errors.push("Invalid listing type");
  if (!GENDER_OPTIONS.has(genderPreference)) errors.push("Invalid gender preference");
  if (!contactPhone) errors.push("Valid contact phone is required");

  if (data.description && data.description.length > 2000) {
    errors.push("Description must be under 2000 characters");
  }

  let rentMonthly = null;
  if (data.rentMonthly !== undefined && data.rentMonthly !== null && data.rentMonthly !== "") {
    rentMonthly = Number(data.rentMonthly);
    if (!Number.isFinite(rentMonthly) || rentMonthly < 0) {
      errors.push("Rent must be a valid positive number");
    }
  }

  let mapsUrl = data.mapsUrl?.trim() || null;
  if (mapsUrl && !SAFE_MAPS_PATTERN.test(mapsUrl)) {
    errors.push("Maps URL must be a valid Google Maps link");
  }

  let amenities = [];
  if (data.amenities) {
    amenities = Array.isArray(data.amenities)
      ? data.amenities.map((a) => String(a).trim()).filter(Boolean).slice(0, 20)
      : String(data.amenities)
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean)
          .slice(0, 20);
  }

  return {
    errors,
    payload: {
      listingType,
      university: "JMI",
      genderPreference,
      title,
      description: data.description?.trim() || null,
      address,
      area: data.area?.trim()?.slice(0, 100) || null,
      mapsUrl,
      rentMonthly,
      feeNotes: data.feeNotes?.trim()?.slice(0, 500) || null,
      entryTiming: data.entryTiming?.trim()?.slice(0, 200) || null,
      meals: data.meals?.trim()?.slice(0, 500) || null,
      visitors: data.visitors?.trim()?.slice(0, 500) || null,
      amenities,
      contactPhone,
      whatsappNumber,
      availability: data.availability?.trim()?.slice(0, 100) || "Available",
    },
  };
};

export const validateHousingCreate = (req, res, next) => {
  try {
    const raw = req.body.listingData;
    if (!raw) {
      return res.status(400).json({ success: false, message: "listingData is required" });
    }
    const { errors, payload } = parseListingBody(raw);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    req.housingPayload = payload;
    next();
  } catch {
    return res.status(400).json({ success: false, message: "Invalid listingData JSON" });
  }
};

export const validateHousingUpdate = (req, res, next) => {
  try {
    const raw = req.body.listingData;
    if (!raw) {
      return res.status(400).json({ success: false, message: "listingData is required" });
    }
    const { errors, payload } = parseListingBody(raw);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    req.housingPayload = payload;
    next();
  } catch {
    return res.status(400).json({ success: false, message: "Invalid listingData JSON" });
  }
};

export const validateOwnerStatus = (req, res, next) => {
  const status = req.body.status;
  if (!OWNER_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "Status must be filled or inactive" });
  }
  req.housingStatus = status;
  next();
};

export const validateAdminStatus = (req, res, next) => {
  const status = req.body.status;
  if (!ADMIN_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "Invalid admin status" });
  }
  req.housingStatus = status;
  next();
};

export const PUBLIC_LISTING_SELECT = {
  id: true,
  listingType: true,
  university: true,
  genderPreference: true,
  title: true,
  description: true,
  address: true,
  area: true,
  mapsUrl: true,
  rentMonthly: true,
  feeNotes: true,
  entryTiming: true,
  meals: true,
  visitors: true,
  amenities: true,
  images: true,
  availability: true,
  status: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
};

export const formatPublicListing = (listing) => ({
  ...listing,
  source: "community",
  hasContact: true,
});
