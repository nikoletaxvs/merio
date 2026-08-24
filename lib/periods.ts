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
  const n = periodIndex(date, startDate);

  return {
    start: addMonths(startDate, n),
    end: addMonths(startDate, n + 1),
  };
}

export function getNextPeriodStart(
  startDate: string,
  today: Date = new Date(),
): string {
  const n = periodIndex(today, startDate);

  return addMonths(startDate, n + 1);
}

function periodIndex(date: Date, startDate: string): number {
  const start = parseDate(startDate);
  const startDay = start.getDate();

  let n =
    (date.getFullYear() - start.getFullYear()) * 12 +
    (date.getMonth() - start.getMonth());

  if (date.getDate() < startDay) {
    n -= 1;
  }

  if (date < parseDate(addMonths(startDate, n))) {
    n -= 1;
  }

  return n;
}

export function getCurrentPeriod(startDate: string, today: Date = new Date()) {
  return getPeriod(today, startDate);
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(date: Date, withYear: boolean): string {
  const day = date.getDate();
  const month = MONTHS_SHORT[date.getMonth()];

  return withYear ? `${day} ${month} ${date.getFullYear()}` : `${day} ${month}`;
}

export function formatPeriod(start: string, end: string) {
  const fromDate = parseDate(start);
  const toDate = parseDate(end);
  const sameYear = fromDate.getFullYear() === toDate.getFullYear();

  return `${formatDate(fromDate, false)} – ${formatDate(toDate, !sameYear)}`;
}

export function formatDateLong(date: Date) {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}
