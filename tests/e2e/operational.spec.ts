import { test, expect, type Page } from "@playwright/test";

/**
 * Authenticated operational smoke: exercises the real admin and driver flows behind login,
 * including a full-stack drivers create -> delete round-trip (UI -> API -> file store). These
 * guard the operational surface against regressions/500s as the product grows.
 */

// These flows share backend state (auth, file-backed drivers store) and a single dev server,
// so run them serially to avoid cross-test contention.
test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/(admin|driver)/, { timeout: 20000 });
}

test.describe("admin operational flows", () => {
  test("dashboard renders with live system status", async ({ page }) => {
    await login(page, "admin@demo.com", "admin123");
    await page.goto("/admin");
    await expect(page.locator("h1")).toContainText(/Centro de operaciones/i);
    await expect(page.getByText("Estado del sistema")).toBeVisible();
  });

  test("approvals and audit-logs load without errors", async ({ page }) => {
    await login(page, "admin@demo.com", "admin123");

    const approvals = await page.goto("/admin/approvals");
    expect(approvals?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toContainText(/Aprobaciones/i);

    const audit = await page.goto("/admin/audit-logs");
    expect(audit?.ok()).toBeTruthy();
    await expect(page.locator("h1")).toContainText(/Audit logs/i);
  });

  test("drivers full-stack create -> delete round-trip", async ({ page }) => {
    await login(page, "admin@demo.com", "admin123");
    await page.goto("/admin/drivers");
    await expect(page.locator("h1")).toContainText(/Conductores/i);
    await page.waitForSelector("tbody tr", { timeout: 15000 });

    const name = `E2E Driver ${Date.now()}`;
    await page.getByRole("button", { name: "Nuevo conductor" }).first().click();
    await page.fill("#driver-name", name);
    await page.fill("#driver-phone", "+54 11 0000 0000");
    await page.getByRole("button", { name: "Crear conductor" }).click();

    // Created driver appears (UI -> API -> file store -> refetch)
    await expect(page.getByText(name, { exact: true })).toBeVisible({ timeout: 10000 });

    // Clean up so the test is idempotent. The row action sits near the bottom where the global
    // assistant FAB floats; dispatch the click directly on the button so the fixed overlay can't
    // swallow it. The confirm modal is centered, so a normal click works there.
    await page.getByRole("button", { name: `Eliminar ${name}` }).dispatchEvent("click");
    await page.getByRole("button", { name: "Eliminar", exact: true }).click();
    await expect(page.getByText(name, { exact: true })).toHaveCount(0, { timeout: 10000 });
  });
});

test.describe("driver portal flows", () => {
  test("driver home and route render with actions", async ({ page }) => {
    await login(page, "driver1@demo.com", "driver123");

    await page.goto("/driver");
    await expect(page.locator("h1")).toBeVisible();

    const route = await page.goto("/driver/route");
    expect(route?.ok()).toBeTruthy();
    await expect(page.getByRole("button", { name: "Entregado" })).toBeVisible({ timeout: 10000 });
  });
});
