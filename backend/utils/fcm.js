import prisma from "../config/db.config.js";

// Push to the mobile app through Firebase Cloud Messaging.
// Without credentials every call is a no-op, so the server runs without a Firebase project.

const MULTICAST_LIMIT = 500;
const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

let messaging;
let initPromise;

const readServiceAccount = () => {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json);
};

const getMessagingClient = async () => {
  if (messaging !== undefined) return messaging;
  initPromise ??= (async () => {
    try {
      const serviceAccount = readServiceAccount();
      if (!serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        messaging = null;
        return;
      }
      const { initializeApp, cert, applicationDefault, getApps } = await import("firebase-admin/app");
      const { getMessaging } = await import("firebase-admin/messaging");
      const app = getApps()[0] ?? initializeApp({
        credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      });
      messaging = getMessaging(app);
    } catch (error) {
      console.error("FCM init failed, phone push disabled:", error?.message || error);
      messaging = null;
    }
  })();
  await initPromise;
  return messaging;
};

const stringifyData = (data = {}) => Object.fromEntries(
  Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [key, String(value)])
);

/**
 * Sends a notification to every registered device of a user and removes
 * tokens FCM reports as dead. Never throws.
 */
export const sendToUser = async (userId, { title, body, data } = {}) => {
  try {
    const client = await getMessagingClient();
    if (!client) return { sent: 0, skipped: true };

    const tokens = (await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    })).map((t) => t.token);
    if (tokens.length === 0) return { sent: 0, failed: 0, removed: 0 };

    let sent = 0;
    let failed = 0;
    const dead = [];
    for (let i = 0; i < tokens.length; i += MULTICAST_LIMIT) {
      const chunk = tokens.slice(i, i + MULTICAST_LIMIT);
      const response = await client.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data: stringifyData(data),
        android: { priority: "high" },
      });
      response.responses.forEach((r, index) => {
        if (r.success) {
          sent += 1;
        } else {
          failed += 1;
          if (DEAD_TOKEN_CODES.has(r.error?.code)) dead.push(chunk[index]);
        }
      });
    }

    if (dead.length > 0) {
      await prisma.deviceToken.deleteMany({ where: { token: { in: dead } } });
    }
    return { sent, failed, removed: dead.length };
  } catch (error) {
    console.error("FCM send error:", error?.message || error);
    return { sent: 0, failed: 0, removed: 0, error: true };
  }
};
