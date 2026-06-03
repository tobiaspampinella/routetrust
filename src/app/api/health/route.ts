import { NextResponse } from "next/server";
import { getDatabaseHealth } from "@/lib/db/status";
import { resolveMapProvider } from "@/lib/maps/provider";
import { APP_VERSION } from "@/lib/version";
import path from "node:path";
import { ensureFile, readJson, runtimeDataPath } from "@/lib/storage/fileStore";

interface ProjectStatusSnapshot {
  scheduler?: { status?: string; lastRun?: string };
  smokeBrowser?: { status?: string };
  storage?: { status?: string };
  telegram?: { status?: string; configured?: boolean };
  criticalBlockers?: string[];
}

function authMode() {
  if (process.env.AUTH_SECRET?.trim()) return "real";
  if (process.env.ROUTEPULSE_DEMO_SECRET?.trim()) return "demo";
  if (process.env.NODE_ENV === "production") return "missing";
  return "demo";
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
  const mapProvider = resolveMapProvider();
  const maps = mapProvider.status;
  const runtime = projectStatus.scheduler?.status === "running" ? "ok" : "degraded";
  const bugStoreStatus = bugStore === "ok" ? "ok" : "fail";
  const auth = authMode();
  const demoMode = process.env.DEMO_MODE !== "false";
  const storageMode = database.status === "ok" ? "db" : storage === "fail" ? "unavailable" : "file_fallback";
  const databaseState =
    database.status === "ok" ? "connected" : database.status === "fail" ? "disconnected" : "not_configured";
  const betaBlockers = [
    ...(database.status !== "ok" ? [`Database is ${databaseState}.`] : []),
    ...(storageMode !== "db" ? [`Storage mode is ${storageMode}.`] : []),
    ...(auth !== "real" ? [`Auth mode is ${auth}.`] : []),
    ...(demoMode ? ["DEMO_MODE is enabled."] : []),
    ...(runtime !== "ok" ? ["Runtime scheduler is not healthy."] : []),
    ...(projectStatus.criticalBlockers ?? []),
  ];
  const serverReady = database.status === "ok" && bugStoreStatus === "ok" && auth === "real" && runtime === "ok" && !demoMode;

  let status: "ok" | "degraded" | "fail" = "ok";
  if (storage === "fail" || bugStoreStatus === "fail" || database.status === "fail") {
    status = "fail";
  } else if (!serverReady || telegram !== "configured" || maps === "fallback") {
    status = "degraded";
  }

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      app: "RouteTrust",
      environment: process.env.NODE_ENV || "development",
      version: APP_VERSION,
      database: databaseState,
      storageMode,
      demoMode,
      authMode: auth,
      mapProvider: mapProvider.active,
      serverReady,
      betaBlockers,
      checks: {
        server: "ok",
        storage,
        db: database.status,
        persistence: storageMode,
        bugStore: bugStoreStatus,
        telegram,
        maps,
        auth,
        runtime,
        demoMode: demoMode ? "true" : "false",
        serverReady: serverReady ? "true" : "false",
      },
      details: {
        db: database.detail,
        maps: mapProvider.reason,
      },
    },
    { status: 200 },
  );
}
