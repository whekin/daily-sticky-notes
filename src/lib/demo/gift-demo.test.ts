import { describe, expect, it } from "bun:test";
import { buildDemoGiftData } from "@/lib/demo/gift-demo";

describe("gift demo data", () => {
  it("returns full demo board with one today note", () => {
    const data = buildDemoGiftData("UTC", "ru", new Date("2026-02-13T12:00:00Z"));

    expect(data.notes).toHaveLength(30);
    expect(data.context.unlockedCount).toBe(30);
    expect(data.context.totalCount).toBe(30);
    expect(data.notes.filter((note) => note.isToday)).toHaveLength(1);
  });

  it("shifts today note around unlock hour", () => {
    const beforeUnlock = buildDemoGiftData("UTC", "en", new Date("2026-02-13T06:00:00Z"));
    const afterUnlock = buildDemoGiftData("UTC", "en", new Date("2026-02-13T08:00:00Z"));

    expect(beforeUnlock.context.dayIndex).not.toBe(afterUnlock.context.dayIndex);
  });
});
