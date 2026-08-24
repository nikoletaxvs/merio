// One-off dev helper: backfills payments for previous billing periods so
// members have multi-month payment history to view on the dashboard.
// Usage: node scripts/seed-history.mjs [numberOfPastPeriods]
import "dotenv/config";
import postgres from "postgres";

const db = postgres(process.env.DATABASE_URL);

function parseDate(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(dateStr, months) {
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return toDateString(new Date(year, month, Math.min(date.getDate(), lastDay)));
}

function normalizeDate(value) {
  return value instanceof Date ? toDateString(value) : String(value);
}

function getCurrentPeriod(startDate, today = new Date()) {
  const start = parseDate(startDate);
  const startDay = start.getDate();

  let n =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth());

  if (today.getDate() < startDay) n -= 1;

  let periodStart = addMonths(startDate, n);
  if (today < parseDate(periodStart)) {
    n -= 1;
    periodStart = addMonths(startDate, n);
  }

  return { start: periodStart, end: addMonths(startDate, n + 1), index: n };
}

const pastCount = Number(process.argv[2] ?? 3);

const subscriptions = await db`
  SELECT id, name, start_date, amount_cents FROM subscriptions
`;
const members = await db`SELECT id, subscription_id FROM members`;

let inserted = 0;

for (const member of members) {
  const subscription = subscriptions.find(
    (s) => s.id === member.subscription_id,
  );
  if (!subscription) continue;

  const startDate = normalizeDate(subscription.start_date);
  const { index } = getCurrentPeriod(startDate);

  for (let i = 1; i <= pastCount; i++) {
    if (index - i < 0) break;

    const periodStart = addMonths(startDate, index - i);
    const periodEnd = addMonths(startDate, index - i + 1);

    const existing = await db`
      SELECT id FROM payments
      WHERE member_id = ${member.id} AND period_start = ${periodStart}
    `;
    if (existing.length > 0) continue;

    // Oldest periods paid, most recent past period left pending.
    const isPaid = i >= 2;
    await db`
      INSERT INTO payments
        (member_id, amount_cents, period_start, period_end, status, paid_at)
      VALUES (
        ${member.id},
        ${subscription.amount_cents},
        ${periodStart},
        ${periodEnd},
        ${isPaid ? "paid" : "pending"},
        ${isPaid ? new Date(parseDate(periodEnd).getTime() + 86400000 * 3) : null}
      )
    `;
    inserted++;
  }
}

console.log(`Inserted ${inserted} historical payments.`);
await db.end();
