CREATE TABLE "gift_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_id" uuid,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gift_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_id" uuid NOT NULL,
	"day_index" integer NOT NULL,
	"body" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_notes_day_index_check" CHECK ("gift_notes"."day_index" between 1 and 30)
);
--> statement-breakpoint
CREATE TABLE "gift_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"start_date" date NOT NULL,
	"unlock_hour" integer DEFAULT 7 NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_settings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "gift_events" ADD CONSTRAINT "gift_events_gift_id_gift_settings_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_settings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_notes" ADD CONSTRAINT "gift_notes_gift_id_gift_settings_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gift_notes_gift_id_day_index_uq" ON "gift_notes" USING btree ("gift_id","day_index");