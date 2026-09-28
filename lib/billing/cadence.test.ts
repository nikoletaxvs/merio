import { describe, expect, it } from "vitest";

import { daysSincePeriodStart, shouldSendReminder } from "./cadence";

describe("daysSincePeriodStart", () => {
  it("is 0 on the period start date", () => {
    expect(daysSincePeriodStart("2026-03-15", new Date(2026, 2, 15))).toBe(0);
  });

  it("ignores the time of day", () => {
    expect(
      daysSincePeriodStart("2026-03-15", new Date(2026, 2, 16, 23, 59)),
    ).toBe(1);
  });

  it("counts across a month boundary", () => {
    expect(daysSincePeriodStart("2026-01-30", new Date(2026, 1, 2))).toBe(3);
  });

  it("is negative before the period starts", () => {
    expect(daysSincePeriodStart("2026-03-15", new Date(2026, 2, 13))).toBe(-2);
  });

  it("is not thrown off by a daylight-saving change", () => {
    // Most of Europe moves clocks forward on the last Sunday of March.
    expect(daysSincePeriodStart("2026-03-25", new Date(2026, 3, 1))).toBe(7);
  });
});

describe("shouldSendReminder", () => {
  it("sends on day 1 (0 days in), day 7 (6 days in), then weekly", () => {
    const sendDays = Array.from({ length: 40 }, (_, day) => day).filter(
      shouldSendReminder,
    );

    expect(sendDays).toEqual([0, 6, 13, 20, 27, 34]);
  });

  it("never sends before the period starts", () => {
    expect(shouldSendReminder(-1)).toBe(false);
    expect(shouldSendReminder(-7)).toBe(false);
  });
});
