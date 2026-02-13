import { describe, expect, it } from "bun:test";
import { buildLocaleHref, resolveLocaleFromSearchParams } from "@/lib/i18n";

describe("i18n", () => {
  it("resolves supported locales from lang query", () => {
    expect(resolveLocaleFromSearchParams({ lang: "ru" })).toBe("ru");
    expect(resolveLocaleFromSearchParams({ lang: "en" })).toBe("en");
  });

  it("normalizes regional locale values", () => {
    expect(resolveLocaleFromSearchParams({ lang: "ru-RU" })).toBe("ru");
    expect(resolveLocaleFromSearchParams({ locale: "en_US" })).toBe("en");
  });

  it("falls back to english for unsupported locale values", () => {
    expect(resolveLocaleFromSearchParams({ lang: "fr" })).toBe("en");
  });

  it("builds locale-aware links", () => {
    expect(buildLocaleHref("/gift/demo", "ru")).toBe("/gift/demo?lang=ru");
    expect(buildLocaleHref("/gift/demo-secret?mode=demo", "ru")).toBe(
      "/gift/demo-secret?mode=demo&lang=ru",
    );
  });
});
