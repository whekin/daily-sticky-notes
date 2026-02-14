CREATE TABLE "gift_push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gift_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"notify_hour" integer DEFAULT 9 NOT NULL,
	"notify_minute" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_notified_on" date,
	"last_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_push_subscriptions_notify_hour_check" CHECK ("gift_push_subscriptions"."notify_hour" between 0 and 23),
	CONSTRAINT "gift_push_subscriptions_notify_minute_check" CHECK ("gift_push_subscriptions"."notify_minute" between 0 and 59)
);
--> statement-breakpoint
ALTER TABLE "gift_push_subscriptions" ADD CONSTRAINT "gift_push_subscriptions_gift_id_gift_settings_id_fk" FOREIGN KEY ("gift_id") REFERENCES "public"."gift_settings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "gift_push_subscriptions_endpoint_uq" ON "gift_push_subscriptions" USING btree ("endpoint");