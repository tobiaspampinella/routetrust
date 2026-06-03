import { test, expect } from "@playwright/test";

/**
 * Public smoke tests — no auth required. These assert that the core public surface of
 * RouteTrust boots and serves real content, guarding against build/runtime regressions
 * (the kind that produce 500s or blank shells). Authenticated admin/driver flows are
 * covered separately and are out of scope for the unauthenticated smoke.
 */
test.describe("RouteTrust public smoke", () => {
  test("health endpoint returns a structured status payload", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.app).toBe("RouteTrust");
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("checks");
    // Health must report honestly — it should never claim readiness it cannot back.
    expect(typeof body.serverReady).toBe("boolean");
  });

  test("landing page renders", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok()).toBeTruthy();
    await expect(page).toHaveTitle(/RoutePulse|RouteTrust/i);
  });

  test("login page renders", async ({ page }) => {
    const res = await page.goto("/login");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("body")).toContainText(/RouteTrust/i);
  });

  test("customer tracking demo renders", async ({ page }) => {
    const res = await page.goto("/track/demo");
    expect(res?.ok()).toBeTruthy();
    await expect(page.locator("body")).not.toBeEmpty();
  });
});
