import { parseDate } from "@/lib/billing/periods";

/**
 * Reminder cadence: day 1 (period start), day 7, then weekly.
 */
export function daysSincePeriodStart(
  periodStart: string,
  today: Date,
): number {
  const start = parseDate(periodStart);
  const now = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.round((now.getTime() - start.getTime()) / 86400000);
}

export function shouldSendReminder(daysSinceStart: number): boolean {
  if (daysSinceStart < 0) {
    return false;
  }

  return (
    daysSinceStart === 0 ||
    daysSinceStart === 6 ||
    (daysSinceStart > 6 && (daysSinceStart - 6) % 7 === 0)
  );
}
