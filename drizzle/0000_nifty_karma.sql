CREATE TYPE "public"."plan" AS ENUM('monthly', 'annual');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."templatePreference" AS ENUM('classico', 'moderno', 'tradicional', 'minimalista');--> statement-breakpoint
CREATE TABLE "intention_prayers" (
	"id" serial PRIMARY KEY NOT NULL,
	"intentionId" integer NOT NULL,
	"userId" integer NOT NULL,
	"prayedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_intentions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"authorName" varchar(128) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"prayerCount" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"prayerType" varchar(64) NOT NULL,
	"prayerName" varchar(128) NOT NULL,
	"completedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"plan" "plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"templatePreference" "templatePreference" DEFAULT 'classico' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
