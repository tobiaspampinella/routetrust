export type BugSource = "admin" | "driver" | "customer" | "qa" | "system";
export type BugSeverity = "P0" | "P1" | "P2" | "P3";
export type BugStatus = "new" | "triaged" | "assigned" | "in_progress" | "fixed" | "rejected";
export type BugCategory = "bug" | "ux" | "qa" | "security" | "performance" | "integration" | "support";
export type AssistantIntent =
  | "bug_report"
  | "ux_review"
  | "qa_validation"
  | "security_review"
  | "operational_status"
  | "support_request";

export interface PageContext {
  pathname: string;
  pageKey: string;
  pageLabel: string;
  module: string;
  source: BugSource;
  summary: string;
}

export interface BugReportInput {
  source: BugSource;
  module: string;
  description: string;
  routePath?: string;
  severity?: BugSeverity;
  title?: string;
  category?: BugCategory;
  intent?: AssistantIntent;
  pageContext?: PageContext;
  assignedAgents?: string[];
  reproductionSteps?: string[];
  expectedResult?: string;
  actualResult?: string;
  quickResponse?: string;
  createdBy?: {
    id?: string;
    name?: string;
    role?: string;
  };
  triageNotes?: string[];
  confidence?: number;
}

export interface BugReport {
  id: string;
  source: BugSource;
  module: string;
  routePath?: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  category: BugCategory;
  intent: AssistantIntent;
  createdAt: string;
  updatedAt: string;
  assignedAgents: string[];
  reproductionSteps: string[];
  expectedResult?: string;
  actualResult?: string;
  quickResponse?: string;
  createdBy?: {
    id?: string;
    name?: string;
    role?: string;
  };
  pageContext?: PageContext;
  tags: string[];
  triageNotes?: string[];
  confidence?: number;
}

export interface BugRouting {
  primaryAgent: string;
  collaboratingAgents: string[];
  notifyTelegram: boolean;
  nextStep: string;
  severityLabel: string;
  escalationLane: "security" | "qa" | "ux" | "engineering" | "support";
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function inferSeverity(description: string, category?: BugCategory, explicit?: BugSeverity): BugSeverity {
  if (explicit) return explicit;
  const normalized = description.toLowerCase();

  if (
    category === "security" ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("xss") ||
    normalized.includes("sql") ||
    normalized.includes("csrf") ||
    normalized.includes("credential")
  ) {
    return "P0";
  }

  if (
    normalized.includes("cannot login") ||
    normalized.includes("no puedo entrar") ||
    normalized.includes("crash") ||
    normalized.includes("caido") ||
    normalized.includes("caida") ||
    normalized.includes("blank screen") ||
    normalized.includes("500") ||
    normalized.includes("bloquea")
  ) {
    return "P1";
  }

  if (
    category === "ux" ||
    category === "qa" ||
    normalized.includes("wrong") ||
    normalized.includes("no funciona") ||
    normalized.includes("error") ||
    normalized.includes("bug")
  ) {
    return "P2";
  }

  return "P3";
}

function defaultTitle(module: string, description: string, category: BugCategory) {
  const cleanModule = module.trim() || "general";
  const summary = description.trim().replace(/\s+/g, " ").slice(0, 72);
  return `[${category.toUpperCase()}] ${cleanModule}: ${summary}`;
}

function defaultIntent(category: BugCategory): AssistantIntent {
  if (category === "ux") return "ux_review";
  if (category === "qa") return "qa_validation";
  if (category === "security") return "security_review";
  if (category === "support") return "support_request";
  return "bug_report";
}

function inferAssignedAgents(moduleName: string, category: BugCategory, intent: AssistantIntent) {
  const agents = ["Bug Triage Agent"];
  const normalized = moduleName.toLowerCase();

  if (category === "security" || intent === "security_review") agents.push("Local Website Assistant Agent", "Cybersecurity Validation Agent", "QA Validation Agent");
  if (category === "ux" || intent === "ux_review") agents.push("UX Agent", "QA Validation Agent");
  if (category === "qa" || intent === "qa_validation") agents.push("QA Validation Agent");
  if (normalized.includes("cms") || normalized.includes("admin") || normalized.includes("backend") || normalized.includes("auth") || normalized.includes("bug")) {
    agents.push("Full Stack Bug Fix Agent");
  }
  if (normalized.includes("driver") || normalized.includes("customer") || normalized.includes("track")) agents.push("UX Agent", "Full Stack Bug Fix Agent");
  if (normalized.includes("map")) agents.push("Full Stack Bug Fix Agent", "QA Validation Agent");
  if (normalized.includes("telegram")) agents.push("Full Stack Bug Fix Agent");
  if (intent === "support_request" || intent === "operational_status") agents.push("Local Website Assistant Agent");
  if (agents.length === 1) agents.push("Full Stack Bug Fix Agent");

  return unique(agents);
}

export function createBugReport(input: BugReportInput, now = new Date()): BugReport {
  const description = input.description.trim();
  const moduleName = input.module.trim().toLowerCase() || "general";
  const category = input.category ?? "bug";
  const intent = input.intent ?? defaultIntent(category);
  const assignedAgents = unique(input.assignedAgents ?? inferAssignedAgents(moduleName, category, intent));
  const createdAt = now.toISOString();

  return {
    id: `bug-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    source: input.source,
    module: moduleName,
    routePath: input.routePath,
    title: input.title?.trim() || defaultTitle(moduleName, description, category),
    description,
    severity: inferSeverity(description, category, input.severity),
    status: "new",
    category,
    intent,
    createdAt,
    updatedAt: createdAt,
    assignedAgents,
    reproductionSteps:
      input.reproductionSteps && input.reproductionSteps.length > 0
        ? input.reproductionSteps.map((step) => step.trim()).filter(Boolean)
        : [`Open ${input.routePath || moduleName}.`, `Trigger the reported behavior.`, `Compare actual result against expected flow.`],
    expectedResult: input.expectedResult,
    actualResult: input.actualResult ?? description,
    quickResponse: input.quickResponse,
    createdBy: input.createdBy,
    pageContext: input.pageContext,
    tags: unique([category, intent, moduleName, input.source, input.pageContext?.pageKey || "unknown-page"]),
    triageNotes: input.triageNotes,
    confidence: input.confidence,
  };
}

export function routeBugReport(report: BugReport): BugRouting {
  const [primaryAgent, ...collaboratingAgents] = report.assignedAgents;
  const primary = primaryAgent || "Bug Triage Agent";
  const escalationLane =
    report.category === "security"
      ? "security"
      : report.category === "qa"
        ? "qa"
        : report.category === "ux"
          ? "ux"
          : report.category === "support"
            ? "support"
            : "engineering";

  return {
    primaryAgent: primary,
    collaboratingAgents,
    notifyTelegram: report.severity === "P0" || report.severity === "P1",
    nextStep:
      report.category === "security"
        ? "Freeze risky behavior, validate exposure, and reproduce with QA before any broader rollout."
        : report.category === "ux"
          ? "Validate the user journey, capture repro steps, and assign an implementation owner."
          : report.category === "qa"
            ? "Reproduce the issue, confirm regression scope, and then assign implementation."
            : "Reproduce the issue, confirm severity, and move implementation to the owning agent.",
    severityLabel:
      report.severity === "P0"
        ? "Critical"
        : report.severity === "P1"
          ? "High"
          : report.severity === "P2"
            ? "Medium"
            : "Low",
    escalationLane,
  };
}
