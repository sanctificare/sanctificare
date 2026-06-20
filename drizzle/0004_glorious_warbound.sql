CREATE TYPE "public"."candle_type" AS ENUM('intencao', 'defuntos', 'agradecimento', 'adoracao');--> statement-breakpoint
CREATE TABLE "candle_prayers" (
	"id" serial PRIMARY KEY NOT NULL,
	"candleId" integer NOT NULL,
	"userId" integer NOT NULL,
	"prayedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "virtual_candles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"authorName" varchar(128) NOT NULL,
	"intention" text NOT NULL,
	"type" "candle_type" DEFAULT 'intencao' NOT NULL,
	"isAnonymous" boolean DEFAULT false NOT NULL,
	"prayerCount" integer DEFAULT 0 NOT NULL,
	"litAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
