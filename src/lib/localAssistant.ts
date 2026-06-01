import { getCriticalSiteAgents } from "@/lib/agentRegistry";
import type { AssistantIntent, BugCategory, BugSeverity, BugSource, PageContext } from "@/lib/bugReporting";

export interface AssistantInput {
  message: string;
  pathname: string;
  userRole?: string | null;
}

export interface AssistantDecision {
  intent: AssistantIntent;
  category: BugCategory;
  severity: BugSeverity;
  module: string;
  source: BugSource;
  title: string;
  summary: string;
  quickResponse: string;
  assignedAgents: string[];
  primaryAgent: string;
  pageContext: PageContext;
  shouldCreateTicket: boolean;
  confidence: number;
  matchedSignals: string[];
  triageNotes: string[];
  reproductionSteps: string[];
  expectedResult: string;
  actualResult: string;
}

const SITE_AGENT_BY_NAME = Object.fromEntries(getCriticalSiteAgents().map((agent) => [agent.name, agent.name]));

const PAGE_CONTEXTS: Array<{
  test: RegExp;
  pageKey: string;
  pageLabel: string;
  module: string;
  source: BugSource;
  summary: string;
  expectedFlow: string;
}> = [
  {
    test: /^\/admin\/bug-reports/,
    pageKey: "admin-bug-reports",
    pageLabel: "Admin Bug Reports",
    module: "bugs",
    source: "admin",
    summary: "Bug queue, severity, owners, and triage visibility.",
    expectedFlow: "show actionable bug cards with severity, owner, status, and route context",
  },
  {
    test: /^\/admin\/project-status/,
    pageKey: "admin-project-status",
    pageLabel: "Project Status",
    module: "operations",
    source: "admin",
    summary: "Runtime health, scheduler state, and agent supervision.",
    expectedFlow: "surface agent state, queue status, and runtime health without stale data",
  },
  {
    test: /^\/admin\/settings/,
    pageKey: "admin-settings",
    pageLabel: "Admin Settings",
    module: "cms",
    source: "admin",
    summary: "Configuration and policy controls.",
    expectedFlow: "save and present settings clearly with permission-safe controls",
  },
  {
    test: /^\/admin\/cms/,
    pageKey: "admin-cms",
    pageLabel: "Admin CMS",
    module: "cms",
    source: "admin",
    summary: "CMS editing and enterprise content controls.",
    expectedFlow: "edit enterprise content, approvals, and copy without data loss",
  },
  {
    test: /^\/admin/,
    pageKey: "admin-dashboard",
    pageLabel: "Admin Dashboard",
    module: "admin",
    source: "admin",
    summary: "Operations dashboard, KPIs, incidents, and agent coordination.",
    expectedFlow: "display operational state, KPIs, incidents, and recent queue activity",
  },
  {
    test: /^\/driver\/route/,
    pageKey: "driver-route",
    pageLabel: "Driver Route",
    module: "driver",
    source: "driver",
    summary: "Driver execution flow, stop handling, and route progression.",
    expectedFlow: "let the driver progress stops, mark delivery state, and trust ETA cues",
  },
  {
    test: /^\/driver/,
    pageKey: "driver-home",
    pageLabel: "Driver Home",
    module: "driver",
    source: "driver",
    summary: "Driver overview and assigned route status.",
    expectedFlow: "show the current route, next actions, and vehicle status clearly",
  },
  {
    test: /^\/track\/demo/,
    pageKey: "customer-tracking-demo",
    pageLabel: "Customer Tracking Demo",
    module: "tracking",
    source: "customer",
    summary: "Customer-facing tracking demo and ETA visibility.",
    expectedFlow: "show ETA, route status, and map/tracking confidence without operator context",
  },
  {
    test: /^\/login/,
    pageKey: "login",
    pageLabel: "Login",
    module: "auth",
    source: "system",
    summary: "Authentication and session access.",
    expectedFlow: "authenticate safely and redirect the user to the correct protected area",
  },
  {
    test: /^\//,
    pageKey: "landing",
    pageLabel: "Landing Page",
    module: "marketing",
    source: "system",
    summary: "Public product positioning and navigation.",
    expectedFlow: "explain the product, route users correctly, and preserve trust",
  },
];

const SIGNAL_GROUPS: Record<BugCategory | "operational" | "noise", Array<{ label: string; test: RegExp }>> = {
  bug: [
    { label: "bug", test: /\bbug\b|falla|falla|rompe|broken|not working|no funciona|mal\b|incorrect|issue/ },
    { label: "ui-break", test: /boton|button|click|layout|pantalla|screen|render|widget|chatbot/ },
  ],
  ux: [
    { label: "ux", test: /\bux\b|confuso|confusa|friccion|flujo|navegacion|copy|texto|label|onboarding|usabilidad/ },
    { label: "clarity", test: /no entiendo|where|donde|ambiguo|ambigua|claridad/ },
  ],
  qa: [
    { label: "qa", test: /\bqa\b|valida|validation|regresion|regression|cobertura|smoke|test case|reproduc/ },
    { label: "verification", test: /confirmar|confirm|pasos|steps|escenario/ },
  ],
  security: [
    { label: "security", test: /security|seguridad|xss|csrf|sql|sqli|token|secret|credential|cookie|session|auth bypass|exposed/ },
    { label: "abuse", test: /permission|rbac|unauthorized|forbidden|elevat|leak|inject/ },
  ],
  performance: [
    { label: "performance", test: /slow|lento|latencia|lag|timeout|performance|freeze|congel/ },
  ],
  integration: [
    { label: "integration", test: /telegram|api|webhook|sync|integracion|integration|maps|mapa|provider|fetch/ },
  ],
  support: [
    { label: "support", test: /ayuda|help|como|how|donde|where|que hace|what does|guia|guide/ },
  ],
  operational: [
    { label: "ops", test: /estado|status|resumen|summary|kpi|eta|ruta|route|trafico|traffic|recalcular/ },
  ],
  noise: [
    { label: "noise", test: /^(hola|hi|hello|test|testing|ok|okei|ping)$/ },
  ],
};

const SECURITY_MODULES = new Set(["auth", "cms", "admin"]);

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

export function buildPageContext(pathname: string): PageContext {
  const matched = PAGE_CONTEXTS.find((item) => item.test.test(pathname)) || PAGE_CONTEXTS[PAGE_CONTEXTS.length - 1];
  return {
    pathname,
    pageKey: matched.pageKey,
    pageLabel: matched.pageLabel,
    module: matched.module,
    source: matched.source,
    summary: matched.summary,
  };
}

function getPageExpectedFlow(pathname: string) {
  return (PAGE_CONTEXTS.find((item) => item.test.test(pathname)) || PAGE_CONTEXTS[PAGE_CONTEXTS.length - 1]).expectedFlow;
}

function normalizeMessage(message: string) {
  return message.trim().toLowerCase().replace(/\s+/g, " ");
}

function collectSignals(text: string) {
  const matchedSignals: string[] = [];
  const scores: Record<string, number> = {
    bug: 0,
    ux: 0,
    qa: 0,
    security: 0,
    performance: 0,
    integration: 0,
    support: 0,
    operational: 0,
    noise: 0,
  };

  for (const [group, tests] of Object.entries(SIGNAL_GROUPS)) {
    for (const item of tests) {
      if (!item.test.test(text)) continue;
      matchedSignals.push(item.label);
      scores[group] += group === "security" ? 4 : group === "qa" || group === "ux" ? 3 : 2;
    }
  }

  return { matchedSignals, scores };
}

function inferCategory(text: string, pageContext: PageContext, scores: Record<string, number>): BugCategory {
  if (scores.security > 0) return "security";
  if (scores.ux >= 3 && scores.qa < scores.ux) return "ux";
  if (scores.qa >= 3) return "qa";
  if (scores.performance > 0) return "performance";
  if (scores.integration > 0) return "integration";
  if (scores.support > 0 && scores.bug === 0 && scores.security === 0 && scores.qa === 0) return "support";
  if (pageContext.module === "marketing" && scores.operational === 0 && scores.bug === 0) return "support";
  return "bug";
}

function inferIntent(text: string, category: BugCategory, scores: Record<string, number>): AssistantIntent {
  if (scores.operational > 0 && category === "support") return "operational_status";
  if (category === "security") return "security_review";
  if (category === "ux") return "ux_review";
  if (category === "qa") return "qa_validation";
  if (category === "support") return scores.operational > 0 ? "operational_status" : "support_request";
  if (text.includes("review") && category === "bug") return "qa_validation";
  return "bug_report";
}

function inferModule(text: string, pageContext: PageContext) {
  if (/login|auth|sesion|session|password|rbac|permission/.test(text)) return "auth";
  if (/telegram|bot|webhook/.test(text)) return "telegram";
  if (/mapa|map|tracking|eta/.test(text)) return "tracking";
  if (/cms|content/.test(text)) return "cms";
  if (/driver|ruta|stop|delivery|entrega/.test(text)) return "driver";
  if (/queue|triage|ticket|bug report/.test(text)) return "bugs";
  if (/security|xss|csrf|token|secret/.test(text)) return "security";
  return pageContext.module;
}

function inferSeverity(text: string, category: BugCategory, pageContext: PageContext, userRole?: string | null): BugSeverity {
  if (
    category === "security" ||
    /xss|csrf|secret|token|credential|sql|auth bypass|session leak|session exposed|privilege/.test(text)
  ) {
    return "P0";
  }

  if (
    /cannot login|no puedo entrar|crash|blank screen|white screen|500|bloquea|caido|caida|denied|forbidden|stuck/.test(text)
  ) {
    return "P1";
  }

  if (
    /wrong|incorrect|fails|error|bug|broken|confuso|lento|slow|regression|inconsistent/.test(text) ||
    (pageContext.module === "driver" && userRole === "driver")
  ) {
    return "P2";
  }

  return "P3";
}

function inferAssignedAgents(moduleName: string, category: BugCategory, intent: AssistantIntent, pageContext: PageContext) {
  const agents = [
    SITE_AGENT_BY_NAME["Bug Triage Agent"],
    SITE_AGENT_BY_NAME["Local Website Assistant Agent"],
  ];

  if (category === "security") {
    agents.push(
      SITE_AGENT_BY_NAME["Cybersecurity Validation Agent"],
      SITE_AGENT_BY_NAME["QA Validation Agent"],
      SITE_AGENT_BY_NAME["Full Stack Bug Fix Agent"],
    );
  } else {
    if (category === "ux" || pageContext.module === "tracking" || pageContext.module === "driver") {
      agents.push(SITE_AGENT_BY_NAME["UX Agent"]);
    }
    if (category === "qa" || intent === "qa_validation" || category === "performance") {
      agents.push(SITE_AGENT_BY_NAME["QA Validation Agent"]);
    }
    if (moduleName !== "marketing" || category !== "support") {
      agents.push(SITE_AGENT_BY_NAME["Full Stack Bug Fix Agent"]);
    }
  }

  if (moduleName === "auth" || SECURITY_MODULES.has(pageContext.module)) {
    agents.push(SITE_AGENT_BY_NAME["Full Stack Bug Fix Agent"]);
  }

  return unique(agents);
}

function buildSummary(intent: AssistantIntent, category: BugCategory, pageContext: PageContext, severity: BugSeverity) {
  if (intent === "operational_status") return `Operational guidance request from ${pageContext.pageLabel}.`;
  if (category === "security") return `Security-sensitive report on ${pageContext.pageLabel} classified as ${severity}.`;
  if (category === "ux") return `UX friction on ${pageContext.pageLabel} classified as ${severity}.`;
  if (category === "qa") return `Validation report on ${pageContext.pageLabel} classified as ${severity}.`;
  if (category === "support") return `Contextual support request on ${pageContext.pageLabel}.`;
  return `Bug intake on ${pageContext.pageLabel} classified as ${severity}.`;
}

function buildQuickResponse(
  pageContext: PageContext,
  category: BugCategory,
  severity: BugSeverity,
  primaryAgent: string,
  shouldCreateTicket: boolean,
) {
  if (!shouldCreateTicket) {
    return `${pageContext.pageLabel}: contextual guidance only. This message does not justify a durable ticket yet.`;
  }

  if (category === "security") {
    return `${pageContext.pageLabel}: security exposure suspected. Severity ${severity}. Primary owner ${primaryAgent}. Containment and validation take priority over normal bug fixing.`;
  }

  return `${pageContext.pageLabel}: ${category} intake accepted as ${severity}. Primary owner ${primaryAgent}. The ticket includes page context, expected behavior, and routing evidence.`;
}

function buildExpectedResult(pathname: string, pageContext: PageContext) {
  return `${pageContext.pageLabel} should ${getPageExpectedFlow(pathname)}.`;
}

function buildTriageNotes(
  category: BugCategory,
  moduleName: string,
  pageContext: PageContext,
  severity: BugSeverity,
  matchedSignals: string[],
) {
  const notes = [
    `Page context: ${pageContext.pageLabel}.`,
    `Module owner area: ${moduleName}.`,
    `Detected severity baseline: ${severity}.`,
  ];

  if (matchedSignals.length > 0) {
    notes.push(`Signals: ${matchedSignals.join(", ")}.`);
  }

  if (category === "security") notes.push("Do not treat as normal UX/support noise before exposure review.");
  if (category === "ux") notes.push("Validate the journey before implementing a cosmetic patch.");
  if (category === "qa") notes.push("Reproduce before assigning implementation blame.");

  return notes;
}

export function classifyAssistantRequest(input: AssistantInput): AssistantDecision {
  const pageContext = buildPageContext(input.pathname);
  const normalized = normalizeMessage(input.message);
  const { matchedSignals, scores } = collectSignals(normalized);
  const source = pageContext.source;
  const category = inferCategory(normalized, pageContext, scores);
  const intent = inferIntent(normalized, category, scores);
  const moduleName = inferModule(normalized, pageContext);
  const severity = inferSeverity(normalized, category, pageContext, input.userRole);
  const assignedAgents = inferAssignedAgents(moduleName, category, intent, pageContext);
  const primaryAgent = assignedAgents[0] || "Bug Triage Agent";
  const looksLikeNoise = scores.noise > 0 && matchedSignals.length <= 1;
  const supportOnly = category === "support" && intent !== "operational_status";
  const actionableBugSignal = scores.bug > 0 || scores.qa > 0 || scores.security > 0 || scores.performance > 0 || scores.integration > 0;
  const shouldCreateTicket = !looksLikeNoise && !supportOnly && (actionableBugSignal || category === "ux" || severity !== "P3");
  const confidence = Math.min(0.99, 0.45 + matchedSignals.length * 0.08 + (shouldCreateTicket ? 0.15 : 0));
  const actualResult = input.message.trim().replace(/\s+/g, " ");
  const title = `[${severity}] ${pageContext.pageLabel} - ${moduleName} ${category}`;

  return {
    intent,
    category,
    severity,
    module: moduleName,
    source,
    title,
    summary: buildSummary(intent, category, pageContext, severity),
    quickResponse: buildQuickResponse(pageContext, category, severity, primaryAgent, shouldCreateTicket),
    assignedAgents,
    primaryAgent,
    pageContext,
    shouldCreateTicket,
    confidence,
    matchedSignals,
    triageNotes: buildTriageNotes(category, moduleName, pageContext, severity, matchedSignals),
    reproductionSteps: [
      `Open ${pageContext.pathname}.`,
      `Execute the ${pageContext.pageLabel} flow related to ${moduleName}.`,
      `Compare actual behavior against the expected flow for ${pageContext.pageLabel}.`,
    ],
    expectedResult: buildExpectedResult(input.pathname, pageContext),
    actualResult,
  };
}
