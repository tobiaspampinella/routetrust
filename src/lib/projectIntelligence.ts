export type BetaModuleStatus = "implemented" | "partial" | "pending" | "excluded";

export interface BetaModuleStatusItem {
  name: string;
  status: BetaModuleStatus;
  owner?: string;
}

export interface ProjectIntelligenceInput {
  appVersion: string;
  buildStatus: "ready" | "warning" | "blocked";
  modules: BetaModuleStatusItem[];
  risks: string[];
}

export interface ProjectIntelligenceReport extends ProjectIntelligenceInput {
  generatedAt: string;
  implementedModules: number;
  partialModules: number;
  pendingModules: number;
  excludedModules: number;
}

export const betaCoreModules: BetaModuleStatusItem[] = [
  { name: "CMS/Admin CEO overview", status: "implemented", owner: "Codex Node" },
  { name: "Demo Sandbox", status: "implemented", owner: "Full Stack Agent" },
  { name: "Route Simulation Engine", status: "implemented", owner: "Full Stack Agent" },
  { name: "Driver Portal basic", status: "implemented", owner: "UX/UI Agent" },
  { name: "Customer Tracking basic", status: "implemented", owner: "UX/UI Agent" },
  { name: "Human Approval Center", status: "partial", owner: "Full Stack Agent" },
  { name: "Incident Management basic", status: "implemented", owner: "QA Agent" },
  { name: "Audit Logs basic", status: "partial", owner: "Full Stack Agent" },
  { name: "Telegram Project Intelligence Bot", status: "implemented", owner: "Telegram Agent" },
  { name: "Bug Reporting Assistant basic", status: "implemented", owner: "Bug Assistant Agent" },
  { name: "MapLibre fallback / mock map", status: "implemented", owner: "Maps Agent" },
  { name: "Billing", status: "excluded", owner: "Codex Node" },
  { name: "White-label avanzado", status: "excluded", owner: "Codex Node" },
  { name: "Google Maps 3D obligatorio", status: "excluded", owner: "Maps Agent" },
  { name: "Apple Maps obligatorio", status: "excluded", owner: "Maps Agent" },
  { name: "IA predictiva", status: "excluded", owner: "Codex Node" },
  { name: "Analytics complejos", status: "excluded", owner: "Codex Node" },
  { name: "Microservicios", status: "excluded", owner: "Codex Node" },
];

export function buildProjectIntelligenceReport(input: ProjectIntelligenceInput, now = new Date()): ProjectIntelligenceReport {
  return {
    ...input,
    generatedAt: now.toISOString(),
    implementedModules: input.modules.filter((module) => module.status === "implemented").length,
    partialModules: input.modules.filter((module) => module.status === "partial").length,
    pendingModules: input.modules.filter((module) => module.status === "pending").length,
    excludedModules: input.modules.filter((module) => module.status === "excluded").length,
  };
}

export function renderProjectIntelligenceMessage(report: ProjectIntelligenceReport) {
  const activeModules = report.modules
    .filter((module) => module.status === "implemented" || module.status === "partial")
    .map((module) => `${module.name}: ${module.status}`)
    .join("\n");
  const risks = report.risks.length ? report.risks.map((risk) => `- ${risk}`).join("\n") : "- No critical runtime risk reported.";

  return [
    `RoutePulse AI ${report.appVersion}`,
    `Build status: ${report.buildStatus}`,
    `Core: ${report.implementedModules} implemented, ${report.partialModules} partial, ${report.pendingModules} pending`,
    "Modules:",
    activeModules,
    "Risks:",
    risks,
  ].join("\n");
}
