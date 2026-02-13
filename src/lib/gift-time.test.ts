import { describe, expect, it } from "bun:test";
import { calculateUnlockContext, normalizeTimeZone } from "@/lib/gift-time";

describe("gift-time", () => {
  it("keeps day locked before unlock hour on start date", () => {
    const context = calculateUnlockContext({
      startDate: "2026-02-14",
      unlockHour: 7,
      totalCount: 30,
      timezone: "UTC",
      now: new Date("2026-02-14T06:59:00Z"),
    });

    expect(context.unlockedCount).toBe(0);
    expect(context.dayIndex).toBe(1);
    expect(context.isComplete).toBeFalse();
  });

  it("unlocks day 1 at unlock hour", () => {
    const context = calculateUnlockContext({
      startDate: "2026-02-14",
      unlockHour: 7,
      totalCount: 30,
      timezone: "UTC",
      now: new Date("2026-02-14T07:00:00Z"),
    });

    expect(context.unlockedCount).toBe(1);
    expect(context.dayIndex).toBe(1);
  });

  it("caps unlocked count at total notes after completion", () => {
    const context = calculateUnlockContext({
      startDate: "2026-02-14",
      unlockHour: 7,
      totalCount: 30,
      timezone: "UTC",
      now: new Date("2026-03-20T12:00:00Z"),
    });

    expect(context.unlockedCount).toBe(30);
    expect(context.dayIndex).toBe(30);
    expect(context.isComplete).toBeTrue();
  });

  it("falls back to UTC for invalid timezone names", () => {
    expect(normalizeTimeZone("Mars/Phobos")).toBe("UTC");
  });
});
