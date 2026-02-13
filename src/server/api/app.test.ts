import { describe, expect, it } from "bun:test";
import { createApiApp } from "@/server/api/app";

describe("api app", () => {
  const app = createApiApp();

  it("responds to health checks", async () => {
    const response = await app.fetch(new Request("http://localhost/api/v1/health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty("status");
    expect(payload).toHaveProperty("database");
  });

  it("responds with runtime config", async () => {
    const response = await app.fetch(new Request("http://localhost/api/v1/runtime"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toHaveProperty("animationsEnabled");
    expect(payload).toHaveProperty("appVersion");
  });

  it("accepts opened events", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/v1/events/opened", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          slug: "demo-secret",
          timezone: "UTC",
          dayIndex: 1,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload).toEqual({ accepted: true });
  });
});
