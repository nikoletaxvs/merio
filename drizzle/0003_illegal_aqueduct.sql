ALTER TABLE "members" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_token_unique" UNIQUE("token");