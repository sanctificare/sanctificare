CREATE TABLE "spiritual_journeys" (
  "id" varchar(80) PRIMARY KEY NOT NULL,
  "title" varchar(180) NOT NULL,
  "description" text NOT NULL,
  "image" text,
  "totalDays" integer NOT NULL,
  "traditionalStartMonth" integer,
  "traditionalStartDay" integer,
  "traditionalEndMonth" integer,
  "traditionalEndDay" integer,
  "allowsCustomStart" boolean DEFAULT true NOT NULL,
  "status" varchar(32) DEFAULT 'published' NOT NULL,
  "category" varchar(64) NOT NULL,
  "accessType" varchar(32) DEFAULT 'traditional-free' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spiritual_journey_days" (
  "id" serial PRIMARY KEY NOT NULL,
  "journeyId" varchar(80) NOT NULL REFERENCES "spiritual_journeys"("id") ON DELETE cascade,
  "dayNumber" integer NOT NULL,
  "title" varchar(180) NOT NULL,
  "theme" text,
  "traditionalContent" jsonb,
  "scripture" jsonb,
  "meditation" text,
  "audioUrl" text,
  "virtue" varchar(120),
  "purpose" text,
  "suggestedPenance" text,
  "examination" jsonb,
  "saintQuote" text,
  "complementaryPrayer" text,
  "freeContent" jsonb,
  "premiumContent" jsonb
);
--> statement-breakpoint
CREATE UNIQUE INDEX "spiritual_journey_day_uq" ON "spiritual_journey_days" USING btree ("journeyId", "dayNumber");
--> statement-breakpoint
CREATE TABLE "spiritual_journey_progress" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "journeyId" varchar(80) NOT NULL REFERENCES "spiritual_journeys"("id") ON DELETE cascade,
  "startedAt" varchar(10) NOT NULL,
  "expectedEndAt" varchar(10) NOT NULL,
  "lastAccessedDay" integer DEFAULT 1 NOT NULL,
  "completedDays" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "currentStreak" integer DEFAULT 0 NOT NULL,
  "chosenPenance" text,
  "reminderTime" varchar(5),
  "status" varchar(32) DEFAULT 'active' NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "spiritual_journey_progress_user_uq" ON "spiritual_journey_progress" USING btree ("userId", "journeyId");
--> statement-breakpoint
CREATE TABLE "spiritual_journey_journals" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
  "journeyId" varchar(80) NOT NULL REFERENCES "spiritual_journeys"("id") ON DELETE cascade,
  "dayNumber" integer NOT NULL,
  "content" text NOT NULL,
  "isPrivate" boolean DEFAULT true NOT NULL,
  "isFavorite" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "spiritual_journey_journal_user_day_uq" ON "spiritual_journey_journals" USING btree ("userId", "journeyId", "dayNumber");