CREATE TYPE "public"."intention_category" AS ENUM('cura', 'familia', 'conversao', 'trabalho', 'defuntos', 'paz');--> statement-breakpoint
CREATE TABLE "intention_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"intentionId" integer NOT NULL,
	"userId" integer NOT NULL,
	"authorName" varchar(128) NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"message" varchar(300) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "prayer_intentions" ADD COLUMN "category" "intention_category";--> statement-breakpoint
ALTER TABLE "prayer_intentions" ADD COLUMN "isAnonymous" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "prayer_intentions" ADD COLUMN "graceObtained" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "prayer_intentions" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
CREATE INDEX "prt_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "prt_user_idx" ON "password_reset_tokens" USING btree ("userId");