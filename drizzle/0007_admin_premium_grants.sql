CREATE TABLE "admin_premium_grants" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"grantedByUserId" integer,
	"grantedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"revokedAt" timestamp with time zone,
	"revokedByUserId" integer
);
--> statement-breakpoint
ALTER TABLE "admin_premium_grants" ADD CONSTRAINT "admin_premium_grants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_premium_grants" ADD CONSTRAINT "admin_premium_grants_grantedByUserId_users_id_fk" FOREIGN KEY ("grantedByUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_premium_grants" ADD CONSTRAINT "admin_premium_grants_revokedByUserId_users_id_fk" FOREIGN KEY ("revokedByUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "admin_premium_grants_user_access_idx" ON "admin_premium_grants" USING btree ("userId","revokedAt","expiresAt");