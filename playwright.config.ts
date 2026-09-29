import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);


const remoteUrl = process.env.E2E_BASE_URL;
const port = Number(process.env.E2E_PORT ?? 3000);
const baseURL = remoteUrl ?? `http://localhost:${port}`;

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const vercelBypassHeaders =
  remoteUrl && bypassSecret
    ? {
        "x-vercel-protection-bypass": bypassSecret,
        "x-vercel-set-bypass-cookie": "true",
      }
    : undefined;

/**
 * End-to-end tests run the real app in a real browser against a real
 * database, in demo mode. Each test resets the demo data first, and
 * resetDemoData refuses to touch a database the demo doesn't own, so these
 * tests can't wipe real data even if pointed at the wrong DATABASE_URL.
 */
export default defineConfig({
  testDir: "./e2e",
  // Tests share one database, so run them one at a time.
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI || remoteUrl ? 1 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",

  // A deployed site can be slow on its first request after being idle.
  expect: { timeout: remoteUrl ? 15_000 : 5_000 },

  use: {
    baseURL,
    extraHTTPHeaders: vercelBypassHeaders,
    // On failure, keep a replayable trace: npx playwright show-trace <file>
    trace: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // A remote site is already running, so only start a server for local runs.
  // CI builds first and tests the production server; locally, reuse your
  // running `npm run dev` or start one.
  webServer: remoteUrl
    ? undefined
    : {
        command: isCI ? `npm run start -- -p ${port}` : `npm run dev -- -p ${port}`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
