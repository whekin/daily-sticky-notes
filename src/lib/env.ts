import { z } from "zod";

function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const optionalString = z.preprocess(emptyStringToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().url().optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
    SUPABASE_SERVICE_ROLE_KEY: optionalString,
    DATABASE_URL: optionalString,
    GIFT_SECRET_SLUG: optionalString,
    GIFT_START_DATE: z
      .preprocess(
        emptyStringToUndefined,
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
      )
      .default("2026-02-14"),
    GIFT_UNLOCK_HOUR: z.coerce.number().int().min(0).max(23).default(7),
    GIFT_TOTAL_NOTES: z.coerce.number().int().min(1).max(365).default(30),
    SENTRY_DSN: optionalUrl,
    NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
    LOG_LEVEL: z
      .preprocess(
        emptyStringToUndefined,
        z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
      )
      .optional(),
  })
  .passthrough();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => {
      const field = issue.path.join(".") || "unknown";
      return `- ${field}: ${issue.message}`;
    })
    .join("\n");

  throw new Error(
    `Invalid environment variables:\n${formatted}\n\nTip: empty values in .env files should be removed or set to valid values.`,
  );
}

export const env = parsed.data;
