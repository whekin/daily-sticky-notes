import { normalizeTimeZone } from "@/lib/gift-time";

export interface TimeOfDay {
  hour: number;
  minute: number;
}

export interface NotificationDueInput extends TimeOfDay {
  now: Date;
  timezone: string;
  lastNotifiedOn: string | null;
}

export interface NotificationDueResult {
  due: boolean;
  localDate: string;
  localHour: number;
  localMinute: number;
  timezone: string;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string): Intl.DateTimeFormat {
  const cached = formatters.get(timezone);
  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  formatters.set(timezone, formatter);
  return formatter;
}

function getLocalParts(
  date: Date,
  timezone: string,
): {
  dateKey: string;
  hour: number;
  minute: number;
} {
  const parts = getFormatter(timezone).formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    throw new Error(`Failed to resolve local date parts for timezone "${timezone}"`);
  }

  return {
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    hour,
    minute,
  };
}

export function parseTimeInput(value: string): TimeOfDay | null {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function formatTimeInput(time: TimeOfDay): string {
  return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
}

export function resolveNotificationDue(input: NotificationDueInput): NotificationDueResult {
  const timezone = normalizeTimeZone(input.timezone);
  const local = getLocalParts(input.now, timezone);
  const due =
    local.hour === input.hour &&
    local.minute === input.minute &&
    input.lastNotifiedOn !== local.dateKey;

  return {
    due,
    localDate: local.dateKey,
    localHour: local.hour,
    localMinute: local.minute,
    timezone,
  };
}
