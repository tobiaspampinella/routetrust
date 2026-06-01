import { readFile } from "node:fs/promises";
import path from "node:path";
import { AdminShell } from "@/components/admin/AdminShell";
import { APP_VERSION, APP_VERSION_NOTE } from "@/lib/version";

interface ProjectAgentStatus {
  id: string;
  name: string;
  status: string;
  mode: string;
  lastRun: string | null;
  pid: number | null;
  currentTask: string | null;
  pendingTasks: number;
}

interface ProjectTaskStatus {
  id: string;
  agent: string;
  status: string;
  module: string;
  nextStep: string;
}

interface ProjectStatusPayload {
  server?: { status?: string; url?: string; detail?: string; checkedAt?: string };
  build?: { status?: string; detail?: string; lastRun?: string };
  tests?: { status?: string; lastRun?: string };
  agents?: ProjectAgentStatus[];
  tasks?: ProjectTaskStatus[];
  bugs?: Array<{ id: string; severity?: string; category?: string; title?: string; status?: string }>;
  telegram?: { status?: string; configured?: boolean; missingEnv?: string[]; lastRun?: string };
  locks?: { status?: string; inconsistencies?: string[]; active?: Array<{ file: string; owners: string[] }> };
  beta?: { status?: string; lastRun?: string };
  watchdog?: { status?: string; issues?: string[]; lastRun?: string };
  scheduler?: { status?: string; intervalMs?: number; lastRun?: string };
  lastUpdated?: string | null;
}

async function readProjectStatus(): Promise<ProjectStatusPayload> {
  const filePath = path.join(process.cwd(), "runtime", "project-status.json");
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as ProjectStatusPayload;
  } catch {
    return {};
  }
}

function statusTone(status?: string) {
  if (status === "out_of_scope" || status === "optional") {
    return "text-slate-700 bg-slate-50 border-slate-200";
  }
  if (status === "passed" || status === "healthy" || status === "completed" || status === "configured" || status === "on") {
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  }
  if (status === "blocked" || status === "failed" || status === "off" || status === "warning") {
    return "text-rose-700 bg-rose-50 border-rose-200";
  }
  return "text-amber-700 bg-amber-50 border-amber-200";
}

function telegramDetail(projectStatus: ProjectStatusPayload) {
  if (projectStatus.telegram?.status === "out_of_scope") {
    return "Optional and excluded from the local operations baseline.";
  }
  if (projectStatus.telegram?.configured) {
    return "Configured";
  }
  return (projectStatus.telegram?.missingEnv || []).join(", ") || "No telegram status yet.";
}

export default async function ProjectStatusPage() {
  const projectStatus = await readProjectStatus();
  const agents = projectStatus.agents || [];
  const tasks = projectStatus.tasks || [];
  const criticalBugs = (projectStatus.bugs || []).filter((bug) => bug.severity === "P0" || bug.severity === "P1");

  const summaryCards = [
    { label: "Server", value: projectStatus.server?.status || "unknown", detail: projectStatus.server?.detail || projectStatus.server?.url || "No server probe yet." },
    { label: "Scheduler", value: projectStatus.scheduler?.status || "stopped", detail: projectStatus.scheduler?.lastRun || "No scheduler heartbeat yet." },
    { label: "Beta Check", value: projectStatus.beta?.status || "unknown", detail: projectStatus.beta?.lastRun || "No beta-check run yet." },
    { label: "Telegram", value: projectStatus.telegram?.status || "unknown", detail: telegramDetail(projectStatus) },
    { label: "Locks", value: projectStatus.locks?.status || "unknown", detail: `${projectStatus.locks?.active?.length || 0} active locks` },
    { label: "Watchdog", value: projectStatus.watchdog?.status || "unknown", detail: `${projectStatus.watchdog?.issues?.length || 0} issues detected` },
  ];

  return (
    <AdminShell>
      <div className="space-y-6 p-5 lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">RouteTrust operational status</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Project Status</h1>
          <p className="mt-2 text-sm text-slate-600">
            RoutePulse AI {APP_VERSION} · {APP_VERSION_NOTE}
          </p>
          <p className="mt-1 text-xs text-slate-500">Last updated: {projectStatus.lastUpdated || "No runtime snapshot yet."}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className={`rounded-lg border p-5 shadow-sm ${statusTone(card.value)}`}>
              <p className="text-xs font-bold uppercase">{card.label}</p>
              <p className="mt-2 break-words text-lg font-semibold">{card.value}</p>
              <p className="mt-3 text-sm">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">Agents</h2>
              <span className="text-xs font-semibold uppercase text-slate-500">{agents.length} tracked</span>
            </div>
            <div className="mt-4 space-y-3">
              {agents.length === 0 ? (
                <p className="text-sm text-slate-500">No runtime agents recorded yet.</p>
              ) : (
                agents.map((agent) => (
                  <div key={agent.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{agent.name}</p>
                        <p className="text-xs uppercase text-slate-500">{agent.id}</p>
                      </div>
                      <div className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusTone(agent.status)}`}>
                        {agent.status} / {agent.mode}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                      <p>Last run: {agent.lastRun || "never"}</p>
                      <p>Pending tasks: {agent.pendingTasks}</p>
                      <p>PID: {agent.pid || "none"}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Current task: {agent.currentTask || "none"}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Immediate risks</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {(projectStatus.watchdog?.issues || []).length === 0 ? (
                <p>No watchdog issues recorded.</p>
              ) : (
                (projectStatus.watchdog?.issues || []).map((issue) => (
                  <div key={issue} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    {issue}
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">Critical bugs</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{criticalBugs.length}</p>
              <p className="mt-1 text-xs text-slate-500">P0/P1 reports routed through local runtime.</p>
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Active tasks</h2>
            <div className="mt-4 space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No tracked tasks in runtime/project-status.json.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{task.id}</p>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusTone(task.status)}`}>{task.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{task.agent}</p>
                    <p className="mt-1 text-sm text-slate-600">{task.module}</p>
                    <p className="mt-2 text-sm text-slate-500">{task.nextStep}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Bugs and locks</h2>
            <div className="mt-4 space-y-3">
              {(projectStatus.bugs || []).slice(0, 5).map((bug) => (
                <div key={bug.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{bug.title || bug.id}</p>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusTone(bug.severity)}`}>{bug.severity || "n/a"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{bug.category || "Uncategorized"}</p>
                  <p className="mt-1 text-xs text-slate-500">{bug.status || "unknown"}</p>
                </div>
              ))}
              {(projectStatus.bugs || []).length === 0 && <p className="text-sm text-slate-500">No bug reports stored yet.</p>}

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Lock inconsistencies</p>
                {(projectStatus.locks?.inconsistencies || []).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">No lock inconsistencies recorded.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm text-slate-600">
                    {(projectStatus.locks?.inconsistencies || []).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
