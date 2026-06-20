CREATE TABLE "daily_liturgy" (
	"id" serial PRIMARY KEY NOT NULL,
	"liturgyDate" varchar(10) NOT NULL,
	"celebration" text,
	"color" varchar(32),
	"firstReading" jsonb,
	"psalm" jsonb,
	"secondReading" jsonb,
	"gospel" jsonb,
	"prayers" jsonb,
	"antiphons" jsonb,
	"source" varchar(128) DEFAULT 'liturgia.up.railway.app' NOT NULL,
	"fetchedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_liturgy_liturgyDate_unique" UNIQUE("liturgyDate")
);
