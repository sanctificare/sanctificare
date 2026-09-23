CREATE TABLE IF NOT EXISTS "user_attribution" (
	"userId" integer PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"source" varchar(40) NOT NULL,
	"platform" varchar(16) NOT NULL,
	"utmSource" varchar(100),
	"utmMedium" varchar(100),
	"utmCampaign" varchar(150),
	"referrerHost" varchar(200),
	"landingPath" varchar(200),
	"country" varchar(8),
	"timezone" varchar(64),
	"language" varchar(16),
	"firstSeenAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_attribution_source_idx" ON "user_attribution" USING btree ("source");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"name" varchar(40) NOT NULL,
	"feature" varchar(40),
	"platform" varchar(16) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "app_events_created_at_idx" ON "app_events" USING btree ("createdAt");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "app_events_feature_created_idx" ON "app_events" USING btree ("feature","createdAt");
