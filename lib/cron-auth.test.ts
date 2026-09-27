import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { isAuthorizedCron } from "./cron-auth";

function requestWith(authorization?: string) {
  return new NextRequest("http://localhost/api/payments/generate", {
    headers: authorization ? { authorization } : {},
  });
}

describe("isAuthorizedCron", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts the correct bearer token", () => {
    vi.stubEnv("CRON_SECRET", "s3cret");

    expect(isAuthorizedCron(requestWith("Bearer s3cret"))).toBe(true);
  });

  it("rejects a wrong or missing token", () => {
    vi.stubEnv("CRON_SECRET", "s3cret");

    expect(isAuthorizedCron(requestWith("Bearer wrong"))).toBe(false);
    expect(isAuthorizedCron(requestWith("s3cret"))).toBe(false);
    expect(isAuthorizedCron(requestWith())).toBe(false);
  });

  it("fails closed when CRON_SECRET is unset", () => {
    vi.stubEnv("CRON_SECRET", "");

    // The old inline check compared against `Bearer ${undefined}`.
    expect(isAuthorizedCron(requestWith("Bearer undefined"))).toBe(false);
    expect(isAuthorizedCron(requestWith("Bearer "))).toBe(false);
  });
});
