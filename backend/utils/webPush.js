import webpush from "web-push";
import prisma from "../config/db.config.js";

let configured = false;

function ensureConfigured() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || `mailto:${process.env.EMAIL_USER || "admin@jmiquiz.live"}`;

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function isWebPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function sendPushToSubscriptions(subscriptions, payload) {
  if (!ensureConfigured() || !subscriptions?.length) {
    return { sent: 0, removed: 0 };
  }

  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  let sent = 0;
  let removed = 0;
  const deadIds = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          body
        );
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode || error?.status;
        if (statusCode === 404 || statusCode === 410) {
          deadIds.push(sub.id);
          removed += 1;
        } else {
          console.error("Web push failed:", error?.message || error);
        }
      }
    })
  );

  if (deadIds.length) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: deadIds } },
    });
  }

  return { sent, removed };
}
