"use client";

import { z } from "zod";
import { logClientDebug } from "@/lib/client-debug";
import { GIFT_CONFIG } from "@/lib/config";
import { calculateUnlockContext } from "@/lib/gift-time";
import { publicEnv } from "@/lib/public-env";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser-client";
import type { GiftExperienceData } from "@/types/gift";

const unlockContextSchema = z.object({
  day_index: z.number().int(),
  unlocked_count: z.number().int(),
  total_count: z.number().int(),
  is_complete: z.boolean(),
  unlock_hour: z.number().int(),
  start_date: z.string(),
});

const noteSchema = z.object({
  id: z.string().uuid(),
  day_index: z.number().int(),
  body: z.string().min(1),
  image_url: z.string().nullable(),
  created_at: z.string(),
});

function unwrapSingleRow<T>(payload: T[] | T): T {
  if (Array.isArray(payload)) {
    const first = payload.at(0);
    if (!first) {
      throw new Error("RPC returned an empty result set.");
    }
    return first;
  }

  return payload;
}

function buildFallbackData(timezone: string): GiftExperienceData {
  const context = calculateUnlockContext({
    startDate: GIFT_CONFIG.startDate,
    unlockHour: GIFT_CONFIG.unlockHour,
    totalCount: GIFT_CONFIG.totalNotes,
    timezone,
  });

  const fallbackNotes = Array.from({ length: context.unlockedCount }, (_, index) => {
    const dayIndex = index + 1;
    return {
      id: crypto.randomUUID(),
      dayIndex,
      body:
        dayIndex === context.dayIndex
          ? "Today's note will appear here once Supabase is connected."
          : `Archived note #${dayIndex}`,
      imageUrl: null,
      isToday: dayIndex === context.dayIndex,
    };
  }).reverse();

  return {
    notes: fallbackNotes,
    context,
    source: "local-fallback",
  };
}

export async function getGiftExperienceData(
  slug: string,
  timezone: string,
): Promise<GiftExperienceData> {
  const client = getBrowserSupabaseClient();

  if (!client) {
    logClientDebug("warn", "Using local fallback (Supabase browser client unavailable)", {
      slug,
      timezone,
      hasSupabaseUrl: Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    });
    return buildFallbackData(timezone);
  }

  const contextResult = await client.rpc("rpc_get_unlock_context", {
    p_slug: slug,
    p_tz: timezone,
  });

  if (contextResult.error || !contextResult.data) {
    logClientDebug("error", "rpc_get_unlock_context failed", {
      slug,
      timezone,
      error: contextResult.error,
      hasData: Boolean(contextResult.data),
    });
    throw new Error(contextResult.error?.message ?? "Failed to load unlock context");
  }

  const parsedContext = unlockContextSchema.parse(unwrapSingleRow(contextResult.data));

  const notesResult = await client.rpc("rpc_get_unlocked_notes", {
    p_slug: slug,
    p_tz: timezone,
  });

  if (notesResult.error || !notesResult.data) {
    logClientDebug("error", "rpc_get_unlocked_notes failed", {
      slug,
      timezone,
      error: notesResult.error,
      hasData: Boolean(notesResult.data),
    });
    throw new Error(notesResult.error?.message ?? "Failed to load notes");
  }

  const notes = z
    .array(noteSchema)
    .parse(notesResult.data)
    .map((note) => ({
      id: note.id,
      dayIndex: note.day_index,
      body: note.body,
      imageUrl: note.image_url,
      isToday: note.day_index === parsedContext.day_index,
    }))
    .sort((a, b) => b.dayIndex - a.dayIndex);

  logClientDebug("info", "Loaded data from Supabase RPC", {
    slug,
    timezone,
    unlockedCount: parsedContext.unlocked_count,
    dayIndex: parsedContext.day_index,
    notesCount: notes.length,
  });

  if (parsedContext.unlocked_count > 0 && notes.length === 0) {
    logClientDebug("warn", "Unlock context says notes should exist, but notes array is empty", {
      slug,
      timezone,
      unlockedCount: parsedContext.unlocked_count,
    });
  }

  return {
    notes,
    context: {
      dayIndex: parsedContext.day_index,
      unlockedCount: parsedContext.unlocked_count,
      totalCount: parsedContext.total_count,
      isComplete: parsedContext.is_complete,
      unlockHour: parsedContext.unlock_hour,
      startDate: parsedContext.start_date,
      timezone,
    },
    source: "supabase-rpc",
  };
}
