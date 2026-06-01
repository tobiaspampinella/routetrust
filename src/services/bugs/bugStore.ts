import "server-only";

import { getPrismaClient } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/status";
import type { BugReport, BugStatus } from "@/lib/bugReporting";
import { appendRecord, readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";
import { recordAuditEvent } from "@/services/audit/runtimeAuditStore";

interface StoredBugState {
  reports: BugReport[];
}

interface DispatchRecord {
  bugId: string;
  routedAt: string;
  primaryAgent: string;
  collaboratingAgents: string[];
  severity: string;
  note: string;
}

const BUG_REPORTS_FILE = runtimeDataPath("bug-reports.json");
const DISPATCHES_FILE = runtimeDataPath("bug-dispatches.json");
export async function listBugReports() {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const records = await prisma.bugReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return records.map(mapDbBugReportToDomain);
  }

  const state = await readJson<StoredBugState>(BUG_REPORTS_FILE, { reports: [] });
  return state.reports;
}

export async function saveBugReport(report: BugReport) {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    await prisma.bugReport.upsert({
      where: { id: report.id },
      update: mapDomainBugReportToDb(report),
      create: {
        id: report.id,
        ...mapDomainBugReportToDb(report),
      },
    });
  } else {
    const reports = await listBugReports();
    const next = [report, ...reports.filter((item: BugReport) => item.id !== report.id)].slice(0, 200);
    await writeJsonAtomic(BUG_REPORTS_FILE, { reports: next }, { backupBeforeWrite: true });
  }

  const actor = report.createdBy
    ? {
        id: report.createdBy.id,
        name: report.createdBy.name || "Unknown reporter",
        role: report.createdBy.role || "unknown",
      }
    : {
        name: "Unknown reporter",
        role: "unknown",
      };
  await recordAuditEvent({
    action: "bug_report_created",
    actor,
    module: report.module,
    result: "success",
    details: {
      bugId: report.id,
      severity: report.severity,
      routePath: report.routePath ?? null,
      intent: report.intent,
      persistence: database.status === "ok" ? "database" : "file_fallback",
    },
  });
  return report;
}

export async function findBugReport(bugId: string) {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const record = await prisma.bugReport.findUnique({
      where: { id: bugId },
    });
    return record ? mapDbBugReportToDomain(record) : null;
  }

  const reports = await listBugReports();
  return reports.find((item: BugReport) => item.id === bugId) || null;
}

export async function updateBugReportStatus(bugId: string, status: BugStatus, assignedAgents?: string[]) {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const existing = await prisma.bugReport.findUnique({
      where: { id: bugId },
    });
    if (!existing) return null;

    const updated = await prisma.bugReport.update({
      where: { id: bugId },
      data: {
        status,
        assignedAgents: assignedAgents && assignedAgents.length > 0 ? assignedAgents : existing.assignedAgents,
        updatedAt: new Date(),
      },
    });
    return mapDbBugReportToDomain(updated);
  }

  const reports = await listBugReports();
  let updated: BugReport | null = null;

  const next = reports.map((item: BugReport) => {
    if (item.id !== bugId) return item;
    updated = {
      ...item,
      status,
      assignedAgents: assignedAgents && assignedAgents.length > 0 ? assignedAgents : item.assignedAgents,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });

  if (!updated) return null;
  await writeJsonAtomic(BUG_REPORTS_FILE, { reports: next }, { backupBeforeWrite: true });
  return updated;
}

export async function recordBugDispatch(dispatch: DispatchRecord) {
  await appendRecord(DISPATCHES_FILE, dispatch, { collectionKey: "records", maxEntries: 500, backupBeforeWrite: true });
  const database = await getDatabaseHealth();
  await recordAuditEvent({
    action: "bug_dispatch_recorded",
    actor: {
      name: "RouteTrust Runtime",
      role: "system",
    },
    module: "bugs",
    result: "success",
    details: {
      bugId: dispatch.bugId,
      primaryAgent: dispatch.primaryAgent,
      severity: dispatch.severity,
      persistence: database.status === "ok" ? "database" : "file_fallback",
    },
  });
  return dispatch;
}

function mapDomainBugReportToDb(report: BugReport) {
  return {
    tenantId: null,
    source: report.source,
    module: report.module,
    routePath: report.routePath ?? null,
    title: report.title,
    description: report.description,
    severity: report.severity,
    status: report.status,
    category: report.category,
    intent: report.intent,
    assignedAgents: report.assignedAgents,
    reproductionSteps: report.reproductionSteps,
    expectedResult: report.expectedResult ?? null,
    actualResult: report.actualResult ?? null,
    quickResponse: report.quickResponse ?? null,
    createdById: report.createdBy?.id ?? null,
    createdByName: report.createdBy?.name ?? null,
    createdByRole: report.createdBy?.role ?? null,
    pageContext: report.pageContext ?? null,
    tags: report.tags,
    triageNotes: report.triageNotes ?? null,
    confidence: report.confidence ?? null,
    createdAt: new Date(report.createdAt),
    updatedAt: new Date(report.updatedAt),
  };
}

function mapDbBugReportToDomain(record: {
  id: string;
  source: string;
  module: string;
  routePath: string | null;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  intent: string;
  assignedAgents: unknown;
  reproductionSteps: unknown;
  expectedResult: string | null;
  actualResult: string | null;
  quickResponse: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdByRole: string | null;
  pageContext: unknown;
  tags: unknown;
  triageNotes: unknown;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
}): BugReport {
  return {
    id: record.id,
    source: record.source as BugReport["source"],
    module: record.module,
    routePath: record.routePath ?? undefined,
    title: record.title,
    description: record.description,
    severity: record.severity as BugReport["severity"],
    status: record.status as BugStatus,
    category: record.category as BugReport["category"],
    intent: record.intent as BugReport["intent"],
    assignedAgents: asStringArray(record.assignedAgents),
    reproductionSteps: asStringArray(record.reproductionSteps),
    expectedResult: record.expectedResult ?? undefined,
    actualResult: record.actualResult ?? undefined,
    quickResponse: record.quickResponse ?? undefined,
    createdBy:
      record.createdById || record.createdByName || record.createdByRole
        ? {
            id: record.createdById ?? undefined,
            name: record.createdByName ?? undefined,
            role: record.createdByRole ?? undefined,
          }
        : undefined,
    pageContext: isRecord(record.pageContext) ? ((record.pageContext as unknown) as BugReport["pageContext"]) : undefined,
    tags: asStringArray(record.tags),
    triageNotes: asOptionalStringArray(record.triageNotes),
    confidence: record.confidence ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asOptionalStringArray(value: unknown) {
  const items = asStringArray(value);
  return items.length > 0 ? items : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
