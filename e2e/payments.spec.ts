import { expect, test } from "@playwright/test";
import { memberRow, openFreshDemoDashboard } from "./helpers";

test.beforeEach(async ({ page }) => {
  await openFreshDemoDashboard(page);
});

test("a member marks their payment as paid and the owner sees it", async ({
  page,
}) => {
  await page.goto("/pay/demo-jordan");

  await expect(page.getByRole("heading", { name: "Hi, Jordan." })).toBeVisible();
  await expect(page.getByText("Waiting for you")).toBeVisible();

  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/pay/demo-jordan",
  );
  await page.getByRole("button", { name: /I.ve sent/ }).click();

  // Optimistic UI: "settled" shows before the server has answered...
  await expect(page.getByText("You're all settled for this month.")).toBeVisible();

  // ...so wait for the save to finish, then reload to prove it was stored,
  // not just displayed. Reloading earlier would cancel the request.
  await saved;
  await page.reload();
  await expect(page.getByText("You're all settled for this month.")).toBeVisible();
  await expect(page.getByRole("button", { name: /I.ve sent/ })).toHaveCount(0);

  await page.goto("/dashboard");
  await expect(memberRow(page, "Jordan Lee")).toContainText("Paid");
});

test("keyboard users skip collapsed rows and reach an opened row's actions", async ({
  page,
}) => {
  const jordan = memberRow(page, "Jordan Lee");
  const payLink = page.getByRole("link", { name: /Open Jordan Lee's pay page/ });

  // Collapsed rows are `inert`: Tab must jump to the next member, not into
  // the hidden action buttons. (Playwright counts a zero-height, transparent
  // element as "visible", so focus is the meaningful thing to check.)
  await jordan.focus();
  await page.keyboard.press("Tab");
  await expect(payLink).not.toBeFocused();
  await expect(page.locator(":focus")).toHaveAttribute("aria-expanded", "false");

  // Opened, the row's actions come next in the tab order.
  await jordan.click();
  await expect(jordan).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(payLink).toBeFocused();
  await expect(payLink).toHaveAttribute("href", "/pay/demo-jordan");
  await expect(payLink).toHaveAttribute("target", "_blank");
});

test("an unknown payment link shows a not-found page", async ({ page }) => {
  await page.goto("/pay/not-a-real-token");

  await expect(
    page.getByRole("heading", { name: "Payment link not found" }),
  ).toBeVisible();
});
