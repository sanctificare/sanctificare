ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordChangedAt" timestamp with time zone;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_feedback" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer REFERENCES "users"("id") ON DELETE cascade,
  "email" varchar(320) NOT NULL,
  "name" text,
  "subject" varchar(200) NOT NULL,
  "message" text NOT NULL,
  "resolved" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_feedback_resolved_idx" ON "user_feedback" USING btree ("resolved");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_feedback_created_idx" ON "user_feedback" USING btree ("createdAt");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_prayers" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(128) NOT NULL,
  "content" text NOT NULL,
  "category" varchar(64) DEFAULT 'geral' NOT NULL,
  "isPremium" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
