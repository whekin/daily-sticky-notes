import { relations, sql } from "drizzle-orm";
import {
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

export const giftSettingsRelations = relations(giftSettings, ({ many }) => ({
  notes: many(giftNotes),
  events: many(giftEvents),
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
