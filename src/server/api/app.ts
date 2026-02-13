import { Elysia, t } from "elysia";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { checkDatabaseHealth, recordOpenedEvent } from "@/lib/supabase/server-ops";

function getRuntimeVersion(): string {
  return process.env["VERCEL_GIT_COMMIT_SHA"]?.slice(0, 7) ?? "local-dev";
}

export function createApiApp() {
  return new Elysia({ prefix: "/api/v1" })
    .get("/health", async () => {
      const db = await checkDatabaseHealth();
      return {
        status: db.ok ? "ok" : "degraded",
        service: "valentine-api",
        version: getRuntimeVersion(),
        timestamp: new Date().toISOString(),
        database: db,
      };
    })
    .get("/runtime", () => {
      return {
        sentryEnabled: Boolean(env.SENTRY_DSN),
        animationsEnabled: true,
        appVersion: getRuntimeVersion(),
      };
    })
    .post(
      "/events/opened",
      async ({ body, set }) => {
        await recordOpenedEvent(body);
        logger.info(
          {
            eventType: "opened",
            slug: body.slug,
            timezone: body.timezone,
            dayIndex: body.dayIndex,
          },
          "Gift open event recorded",
        );

        set.status = 202;
        return {
          accepted: true,
        };
      },
      {
        body: t.Object({
          slug: t.String({ minLength: 1 }),
          timezone: t.String({ minLength: 1 }),
          dayIndex: t.Number({ minimum: 1 }),
        }),
      },
    );
}
