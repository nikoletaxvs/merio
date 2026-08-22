ALTER TABLE "payments" ADD COLUMN "period_start" date;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "period_end" date;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "start_date" date;--> statement-breakpoint
UPDATE "subscriptions" SET "start_date" = "created_at"::date;--> statement-breakpoint
UPDATE "payments" p
SET
  "period_start" = (c."start_date" + (c.n || ' months')::interval)::date,
  "period_end" = (c."start_date" + ((c.n + 1) || ' months')::interval)::date
FROM (
  SELECT
    p."id",
    s."start_date",
    (EXTRACT(YEAR FROM d)::int - EXTRACT(YEAR FROM s."start_date")::int) * 12
      + (EXTRACT(MONTH FROM d)::int - EXTRACT(MONTH FROM s."start_date")::int)
      - CASE WHEN EXTRACT(DAY FROM d) < EXTRACT(DAY FROM s."start_date") THEN 1 ELSE 0 END AS n
  FROM "payments" p
  JOIN "members" m ON p."member_id" = m."id"
  JOIN "subscriptions" s ON m."subscription_id" = s."id"
  CROSS JOIN LATERAL (
    SELECT make_date(
      substring(p."payment_month" from 1 for 4)::int,
      substring(p."payment_month" from 6 for 2)::int,
      15
    ) AS d
  ) sub
  WHERE p."payment_month" ~ '^[0-9]{4}-[0-9]{2}$'
) c
WHERE p."id" = c."id";--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "period_start" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "period_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_period_start_unique" UNIQUE("member_id","period_start");
