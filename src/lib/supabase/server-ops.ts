import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { OpenedEventPayload } from "@/types/gift";

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
