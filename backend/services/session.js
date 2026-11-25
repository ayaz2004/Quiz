import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/db.config.js";

// Several devices can stay signed in at once (phone and website). Each sign-in
// is a Session row. The legacy User.accessToken/sessionToken columns still
// hold the newest sign-in so a rollback to the old server keeps people signed in,
// and anyone signed in before sessions existed is accepted and migrated lazily.

export const MAX_SESSIONS_PER_USER = 5;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

// jwtid keeps two sign-ins in the same second from producing identical tokens
export const signAccessToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '24h', jwtid: crypto.randomUUID() }
);

const signSessionToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d', jwtid: crypto.randomUUID() }
);

const userAgentOf = (req) => req?.get?.("user-agent")?.slice(0, 255) || null;

const expiryOf = (sessionToken) => {
  const exp = jwt.decode(sessionToken)?.exp;
  return exp ? new Date(exp * 1000) : new Date(Date.now() + SESSION_TTL_MS);
};

/** Turns a still-valid legacy sign-in into a Session row (no-op if it already is one). */
export const adoptLegacySession = async (user, req) => {
  if (!user.sessionToken || !user.accessToken) return null;
  try {
    jwt.verify(user.sessionToken, process.env.JWT_SECRET);
  } catch {
    return null;
  }
  return prisma.session.upsert({
    where: { sessionToken: user.sessionToken },
    create: {
      userId: user.id,
      sessionToken: user.sessionToken,
      accessToken: user.accessToken,
      userAgent: userAgentOf(req),
      expiresAt: expiryOf(user.sessionToken),
    },
    update: {},
  });
};

export const createSession = async (user, req) => {
  // Keep a pre-sessions sign-in on another device alive before its legacy columns are overwritten
  await adoptLegacySession(user, req);

  const accessToken = signAccessToken(user);
  const sessionToken = signSessionToken(user);

  await prisma.$transaction([
    prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        accessToken,
        userAgent: userAgentOf(req),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { accessToken, sessionToken } }),
  ]);

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    select: { id: true },
    orderBy: [{ lastUsedAt: "desc" }, { id: "desc" }],
  });
  if (sessions.length > MAX_SESSIONS_PER_USER) {
    await prisma.session.deleteMany({
      where: { id: { in: sessions.slice(MAX_SESSIONS_PER_USER).map((s) => s.id) } },
    });
  }

  return { accessToken, sessionToken };
};

/**
 * The session a request belongs to, or null. `decoded` is the verified access token.
 * Falls back to the legacy User columns and migrates that sign-in to a Session row.
 */
export const resolveSession = async (decoded, accessToken, sessionToken, req) => {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (session) {
    const valid = session.userId === decoded.id
      && session.accessToken === accessToken
      && session.expiresAt > new Date();
    if (!valid) return null;

    if (Date.now() - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
      await prisma.session.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
    }
    const { user, ...rest } = session;
    return { session: rest, user };
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.accessToken !== accessToken || user.sessionToken !== sessionToken) return null;

  const adopted = await adoptLegacySession(user, req);
  return adopted ? { session: adopted, user } : null;
};

/** New access token for one session; other sessions are untouched. Returns null if the session is invalid. */
export const refreshSession = async (decodedSession, sessionToken, req) => {
  let session = await prisma.session.findUnique({ where: { sessionToken } });

  if (!session) {
    const user = await prisma.user.findUnique({ where: { id: decodedSession.id } });
    if (!user || user.sessionToken !== sessionToken) return null;
    session = await adoptLegacySession(user, req);
    if (!session) return null;
  }
  if (session.userId !== decodedSession.id || session.expiresAt <= new Date()) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;

  const accessToken = signAccessToken(user);
  await prisma.$transaction([
    prisma.session.update({ where: { id: session.id }, data: { accessToken, lastUsedAt: new Date() } }),
    prisma.user.updateMany({ where: { id: user.id, sessionToken }, data: { accessToken } }),
  ]);
  return { accessToken };
};

/** Ends one session, identified by its session token or, failing that, its access token. */
export const endSession = async ({ accessToken, sessionToken }) => {
  const session = sessionToken
    ? await prisma.session.findUnique({ where: { sessionToken } })
    : accessToken ? await prisma.session.findFirst({ where: { accessToken } }) : null;

  if (session) {
    await prisma.session.delete({ where: { id: session.id } });
    await prisma.user.updateMany({
      where: { id: session.userId, sessionToken: session.sessionToken },
      data: { accessToken: null, sessionToken: null },
    });
    return;
  }

  // Signed in before sessions existed: same behaviour as before
  if (accessToken) {
    await prisma.user.updateMany({
      where: { accessToken },
      data: { accessToken: null, sessionToken: null },
    });
  }
};

/**
 * Signs out every other device after a password change. The legacy columns
 * are pointed at the kept session so they cannot revive a removed one.
 */
export const endOtherSessions = async (userId, keep) => {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId, ...(keep ? { id: { not: keep.id } } : {}) } }),
    prisma.user.update({
      where: { id: userId },
      data: keep
        ? { accessToken: keep.accessToken, sessionToken: keep.sessionToken }
        : { accessToken: null, sessionToken: null },
    }),
  ]);
};
