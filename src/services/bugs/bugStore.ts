import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BugReport, BugStatus } from "@/lib/bugReporting";

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

const DATA_DIR = path.join(process.cwd(), "data", "runtime");
const BUG_REPORTS_FILE = path.join(DATA_DIR, "bug-reports.json");
const DISPATCHES_FILE = path.join(DATA_DIR, "bug-dispatches.json");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureDataDir();
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureDataDir();
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function listBugReports() {
  const state = await readJsonFile<StoredBugState>(BUG_REPORTS_FILE, { reports: [] });
  return state.reports;
}

export async function saveBugReport(report: BugReport) {
  const reports = await listBugReports();
  const next = [report, ...reports.filter((item) => item.id !== report.id)].slice(0, 200);
  await writeJsonFile(BUG_REPORTS_FILE, { reports: next });
  return report;
}

export async function findBugReport(bugId: string) {
  const reports = await listBugReports();
  return reports.find((item) => item.id === bugId) || null;
}

export async function updateBugReportStatus(bugId: string, status: BugStatus, assignedAgents?: string[]) {
  const reports = await listBugReports();
  let updated: BugReport | null = null;

  const next = reports.map((item) => {
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
  await writeJsonFile(BUG_REPORTS_FILE, { reports: next });
  return updated;
}

export async function recordBugDispatch(dispatch: DispatchRecord) {
  const dispatches = await readJsonFile<DispatchRecord[]>(DISPATCHES_FILE, []);
  await writeJsonFile(DISPATCHES_FILE, [dispatch, ...dispatches].slice(0, 500));
  return dispatch;
}
