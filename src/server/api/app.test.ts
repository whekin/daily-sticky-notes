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

  it("accepts push subscription upserts", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/v1/notifications/subscriptions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          slug: "demo-secret",
          timezone: "UTC",
          notifyHour: 9,
          notifyMinute: 15,
          endpoint: "https://example.com/subscription-endpoint",
          keys: {
            p256dh: "p256dh-key",
            auth: "auth-key",
          },
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload).toEqual({ accepted: true });
  });

  it("accepts push subscription deletes", async () => {
    const response = await app.fetch(
      new Request("http://localhost/api/v1/notifications/subscriptions", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          endpoint: "https://example.com/subscription-endpoint",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload).toEqual({ accepted: true });
  });
});
