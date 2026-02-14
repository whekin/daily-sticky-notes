import webpush from "web-push";
import { env } from "@/lib/env";

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url: string;
}

export interface PushSendResult {
  ok: boolean;
  statusCode: number | null;
  shouldDelete: boolean;
  reason: string;
}

let vapidConfigured = false;

function resolveVapidConfig(): { subject: string; publicKey: string; privateKey: string } | null {
  const subject = env.PUSH_VAPID_SUBJECT;
  const publicKey = env.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = env.PUSH_VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    return null;
  }

  return { subject, publicKey, privateKey };
}

function configureVapid(): boolean {
  if (vapidConfigured) {
    return true;
  }

  const config = resolveVapidConfig();
  if (!config) {
    return false;
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  vapidConfigured = true;
  return true;
}

export async function sendPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushNotificationPayload,
): Promise<PushSendResult> {
  if (!configureVapid()) {
    return {
      ok: false,
      statusCode: null,
      shouldDelete: false,
      reason: "Push VAPID keys are not configured.",
    };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60,
      },
    );

    return {
      ok: true,
      statusCode: null,
      shouldDelete: false,
      reason: "sent",
    };
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode?: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : null;

    return {
      ok: false,
      statusCode,
      shouldDelete: statusCode === 404 || statusCode === 410,
      reason: error instanceof Error ? error.message : "Unknown web push delivery failure.",
    };
  }
}
