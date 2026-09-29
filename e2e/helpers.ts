import { expect, type Page } from "@playwright/test";

/**
 * Opens the dashboard (demo mode signs the browser in automatically) and
 * restores the sample family, so every test starts from the same data:
 * Alex and Maya have paid this period, Jordan, Sam and Chris owe.
 */
export async function openFreshDemoDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { level: 1, name: "The Demo Family" }),
  ).toBeVisible();

  // Wait for the server action's response, not for "Owes" to appear: on a
  // fresh database Jordan already owes before the reset, so that check could
  // pass while the reset is still truncating tables under the next step.
  const resetFinished = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/dashboard",
  );
  await page.getByRole("button", { name: "Reset data" }).click();
  await resetFinished;

  await expect(memberRow(page, "Jordan Lee")).toContainText("Owes");
}

/** The expandable row for a member on the dashboard. */
export function memberRow(page: Page, name: string) {
  return page.getByRole("button", { name: new RegExp(name) });
}
