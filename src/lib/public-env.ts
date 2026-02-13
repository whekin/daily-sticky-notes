"use client";

function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: normalize(process.env["NEXT_PUBLIC_SUPABASE_URL"]),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: normalize(
    process.env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"],
  ),
  NEXT_PUBLIC_SENTRY_DSN: normalize(process.env["NEXT_PUBLIC_SENTRY_DSN"]),
} as const;
