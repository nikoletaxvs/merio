ALTER TABLE "payments" DROP CONSTRAINT "payments_member_id_payment_month_unique";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "payment_month";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "due_date";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "due_day";