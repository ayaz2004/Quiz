import { normalizePhone } from "./validateHousing.js";

const GENDER_OPTIONS = new Set(["male", "female", "any"]);
const GROUP_STATUS = new Set(["recruiting", "full", "closed"]);
const REQUEST_STATUS = new Set(["approved", "rejected"]);

export const formatUserDisplayName = (user) => {
  if (!user) return "Student";
  const email = user.email || "";
  const local = email.split("@")[0]?.trim();
  return local || "Student";
};

export const PUBLIC_GROUP_SELECT = {
  id: true,
  name: true,
  description: true,
  university: true,
  preferredArea: true,
  targetSize: true,
  budgetPerPerson: true,
  moveInDate: true,
  genderPreference: true,
  status: true,
  createdAt: true,
  creator: {
    select: { id: true, email: true },
  },
  _count: {
    select: { members: true },
  },
};

const parseGroupBody = (body) => {
  const data = typeof body === "string" ? JSON.parse(body) : body;

  const name = data.name?.trim();
  const genderPreference = (data.genderPreference || "").toLowerCase();
  const targetSize = parseInt(data.targetSize, 10);
  const contactPhone = normalizePhone(data.contactPhone);
  const whatsappNumber = data.whatsappNumber
    ? normalizePhone(data.whatsappNumber)
    : null;

  const errors = [];
  if (!name || name.length > 100) errors.push("Group name is required (max 100 characters)");
  if (!GENDER_OPTIONS.has(genderPreference)) errors.push("Invalid gender preference");
  if (!Number.isInteger(targetSize) || targetSize < 2 || targetSize > 10) {
    errors.push("Group size must be between 2 and 10");
  }
  if (!contactPhone) errors.push("Valid contact phone is required");

  if (data.description && data.description.length > 2000) {
    errors.push("Description must be under 2000 characters");
  }

  let budgetPerPerson = null;
  if (
    data.budgetPerPerson !== undefined &&
    data.budgetPerPerson !== null &&
    data.budgetPerPerson !== ""
  ) {
    budgetPerPerson = Number(data.budgetPerPerson);
    if (!Number.isFinite(budgetPerPerson) || budgetPerPerson < 0) {
      errors.push("Budget must be a valid positive number");
    }
  }

  let moveInDate = null;
  if (data.moveInDate) {
    const parsed = new Date(data.moveInDate);
    if (Number.isNaN(parsed.getTime())) {
      errors.push("Invalid move-in date");
    } else {
      moveInDate = parsed;
    }
  }

  let whatsappGroupLink = data.whatsappGroupLink?.trim() || null;
  if (whatsappGroupLink && whatsappGroupLink.length > 500) {
    errors.push("WhatsApp group link is too long");
  }

  return {
    errors,
    payload: {
      name,
      description: data.description?.trim() || null,
      university: "JMI",
      preferredArea: data.preferredArea?.trim()?.slice(0, 100) || null,
      targetSize,
      budgetPerPerson,
      moveInDate,
      genderPreference,
      contactPhone,
      whatsappNumber,
      whatsappGroupLink,
    },
  };
};

export const validateGroupCreate = (req, res, next) => {
  const { errors, payload } = parseGroupBody(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join("; ") });
  }
  req.groupPayload = payload;
  next();
};

export const validateGroupUpdate = (req, res, next) => {
  const { errors, payload } = parseGroupBody(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors.join("; ") });
  }
  req.groupPayload = payload;
  next();
};

export const validateGroupStatus = (req, res, next) => {
  const status = req.body.status?.toLowerCase();
  if (!GROUP_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "Invalid group status" });
  }
  req.groupStatus = status;
  next();
};

export const validateJoinRequestAction = (req, res, next) => {
  const status = req.body.status?.toLowerCase();
  if (!REQUEST_STATUS.has(status)) {
    return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
  }
  req.requestAction = status;
  next();
};

export const formatPublicGroup = (group) => ({
  id: group.id,
  name: group.name,
  description: group.description,
  university: group.university,
  preferredArea: group.preferredArea,
  targetSize: group.targetSize,
  currentSize: group._count?.members ?? group.members?.length ?? 0,
  budgetPerPerson: group.budgetPerPerson,
  moveInDate: group.moveInDate,
  genderPreference: group.genderPreference,
  status: group.status,
  createdAt: group.createdAt,
  creator: group.creator
    ? { id: group.creator.id, name: formatUserDisplayName(group.creator) }
    : undefined,
});
