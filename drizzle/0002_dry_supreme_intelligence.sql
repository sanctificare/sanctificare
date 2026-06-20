CREATE TABLE "lectio_journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"journalDate" varchar(10) NOT NULL,
	"passageId" varchar(80) NOT NULL,
	"passageReference" varchar(120),
	"anchoredPhrase" text,
	"personalNote" text,
	"currentStep" varchar(20),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "lectio_journal_user_date_passage_uq" ON "lectio_journal" USING btree ("userId","journalDate","passageId");