import "server-only";

import { getPrismaClient } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/status";
import { appendRecord, readJson, runtimeDataPath } from "@/lib/storage/fileStore";

export interface RuntimeAuditActor {
  id?: string;
  name: string;
  role?: string;
}

export interface RuntimeAuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: RuntimeAuditActor;
  module: string;
  result: "success" | "warning" | "failure";
  details: Record<string, unknown>;
}

export interface ProjectEventEntry {
  id: string;
  timestamp: string;
  kind: string;
  status: string;
  summary: string;
  details: Record<string, unknown>;
}

const AUDIT_LOG_FILE = runtimeDataPath("audit-log.json");
const PROJECT_EVENTS_FILE = runtimeDataPath("project-events.json");
function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listAuditEvents() {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const records = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return records.map((record: any) => ({
      id: record.id,
      timestamp: record.createdAt.toISOString(),
      action: record.action,
      actor: {
        id: record.actorId ?? undefined,
        name: record.actorName || "Unknown actor",
        role: record.actorRole ?? undefined,
      },
      module: record.module,
      result: record.result as RuntimeAuditEntry["result"],
      details: isRecord(record.metadata) ? record.metadata : {},
    }));
  }

  const state = await readJson<{ records: RuntimeAuditEntry[] }>(AUDIT_LOG_FILE, { records: [] });
  return state.records;
}

export async function recordAuditEvent(input: Omit<RuntimeAuditEntry, "id" | "timestamp">) {
  const entry: RuntimeAuditEntry = {
    id: createId("audit"),
    timestamp: new Date().toISOString(),
    ...input,
  };
  const database = await getDatabaseHealth();

  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    await prisma.auditLog.create({
      data: {
        id: entry.id,
        actorId: entry.actor.id,
        actorName: entry.actor.name,
        actorRole: entry.actor.role,
        action: entry.action,
        module: entry.module,
        result: entry.result,
        metadata: entry.details,
        createdAt: new Date(entry.timestamp),
      },
    });
    return entry;
  }

  await appendRecord(AUDIT_LOG_FILE, entry, { collectionKey: "records", maxEntries: 500, backupBeforeWrite: true });
  return entry;
}

export async function listProjectEvents() {
  const state = await readJson<{ records: ProjectEventEntry[] }>(PROJECT_EVENTS_FILE, { records: [] });
  return state.records;
}

export async function recordProjectEvent(input: Omit<ProjectEventEntry, "id" | "timestamp">) {
  const entry: ProjectEventEntry = {
    id: createId("project-event"),
    timestamp: new Date().toISOString(),
    ...input,
  };
  await appendRecord(PROJECT_EVENTS_FILE, entry, { collectionKey: "records", maxEntries: 500, backupBeforeWrite: true });
  return entry;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
