import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function login(page: Page, role: "admin" | "driver") {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login demo" })).toBeVisible();

  await page.getByLabel("Email").fill(role === "admin" ? "admin@demo.com" : "driver1@demo.com");
  await page.getByLabel("Password").fill(role === "admin" ? "admin123" : "driver123");
  await page.getByRole("button", { name: /Entrar|Validando/ }).click();
}

test("login page loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Login demo" })).toBeVisible();
});

test("admin demo can login and open admin status", async ({ page }) => {
  await login(page, "admin");
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/project-status");
  await expect(page.getByRole("heading", { name: "Project Status" })).toBeVisible();
  await expect(page.getByText("LLM workers")).toBeVisible();
  await expect(page.getByText("Autonomous agents")).toBeVisible();
});

test("driver demo can login and open driver route", async ({ page }) => {
  await login(page, "driver");
  await expect(page).toHaveURL(/\/driver$/);

  await page.goto("/driver/route");
  await expect(page).toHaveURL(/\/driver\/route$/);
});

test("tracking demo loads without breaking", async ({ page }) => {
  await page.goto("/track/demo");
  await expect(page).toHaveURL(/\/track\/demo$/);
  await expect(page.locator("body")).toContainText(/demo|tracking|RoutePulse/i);
});

test("health endpoint returns 200", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.app).toBe("RouteTrust");
  expect(payload.checks.server).toBe("ok");
});

test("telegram status endpoint does not throw 500 for authenticated admin", async ({ request }) => {
  const loginResponse = await request.post("/api/auth/login", {
    data: {
      email: "admin@demo.com",
      password: "admin123",
    },
  });

  expect(loginResponse.status()).toBe(200);

  const response = await request.get("/api/cms/telegram/status");
  expect(response.status()).toBeLessThan(500);
  const payload = await response.json();
  expect(["configured", "not_configured"]).toContain(payload.status);
});

test("bug report API creates a durable record in authenticated session", async ({ request }) => {
  const loginResponse = await request.post("/api/auth/login", {
    data: {
      email: "admin@demo.com",
      password: "admin123",
    },
  });

  expect(loginResponse.status()).toBe(200);

  const bugTitle = `Smoke ${Date.now()}`;
  const created = await request.post("/api/bugs", {
    data: {
      module: "qa",
      title: bugTitle,
      description: "Playwright smoke durable bug",
      severity: "P3",
    },
  });

  expect(created.status()).toBe(201);
  const createdPayload = await created.json();
  expect(createdPayload.report.id).toBeTruthy();

  const records = await request.get("/api/bugs");
  expect(records.status()).toBe(200);
  const recordsPayload = await records.json();
  expect(Array.isArray(recordsPayload.reports)).toBe(true);
  expect(recordsPayload.reports.some((report: { title?: string }) => report.title === bugTitle)).toBeTruthy();
});
