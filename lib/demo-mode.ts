/**
 * Demo mode runs the app as a public sandbox: visitors go straight into the
 * dashboard, emails are logged instead of sent, and the data is reset
 * nightly. It must only ever be enabled on a deployment with its own
 * database, never on the one holding real data.
 *
 * Kept separate from lib/demo.ts so proxy.ts can import it without pulling
 * in the database client.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}
