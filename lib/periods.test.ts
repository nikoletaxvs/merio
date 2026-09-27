import { describe, expect, it } from "vitest";

import {
  formatPeriod,
  getCurrentPeriod,
  getNextPeriodStart,
  parseDate,
  toDateString,
} from "./periods";

// Local-time date, matching how the app builds dates.
const on = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day);

describe("parseDate / toDateString", () => {
  it("round-trips a YYYY-MM-DD string in local time", () => {
    expect(toDateString(parseDate("2026-03-09"))).toBe("2026-03-09");
  });

  it("zero-pads month and day", () => {
    expect(toDateString(on(2026, 1, 5))).toBe("2026-01-05");
  });
});

describe("getCurrentPeriod", () => {
  it("returns the first period on the start date itself", () => {
    expect(getCurrentPeriod("2026-01-15", on(2026, 1, 15))).toEqual({
      start: "2026-01-15",
      end: "2026-02-15",
    });
  });

  it("stays in the previous period the day before the monthly start day", () => {
    expect(getCurrentPeriod("2026-01-15", on(2026, 3, 14))).toEqual({
      start: "2026-02-15",
      end: "2026-03-15",
    });
  });

  it("rolls over exactly on the monthly start day", () => {
    expect(getCurrentPeriod("2026-01-15", on(2026, 3, 15))).toEqual({
      start: "2026-03-15",
      end: "2026-04-15",
    });
  });

  it("crosses the year boundary", () => {
    expect(getCurrentPeriod("2025-11-20", on(2026, 1, 3))).toEqual({
      start: "2025-12-20",
      end: "2026-01-20",
    });
  });

  it("ignores the time of day", () => {
    const lateEvening = new Date(2026, 2, 14, 23, 59);

    expect(getCurrentPeriod("2026-01-15", lateEvening).start).toBe(
      "2026-02-15",
    );
  });

  describe("start day that some months don't have (31st)", () => {
    it("clamps to the last day of shorter months", () => {
      expect(getCurrentPeriod("2026-01-31", on(2026, 3, 10))).toEqual({
        start: "2026-02-28",
        end: "2026-03-31",
      });
    });

    it("starts the new period ON the clamped day, not the day after", () => {
      // Periods are Jan 31 → Feb 28 → Mar 31 → Apr 30. On Feb 28 the
      // Feb 28 period has begun.
      expect(getCurrentPeriod("2026-01-31", on(2026, 2, 28))).toEqual({
        start: "2026-02-28",
        end: "2026-03-31",
      });
      expect(getCurrentPeriod("2026-01-31", on(2026, 4, 30))).toEqual({
        start: "2026-04-30",
        end: "2026-05-31",
      });
    });

    it("uses Feb 29 in a leap year", () => {
      expect(getCurrentPeriod("2028-01-31", on(2028, 2, 29))).toEqual({
        start: "2028-02-29",
        end: "2028-03-31",
      });
    });

    it("returns to the 31st after a clamped month", () => {
      expect(getCurrentPeriod("2026-01-31", on(2026, 3, 31))).toEqual({
        start: "2026-03-31",
        end: "2026-04-30",
      });
    });
  });

  it("today always falls inside set period", () => {
    const startDate = "2026-01-31";

    for (let day = 0; day < 800; day++) {
      const today = on(2026, 1, 31 + day);
      const { start, end } = getCurrentPeriod(startDate, today);

      expect(parseDate(start) <= today).toBe(true);
      expect(parseDate(end) > today).toBe(true);
    }
  });
});

describe("getNextPeriodStart", () => {
  it("returns the start of the following period", () => {
    expect(getNextPeriodStart("2026-01-15", on(2026, 3, 20))).toBe(
      "2026-04-15",
    );
  });
});

describe("formatPeriod", () => {
  it("omits the year when both dates share it", () => {
    expect(formatPeriod("2026-03-15", "2026-04-15")).toBe("15 Mar – 15 Apr");
  });

  it("adds the year when the period crosses into a new year", () => {
    expect(formatPeriod("2025-12-20", "2026-01-20")).toBe(
      "20 Dec – 20 Jan 2026",
    );
  });
});
