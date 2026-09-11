import "server-only";

import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
  const explicit = process.env.APP_URL;

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ?? process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  const headersList = await headers();
  const host = headersList.get("host");

  if (host) {
    const proto = headersList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}