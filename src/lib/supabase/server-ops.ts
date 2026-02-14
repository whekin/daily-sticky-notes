import { sendPushNotification } from "@/lib/notifications/push";
import { resolveNotificationDue } from "@/lib/notifications/schedule";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type {
  OpenedEventPayload,
  PushSubscriptionDeletePayload,
  PushSubscriptionPayload,
} from "@/types/gift";

export interface DatabaseHealth {
  ok: boolean;
  reason: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const client = getServerSupabaseClient();

  if (!client) {
    return {
      ok: false,
      reason: "Supabase service credentials are missing.",
    };
  }

  const result = await client.from("gift_settings").select("id").limit(1);

  if (result.error) {
    return {
      ok: false,
      reason: result.error.message,
    };
  }

  return {
    ok: true,
    reason: "Connected",
  };
}

export async function recordOpenedEvent(event: OpenedEventPayload): Promise<void> {
  const client = getServerSupabaseClient();

  if (!client) {
    return;
  }

  const giftResult = await client
    .from("gift_settings")
    .select("id")
    .eq("slug", event.slug)
    .maybeSingle();

  const giftId =
    giftResult.data &&
    typeof giftResult.data === "object" &&
    "id" in giftResult.data &&
    typeof giftResult.data.id === "string"
      ? giftResult.data.id
      : null;

  await client.from("gift_events").insert({
    gift_id: giftId,
    event_type: "opened",
    payload: event,
  });
}

interface GiftRow {
  id: string;
  slug: string;
  title: string;
}

interface PushSubscriptionRow {
  id: string;
  gift_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  notify_hour: number;
  notify_minute: number;
  last_notified_on: string | null;
}

export interface PushDispatchSummary {
  attempted: number;
  sent: number;
  skipped: number;
  failed: number;
  removed: number;
}

async function getGiftBySlug(slug: string): Promise<GiftRow | null> {
  const client = getServerSupabaseClient();

  if (!client) {
    return null;
  }

  const giftResult = await client
    .from("gift_settings")
    .select("id, slug, title")
    .eq("slug", slug)
    .maybeSingle();

  if (giftResult.error || !giftResult.data) {
    return null;
  }

  const gift = giftResult.data;

  if (
    typeof gift !== "object" ||
    typeof gift.id !== "string" ||
    typeof gift.slug !== "string" ||
    typeof gift.title !== "string"
  ) {
    return null;
  }

  return gift;
}

export async function upsertPushSubscription(event: PushSubscriptionPayload): Promise<void> {
  const client = getServerSupabaseClient();

  if (!client) {
    return;
  }

  const gift = await getGiftBySlug(event.slug);
  if (!gift) {
    return;
  }

  await client.from("gift_push_subscriptions").upsert(
    {
      gift_id: gift.id,
      endpoint: event.endpoint,
      p256dh: event.keys.p256dh,
      auth: event.keys.auth,
      timezone: event.timezone,
      notify_hour: event.notifyHour,
      notify_minute: event.notifyMinute,
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "endpoint",
    },
  );
}

export async function deletePushSubscription(event: PushSubscriptionDeletePayload): Promise<void> {
  const client = getServerSupabaseClient();

  if (!client) {
    return;
  }

  await client.from("gift_push_subscriptions").delete().eq("endpoint", event.endpoint);
}

export async function dispatchDuePushNotifications(now = new Date()): Promise<PushDispatchSummary> {
  const client = getServerSupabaseClient();
  const summary: PushDispatchSummary = {
    attempted: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    removed: 0,
  };

  if (!client) {
    return summary;
  }

  const subscriptionsResult = await client
    .from("gift_push_subscriptions")
    .select(
      "id, gift_id, endpoint, p256dh, auth, timezone, notify_hour, notify_minute, last_notified_on",
    )
    .eq("enabled", true);

  if (subscriptionsResult.error || !subscriptionsResult.data) {
    return summary;
  }

  const subscriptions = subscriptionsResult.data.filter(
    (row): row is PushSubscriptionRow =>
      typeof row === "object" &&
      row !== null &&
      typeof row.id === "string" &&
      typeof row.gift_id === "string" &&
      typeof row.endpoint === "string" &&
      typeof row.p256dh === "string" &&
      typeof row.auth === "string" &&
      typeof row.timezone === "string" &&
      typeof row.notify_hour === "number" &&
      typeof row.notify_minute === "number" &&
      (typeof row.last_notified_on === "string" || row.last_notified_on === null),
  );

  if (!subscriptions.length) {
    return summary;
  }

  const giftIds = [...new Set(subscriptions.map((row) => row.gift_id))];
  const giftsResult = await client
    .from("gift_settings")
    .select("id, slug, title")
    .in("id", giftIds);

  if (giftsResult.error || !giftsResult.data) {
    return summary;
  }

  const gifts = new Map(
    giftsResult.data
      .filter(
        (row): row is GiftRow =>
          typeof row === "object" &&
          row !== null &&
          typeof row.id === "string" &&
          typeof row.slug === "string" &&
          typeof row.title === "string",
      )
      .map((row) => [row.id, row]),
  );

  for (const subscription of subscriptions) {
    summary.attempted += 1;

    const gift = gifts.get(subscription.gift_id);
    if (!gift) {
      summary.skipped += 1;
      continue;
    }

    const due = resolveNotificationDue({
      now,
      timezone: subscription.timezone,
      hour: subscription.notify_hour,
      minute: subscription.notify_minute,
      lastNotifiedOn: subscription.last_notified_on,
    });

    if (!due.due) {
      summary.skipped += 1;
      continue;
    }

    const sendResult = await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      {
        title: gift.title,
        body: "A new love note is ready for you.",
        url: `/gift/${gift.slug}`,
      },
    );

    if (sendResult.ok) {
      await client
        .from("gift_push_subscriptions")
        .update({
          last_notified_on: due.localDate,
          last_notified_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", subscription.id);

      summary.sent += 1;
      continue;
    }

    if (sendResult.shouldDelete) {
      await client.from("gift_push_subscriptions").delete().eq("id", subscription.id);
      summary.removed += 1;
      continue;
    }

    summary.failed += 1;
  }

  return summary;
}
