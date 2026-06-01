import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db/status";
import { APP_VERSION } from "@/lib/version";
import path from "node:path";
import { ensureFile, readJson, runtimeDataPath } from "@/lib/storage/fileStore";

interface ProjectStatusSnapshot {
  scheduler?: { status?: string; lastRun?: string };
  smokeBrowser?: { status?: string };
  storage?: { status?: string };
  telegram?: { status?: string; configured?: boolean };
}

function authStatus() {
  if (process.env.ROUTEPULSE_DEMO_SECRET || process.env.AUTH_SECRET) return "configured";
  if (process.env.NODE_ENV === "production") return "missing";
  return "demo_supervised";
}

async function checkJsonFile(fileName: string) {
  const filePath = runtimeDataPath(fileName);
  try {
    const fallback = { records: [] as unknown[] };
    await ensureFile(filePath, fallback);
    await readJson(filePath, fallback);
    return "ok" as const;
  } catch {
    return "fail" as const;
  }
}

async function readProjectStatus() {
  return readJson<ProjectStatusSnapshot>(path.join(process.cwd(), "runtime", "project-status.json"), {});
}

export async function GET() {
  const [bugStore, auditStore, projectEventStore, projectStatus, database] = await Promise.all([
    checkJsonFile("bug-reports.json"),
    checkJsonFile("audit-log.json"),
    checkJsonFile("project-events.json"),
    readProjectStatus(),
    getDatabaseHealth(),
  ]);

  const storageStates = [bugStore, auditStore, projectEventStore];
  const storage = storageStates.every((state) => state === "ok") ? "ok" : "fail";
  const telegram = projectStatus.telegram?.configured
    ? "configured"
    : projectStatus.telegram?.status === "out_of_scope"
      ? "out_of_scope"
      : "not_configured";
  const maps = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "configured" : "fallback";
  const runtime = projectStatus.scheduler?.status === "running" ? "ok" : "degraded";
  const bugStoreStatus = bugStore === "ok" ? "ok" : "fail";
  const auth = authStatus();
  const persistence = database.status === "ok" ? "database" : "file_fallback";

  let status: "ok" | "degraded" | "fail" = "ok";
  if (storage === "fail" || bugStoreStatus === "fail" || database.status === "fail") {
    status = "fail";
  } else if (
    telegram !== "configured" ||
    runtime !== "ok" ||
    auth === "demo_supervised" ||
    maps === "fallback" ||
    database.status === "missing"
  ) {
    status = "degraded";
  }

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      app: "RouteTrust",
      environment: process.env.NODE_ENV || "development",
      version: APP_VERSION,
      checks: {
        server: "ok",
        storage,
        db: database.status,
        persistence,
        bugStore: bugStoreStatus,
        telegram,
        maps,
        auth,
        runtime,
      },
      details: {
        db: database.detail,
      },
    },
    { status: 200 },
  );
}
