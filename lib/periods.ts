export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(dateStr: string, months: number): string {
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return toDateString(new Date(year, month, Math.min(date.getDate(), lastDay)));
}

export function getPeriod(
  date: Date,
  startDate: string,
): { start: string; end: string } {
  const start = parseDate(startDate);
  const startDay = start.getDate();

  let n =
    (date.getFullYear() - start.getFullYear()) * 12 +
    (date.getMonth() - start.getMonth());

  if (date.getDate() < startDay) {
    n -= 1;
  }

  let periodStart = addMonths(startDate, n);

  if (date < parseDate(periodStart)) {
    n -= 1;
    periodStart = addMonths(startDate, n);
  }

  const periodEnd = addMonths(startDate, n + 1);

  return { start: periodStart, end: periodEnd };
}

export function getCurrentPeriod(startDate: string, today: Date = new Date()) {
  return getPeriod(today, startDate);
}

export function formatPeriod(start: string, end: string) {
  const from = parseDate(start).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
  const to = parseDate(end).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${from} – ${to}`;
}
