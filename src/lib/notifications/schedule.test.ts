import { describe, expect, it } from "bun:test";
import {
  formatTimeInput,
  parseTimeInput,
  resolveNotificationDue,
} from "@/lib/notifications/schedule";

describe("parseTimeInput", () => {
  it("parses valid HH:MM values", () => {
    expect(parseTimeInput("07:30")).toEqual({ hour: 7, minute: 30 });
  });

  it("rejects invalid values", () => {
    expect(parseTimeInput("24:00")).toBeNull();
    expect(parseTimeInput("7:30")).toBeNull();
    expect(parseTimeInput("07:75")).toBeNull();
  });
});

describe("formatTimeInput", () => {
  it("left-pads values", () => {
    expect(formatTimeInput({ hour: 7, minute: 5 })).toBe("07:05");
  });
});

describe("resolveNotificationDue", () => {
  it("marks due when local time matches and today is unsent", () => {
    const result = resolveNotificationDue({
      now: new Date("2026-02-14T12:30:00.000Z"),
      timezone: "America/New_York",
      hour: 7,
      minute: 30,
      lastNotifiedOn: null,
    });

    expect(result.due).toBe(true);
    expect(result.localDate).toBe("2026-02-14");
  });

  it("is not due if already sent on local date", () => {
    const result = resolveNotificationDue({
      now: new Date("2026-02-14T12:30:00.000Z"),
      timezone: "America/New_York",
      hour: 7,
      minute: 30,
      lastNotifiedOn: "2026-02-14",
    });

    expect(result.due).toBe(false);
  });

  it("falls back to UTC for invalid timezones", () => {
    const result = resolveNotificationDue({
      now: new Date("2026-02-14T07:00:00.000Z"),
      timezone: "Mars/Olympus",
      hour: 7,
      minute: 0,
      lastNotifiedOn: null,
    });

    expect(result.timezone).toBe("UTC");
    expect(result.due).toBe(true);
  });
});
