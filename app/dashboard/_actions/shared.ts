import "server-only";

import { isAuthenticated } from "@/lib/auth";

// Shared by the dashboard's server actions. Not a "use server" file itself:
// those may only export async functions, and this exports types.

/** Result of a form action: null on success, or a message to show. */
export type ActionState = { error: string } | null;

export type TestRemindersState =
  | {
      error?: string;
      sent?: number;
      skipped?: number;
      notDue?: number;
      created?: number;
    }
  | null;

/**
 * Server actions are public endpoints, so every one checks the session
 * itself instead of relying on proxy.ts having protected the page.
 */
export async function guard(): Promise<ActionState> {
  if (!(await isAuthenticated())) {
    return { error: "Your session expired. Please sign in again." };
  }

  return null;
}
