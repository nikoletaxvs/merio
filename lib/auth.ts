import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE,
  createSessionToken,
  isValidSessionToken,
} from "./auth-tokens";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireOwner(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function startSession(): Promise<void> {
  const store = await cookies();

  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
