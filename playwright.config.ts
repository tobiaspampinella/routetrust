import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
const port = process.env.PLAYWRIGHT_PORT || "3000";
const skipWebServer = process.env.PLAYWRIGHT_NO_WEB_SERVER === "1";
const edgeExecutableCandidates = [
  process.env.PLAYWRIGHT_EDGE_EXECUTABLE,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter((value): value is string => Boolean(value));
const edgeExecutablePath = edgeExecutableCandidates.find((candidate) => fs.existsSync(candidate));

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: 1,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: `cross-env PORT=${port} npm run dev`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(edgeExecutablePath
          ? {
              channel: undefined,
              launchOptions: {
                executablePath: edgeExecutablePath,
              },
            }
          : {
              channel: "msedge",
            }),
      },
    },
  ],
});
