import "server-only";

import type { NextRequest } from "next/server";

/**
 * Checks the `Authorization: Bearer <CRON_SECRET>` header that Vercel Cron
 * sends. Fails closed when CRON_SECRET is unset, otherwise a request with
 * the literal header "Bearer undefined" would be let through.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}
