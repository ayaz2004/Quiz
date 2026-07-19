import crypto from "crypto";
import prisma from "../config/db.config.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/error.js";
import {
  PUBLIC_GROUP_SELECT,
  formatPublicGroup,
  formatUserDisplayName,
} from "../utils/validateHousingGroup.js";

const MAX_GROUPS_PER_USER = 3;
const MAX_GROUPS_PER_DAY = 2;

const generateInviteCode = () => crypto.randomBytes(6).toString("hex");

const getMemberCount = (group) => group._count?.members ?? group.members?.length ?? 0;

const syncGroupStatus = async (groupId) => {
  const group = await prisma.housingGroup.findUnique({
    where: { id: groupId },
    include: { _count: { select: { members: true } } },
  });
  if (!group || group.status === "closed") return group;

  const count = getMemberCount(group);
  const nextStatus = count >= group.targetSize ? "full" : "recruiting";
  if (nextStatus !== group.status) {
    return prisma.housingGroup.update({
      where: { id: groupId },
      data: { status: nextStatus },
      include: {
        creator: { select: { id: true, email: true } },
        _count: { select: { members: true } },
      },
    });
  }
  return group;
};

const isGroupCreator = async (groupId, userId) => {
  const group = await prisma.housingGroup.findUnique({
    where: { id: groupId },
    select: { creatorId: true },
  });
  return group?.creatorId === userId;
};

const isGroupMember = async (groupId, userId) => {
  const member = await prisma.housingGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return Boolean(member);
};

const getUserMembership = async (groupId, userId) => {
  if (!userId) return { isMember: false, isCreator: false, role: null };
  const [member, group] = await Promise.all([
    prisma.housingGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    }),
    prisma.housingGroup.findUnique({
      where: { id: groupId },
      select: { creatorId: true },
    }),
  ]);
  return {
    isMember: Boolean(member),
    isCreator: group?.creatorId === userId,
    role: member?.role || null,
  };
};

/**
 * GET /api/housing/groups — browse recruiting/full groups (public)
 */
export const listGroups = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "", genderPreference } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      university: "JMI",
      status: { in: ["recruiting", "full"] },
    };

    if (genderPreference && ["male", "female", "any"].includes(genderPreference)) {
      where.genderPreference = genderPreference;
    }

    const q = search.trim();
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { preferredArea: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, groups] = await prisma.$transaction([
      prisma.housingGroup.count({ where }),
      prisma.housingGroup.findMany({
        where,
        select: PUBLIC_GROUP_SELECT,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip,
        take: limitNum,
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        groups: groups.map(formatPublicGroup),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/housing/groups/my — groups user created or joined
 */
export const getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const memberships = await prisma.housingGroupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            creator: { select: { id: true, email: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const groups = memberships.map((m) => ({
      ...formatPublicGroup(m.group),
      role: m.role,
      inviteCode: m.role === "creator" ? m.group.inviteCode : undefined,
    }));

    return res.status(200).json(new ApiResponse(200, { groups }));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/housing/groups/:id — group detail
 */
export const getGroup = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    if (!Number.isInteger(groupId)) {
      throw new ApiError(400, "Invalid group ID");
    }

    const group = await prisma.housingGroup.findUnique({
      where: { id: groupId },
      include: {
        creator: { select: { id: true, email: true } },
        members: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { joinedAt: "asc" },
        },
        _count: { select: { members: true } },
      },
    });

    if (!group) throw new ApiError(404, "Group not found");

    const userId = req.user?.id;
    const membership = await getUserMembership(groupId, userId);
    const isPrivileged = membership.isMember || membership.isCreator;

    if (group.status === "closed" && !isPrivileged) {
      throw new ApiError(404, "Group not found");
    }

    const publicData = formatPublicGroup(group);
    const response = {
      ...publicData,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: formatUserDisplayName(m.user),
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      membership: {
        isMember: membership.isMember,
        isCreator: membership.isCreator,
        role: membership.role,
      },
    };

    if (isPrivileged) {
      response.inviteCode = group.inviteCode;
      response.whatsappGroupLink = group.whatsappGroupLink;
      response.inviteUrl = `/student-housing/groups/join/${group.inviteCode}`;
    }

    if (membership.isCreator) {
      const pendingRequests = await prisma.housingGroupJoinRequest.findMany({
        where: { groupId, status: "pending" },
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: "asc" },
      });
      response.pendingRequests = pendingRequests.map((r) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt,
        user: { id: r.user.id, name: formatUserDisplayName(r.user) },
      }));
    } else if (userId) {
      const myRequest = await prisma.housingGroupJoinRequest.findUnique({
        where: { groupId_userId: { groupId, userId } },
        select: { id: true, status: true, createdAt: true },
      });
      response.myJoinRequest = myRequest;
    }

    return res.status(200).json(new ApiResponse(200, response));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/groups — create group
 */
export const createGroup = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.groupPayload;

    const [activeCount, todayCount] = await Promise.all([
      prisma.housingGroup.count({
        where: { creatorId: userId, status: { not: "closed" } },
      }),
      prisma.housingGroup.count({
        where: {
          creatorId: userId,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    if (activeCount >= MAX_GROUPS_PER_USER) {
      throw new ApiError(400, `You can have at most ${MAX_GROUPS_PER_USER} active groups`);
    }
    if (todayCount >= MAX_GROUPS_PER_DAY) {
      throw new ApiError(400, `You can create at most ${MAX_GROUPS_PER_DAY} groups per day`);
    }

    let inviteCode = generateInviteCode();
    for (let i = 0; i < 5; i += 1) {
      const exists = await prisma.housingGroup.findUnique({ where: { inviteCode } });
      if (!exists) break;
      inviteCode = generateInviteCode();
    }

    const group = await prisma.housingGroup.create({
      data: {
        ...payload,
        creatorId: userId,
        inviteCode,
        members: {
          create: { userId, role: "creator" },
        },
      },
      include: {
        creator: { select: { id: true, email: true } },
        _count: { select: { members: true } },
      },
    });

    return res.status(201).json(
      new ApiResponse(201, {
        ...formatPublicGroup(group),
        inviteCode: group.inviteCode,
        inviteUrl: `/student-housing/groups/join/${group.inviteCode}`,
      }, "Group created successfully")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/housing/groups/:id — update group (creator only)
 */
export const updateGroup = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (!(await isGroupCreator(groupId, userId))) {
      throw new ApiError(403, "Only the group creator can update this group");
    }

    const group = await prisma.housingGroup.update({
      where: { id: groupId },
      data: req.groupPayload,
      include: {
        creator: { select: { id: true, email: true } },
        _count: { select: { members: true } },
      },
    });

    await syncGroupStatus(groupId);

    return res.status(200).json(
      new ApiResponse(200, {
        ...formatPublicGroup(group),
        inviteCode: group.inviteCode,
      }, "Group updated")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/housing/groups/:id/status — creator updates status
 */
export const updateGroupStatus = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const status = req.groupStatus;

    if (!(await isGroupCreator(groupId, userId))) {
      throw new ApiError(403, "Only the group creator can change status");
    }

    const group = await prisma.housingGroup.update({
      where: { id: groupId },
      data: { status },
      include: {
        creator: { select: { id: true, email: true } },
        _count: { select: { members: true } },
      },
    });

    return res.status(200).json(
      new ApiResponse(200, formatPublicGroup(group), "Group status updated")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/groups/:id/request-join — request to join (browse flow)
 */
export const requestJoinGroup = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const message = req.body.message?.trim()?.slice(0, 500) || null;

    const group = await prisma.housingGroup.findUnique({
      where: { id: groupId },
      include: { _count: { select: { members: true } } },
    });

    if (!group || group.status === "closed") {
      throw new ApiError(404, "Group not found");
    }
    if (group.status === "full" || getMemberCount(group) >= group.targetSize) {
      throw new ApiError(400, "This group is full");
    }
    if (group.creatorId === userId) {
      throw new ApiError(400, "You are already the group creator");
    }
    if (await isGroupMember(groupId, userId)) {
      throw new ApiError(400, "You are already a member");
    }

    const existing = await prisma.housingGroupJoinRequest.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing?.status === "pending") {
      throw new ApiError(400, "Join request already pending");
    }
    if (existing?.status === "approved") {
      throw new ApiError(400, "You are already approved for this group");
    }

    const request = await prisma.housingGroupJoinRequest.upsert({
      where: { groupId_userId: { groupId, userId } },
      create: { groupId, userId, message, status: "pending" },
      update: { message, status: "pending", createdAt: new Date() },
    });

    return res.status(200).json(
      new ApiResponse(200, { requestId: request.id, status: "pending" }, "Join request sent")
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/groups/join/:inviteCode — join via invite link (auto-join)
 */
export const joinGroupByInvite = async (req, res, next) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user.id;

    const group = await prisma.housingGroup.findUnique({
      where: { inviteCode },
      include: { _count: { select: { members: true } } },
    });

    if (!group || group.status === "closed") {
      throw new ApiError(404, "Invalid or expired invite link");
    }
    if (getMemberCount(group) >= group.targetSize) {
      throw new ApiError(400, "This group is full");
    }
    if (await isGroupMember(group.id, userId)) {
      return res.status(200).json(
        new ApiResponse(200, { groupId: group.id }, "You are already a member")
      );
    }

    await prisma.$transaction([
      prisma.housingGroupMember.create({
        data: { groupId: group.id, userId, role: "member" },
      }),
      prisma.housingGroupJoinRequest.upsert({
        where: { groupId_userId: { groupId: group.id, userId } },
        create: { groupId: group.id, userId, status: "approved" },
        update: { status: "approved" },
      }),
    ]);

    await syncGroupStatus(group.id);

    return res.status(200).json(
      new ApiResponse(200, { groupId: group.id }, "Joined group successfully")
    );
  } catch (error) {
    if (error.code === "P2002") {
      return next(new ApiError(400, "You are already a member"));
    }
    next(error);
  }
};

/**
 * PATCH /api/housing/groups/:id/requests/:requestId — approve/reject join request
 */
export const handleJoinRequest = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const requestId = parseInt(req.params.requestId, 10);
    const userId = req.user.id;
    const action = req.requestAction;

    if (!(await isGroupCreator(groupId, userId))) {
      throw new ApiError(403, "Only the group creator can manage requests");
    }

    const joinRequest = await prisma.housingGroupJoinRequest.findFirst({
      where: { id: requestId, groupId, status: "pending" },
    });

    if (!joinRequest) throw new ApiError(404, "Join request not found");

    if (action === "rejected") {
      await prisma.housingGroupJoinRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });
      return res.status(200).json(new ApiResponse(200, null, "Request rejected"));
    }

    const group = await prisma.housingGroup.findUnique({
      where: { id: groupId },
      include: { _count: { select: { members: true } } },
    });

    if (getMemberCount(group) >= group.targetSize) {
      throw new ApiError(400, "Group is full");
    }

    await prisma.$transaction([
      prisma.housingGroupMember.create({
        data: { groupId, userId: joinRequest.userId, role: "member" },
      }),
      prisma.housingGroupJoinRequest.update({
        where: { id: requestId },
        data: { status: "approved" },
      }),
    ]);

    await syncGroupStatus(groupId);

    return res.status(200).json(new ApiResponse(200, null, "Member added to group"));
  } catch (error) {
    if (error.code === "P2002") {
      await prisma.housingGroupJoinRequest.update({
        where: { id: parseInt(req.params.requestId, 10) },
        data: { status: "approved" },
      });
      return res.status(200).json(new ApiResponse(200, null, "Member already in group"));
    }
    next(error);
  }
};

/**
 * POST /api/housing/groups/:id/leave — leave group
 */
export const leaveGroup = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const group = await prisma.housingGroup.findUnique({
      where: { id: groupId },
      select: { creatorId: true },
    });

    if (!group) throw new ApiError(404, "Group not found");
    if (group.creatorId === userId) {
      throw new ApiError(400, "Creator cannot leave — close the group instead");
    }

    const member = await prisma.housingGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) throw new ApiError(400, "You are not a member of this group");

    await prisma.housingGroupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });

    await syncGroupStatus(groupId);

    return res.status(200).json(new ApiResponse(200, null, "Left group successfully"));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/housing/groups/:id/contact — reveal creator contact (for PG owners)
 */
export const revealGroupContact = async (req, res, next) => {
  try {
    const groupId = parseInt(req.params.id, 10);

    const group = await prisma.housingGroup.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        status: true,
        contactPhone: true,
        whatsappNumber: true,
        creator: { select: { email: true } },
      },
    });

    if (!group || group.status === "closed") {
      throw new ApiError(404, "Group not found");
    }

    return res.status(200).json(
      new ApiResponse(200, {
        contactPhone: group.contactPhone,
        whatsappNumber: group.whatsappNumber || group.contactPhone,
        creatorName: formatUserDisplayName(group.creator),
        groupName: group.name,
      })
    );
  } catch (error) {
    next(error);
  }
};
