export const APP_VERSION = "v0.15";

export const APP_VERSION_NOTE = "runtime honesty and stable-local gate";

export type VersionHistoryEntry = {
  version: string;
  date: string;
  title: string;
  summary: string;
  applied: string[];
};

export const APP_VERSION_HISTORY: VersionHistoryEntry[] = [
  {
    version: "v0.15",
    date: "2026-06-01",
    title: "stable-local gate",
    summary: "Health endpoint, durable local storage, smoke coverage and runtime honesty.",
    applied: [
      "GET /api/health with degraded semantics",
      "Durable local runtime and bug storage",
      "Playwright smoke coverage for critical flows",
    ],
  },
  {
    version: "v0.14",
    date: "2026-05-31",
    title: "beta core implementation",
    summary: "Core beta contracts, bug intake, Telegram intelligence endpoint and auth/session hardening.",
    applied: [
      "Pure beta contracts for route intelligence",
      "Bug intake API and admin-side reporting baseline",
      "Localhost auth cookie fix for next start",
    ],
  },
  {
    version: "v0.13",
    date: "2026-05-31",
    title: "restore and audit baseline",
    summary: "Project restore, dependency recovery and baseline verification on the new machine.",
    applied: [
      "Dependency install and lockfile regeneration",
      "TypeScript seed repair and baseline build recovery",
      "Audit, QA and environment traceability docs",
    ],
  },
];
