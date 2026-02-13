import { env } from "@/lib/env";

export const GIFT_CONFIG = {
  startDate: env.GIFT_START_DATE,
  unlockHour: env.GIFT_UNLOCK_HOUR,
  totalNotes: env.GIFT_TOTAL_NOTES,
} as const;
