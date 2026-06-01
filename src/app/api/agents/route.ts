import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCriticalSiteAgents } from "@/lib/agentRegistry";

interface RuntimeStatus {
  agents?: Array<{
    id: string;
    status?: string;
    mode?: string;
    currentTask?: string | null;
    pendingTasks?: number;
    lastRun?: string;
  }>;
}

async function readRuntimeStatus(): Promise<RuntimeStatus> {
  const filePath = path.join(process.cwd(), "runtime", "project-status.json");
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as RuntimeStatus;
  } catch {
    return {};
  }
}

export async function GET() {
  const runtime = await readRuntimeStatus();
  const runtimeAgents = new Map((runtime.agents || []).map((agent) => [agent.id, agent]));
  const agents = getCriticalSiteAgents().map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    branch: agent.branch,
    module: agent.module,
    status: runtimeAgents.get(agent.id)?.status || "unknown",
    mode: runtimeAgents.get(agent.id)?.mode || "documented",
    currentTask: runtimeAgents.get(agent.id)?.currentTask || null,
    pendingTasks: runtimeAgents.get(agent.id)?.pendingTasks || 0,
    lastRun: runtimeAgents.get(agent.id)?.lastRun || null,
  }));

  return NextResponse.json({ agents });
}
