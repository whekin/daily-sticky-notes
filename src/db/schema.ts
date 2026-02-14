import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const giftSettings = pgTable("gift_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  startDate: date("start_date", { mode: "string" }).notNull(),
  unlockHour: integer("unlock_hour").notNull().default(7),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const giftNotes = pgTable(
  "gift_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    giftId: uuid("gift_id")
      .references(() => giftSettings.id, { onDelete: "cascade" })
      .notNull(),
    dayIndex: integer("day_index").notNull(),
    body: text("body").notNull(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("gift_notes_gift_id_day_index_uq").on(table.giftId, table.dayIndex),
    check("gift_notes_day_index_check", sql`${table.dayIndex} between 1 and 30`),
  ],
);

export const giftEvents = pgTable("gift_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  giftId: uuid("gift_id").references(() => giftSettings.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const giftPushSubscriptions = pgTable(
  "gift_push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    giftId: uuid("gift_id")
      .references(() => giftSettings.id, { onDelete: "cascade" })
      .notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    notifyHour: integer("notify_hour").notNull().default(9),
    notifyMinute: integer("notify_minute").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    lastNotifiedOn: date("last_notified_on", { mode: "string" }),
    lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("gift_push_subscriptions_endpoint_uq").on(table.endpoint),
    check("gift_push_subscriptions_notify_hour_check", sql`${table.notifyHour} between 0 and 23`),
    check(
      "gift_push_subscriptions_notify_minute_check",
      sql`${table.notifyMinute} between 0 and 59`,
    ),
  ],
);

export const giftSettingsRelations = relations(giftSettings, ({ many }) => ({
  notes: many(giftNotes),
  events: many(giftEvents),
  pushSubscriptions: many(giftPushSubscriptions),
}));

export const giftNotesRelations = relations(giftNotes, ({ one }) => ({
  gift: one(giftSettings, {
    fields: [giftNotes.giftId],
    references: [giftSettings.id],
  }),
}));

export const giftEventsRelations = relations(giftEvents, ({ one }) => ({
  gift: one(giftSettings, {
    fields: [giftEvents.giftId],
    references: [giftSettings.id],
  }),
}));

export const giftPushSubscriptionsRelations = relations(giftPushSubscriptions, ({ one }) => ({
  gift: one(giftSettings, {
    fields: [giftPushSubscriptions.giftId],
    references: [giftSettings.id],
  }),
}));
