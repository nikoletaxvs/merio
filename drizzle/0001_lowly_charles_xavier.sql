ALTER TABLE "payments" RENAME COLUMN "amount" TO "amount_cents";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "amount" TO "amount_cents";