import type { UnlockContext } from "@/types/gift";

const FALLBACK_TIMEZONE = "UTC";
const MS_IN_DAY = 86_400_000;

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
}

interface CalculateUnlockContextInput {
  startDate: string;
  unlockHour: number;
  totalCount: number;
  timezone: string;
  now?: Date;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string): Intl.DateTimeFormat {
  const existing = formatters.get(timezone);
  if (existing) {
    return existing;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  formatters.set(timezone, formatter);
  return formatter;
}

export function normalizeTimeZone(timezone: string | undefined): string {
  if (!timezone) {
    return FALLBACK_TIMEZONE;
  }

  try {
    getFormatter(timezone).format(new Date());
    return timezone;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

function getZonedParts(date: Date, timezone: string): ZonedDateParts {
  const parts = getFormatter(timezone).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);

  if ([year, month, day, hour].some((value) => Number.isNaN(value))) {
    throw new Error(`Failed to extract timezone date parts for timezone "${timezone}"`);
  }

  return { year, month, day, hour };
}

function parseDateOnly(dateOnly: string): { year: number; month: number; day: number } {
  const [yearPart, monthPart, dayPart] = dateOnly.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if ([year, month, day].some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid date-only value "${dateOnly}"`);
  }

  return { year, month, day };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateUnlockContext({
  startDate,
  unlockHour,
  totalCount,
  timezone,
  now = new Date(),
}: CalculateUnlockContextInput): UnlockContext {
  const normalizedTimezone = normalizeTimeZone(timezone);
  const current = getZonedParts(now, normalizedTimezone);
  const start = parseDateOnly(startDate);

  const currentEpochDay = Date.UTC(current.year, current.month - 1, current.day) / MS_IN_DAY;
  const startEpochDay = Date.UTC(start.year, start.month - 1, start.day) / MS_IN_DAY;

  const daysSinceStart = currentEpochDay - startEpochDay;
  const adjustment = current.hour < unlockHour ? 1 : 0;
  const rawDayIndex = daysSinceStart + 1 - adjustment;

  const unlockedCount = clamp(rawDayIndex, 0, totalCount);
  const dayIndex = clamp(rawDayIndex, 1, totalCount);
  const isComplete = unlockedCount >= totalCount;

  return {
    dayIndex,
    unlockedCount,
    totalCount,
    isComplete,
    unlockHour,
    startDate,
    timezone: normalizedTimezone,
  };
}
