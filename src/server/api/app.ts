import { Elysia, t } from "elysia";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import {
  checkDatabaseHealth,
  deletePushSubscription,
  dispatchDuePushNotifications,
  recordOpenedEvent,
  upsertPushSubscription,
} from "@/lib/supabase/server-ops";

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
        pushVapidConfigured: Boolean(env.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY),
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
    )
    .post(
      "/notifications/subscriptions",
      async ({ body, set }) => {
        await upsertPushSubscription(body);

        logger.info(
          {
            eventType: "push_subscription_upserted",
            slug: body.slug,
            timezone: body.timezone,
            notifyHour: body.notifyHour,
            notifyMinute: body.notifyMinute,
          },
          "Push subscription upserted",
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
          notifyHour: t.Number({ minimum: 0, maximum: 23 }),
          notifyMinute: t.Number({ minimum: 0, maximum: 59 }),
          endpoint: t.String({ minLength: 1 }),
          keys: t.Object({
            p256dh: t.String({ minLength: 1 }),
            auth: t.String({ minLength: 1 }),
          }),
        }),
      },
    )
    .delete(
      "/notifications/subscriptions",
      async ({ body, set }) => {
        await deletePushSubscription(body);
        set.status = 202;
        return {
          accepted: true,
        };
      },
      {
        body: t.Object({
          endpoint: t.String({ minLength: 1 }),
        }),
      },
    )
    .post(
      "/notifications/dispatch",
      async ({ headers, set }) => {
        if (!env.PUSH_DISPATCH_SECRET) {
          set.status = 503;
          return {
            dispatched: false,
            reason: "Push dispatch secret is not configured.",
          };
        }

        if (headers["x-push-dispatch-secret"] !== env.PUSH_DISPATCH_SECRET) {
          set.status = 401;
          return {
            dispatched: false,
            reason: "Unauthorized dispatch call.",
          };
        }

        const summary = await dispatchDuePushNotifications();
        return {
          dispatched: true,
          summary,
        };
      },
      {
        headers: t.Object({
          "x-push-dispatch-secret": t.String({ minLength: 1 }),
        }),
      },
    );
}
