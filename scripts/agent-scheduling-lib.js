#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const {
  appendAgentLog,
  executionEnv,
  nowIso,
  parseActiveTasks,
  readProjectStatus,
  readText,
  writeText,
} = require("./agent-runtime-lib.js");

const ROOT = path.resolve(__dirname, "..");
const RUNTIME_DIR = path.join(ROOT, "runtime");
const REPORT_DIR = path.join(RUNTIME_DIR, "reports");
const DOC_REPORT_DIR = path.join(ROOT, "docs", "agent-reports");
const SCHEDULE_FILE = path.join(RUNTIME_DIR, "agent-schedule.json");
const BUDGET_FILE = path.join(RUNTIME_DIR, "agent-budget.json");
const LAST_RUN_FILE = path.join(RUNTIME_DIR, "agent-last-run.json");
const GENERATED_CHANGE_PREFIXES = [
  "runtime/heartbeats/",
  "runtime/logs/",
  "runtime/reports/",
  "docs/agent-reports/",
];
const GENERATED_CHANGE_FILES = new Set([
  "runtime/agent-budget.json",
  "runtime/agent-last-run.json",
  "runtime/project-status.json",
  "runtime/watchdog-state.json",
  "docs/AGENT_RUNTIME_STATUS.md",
  "docs/DAILY_CONTROL_REPORT.md",
  "docs/NEXT_AGENT_PROMPT.md",
  "NEXT_AGENT_PROMPT.md",
]);
const SHARED_SIGNAL_FILES = [
  "docs/ACTIVE_TASKS.md",
  "package.json",
  "package-lock.json",
  "config/routeTrustAgents.json",
  "data/runtime/bug-reports.json",
];

const PRIORITY_ORDER = ["P0", "P1", "P2", "NONE"];
const SKIP_STATUSES = new Set([
  "SKIPPED_NO_CHANGES",
  "SKIPPED_COOLDOWN",
  "SKIPPED_NO_TASKS",
  "SKIPPED_BLOCKED",
  "SKIPPED_MANUAL_REQUIRED",
]);

const DEFAULT_SCHEDULE = {
  generatedAt: "2026-06-01T00:00:00.000Z",
  scheduler: {
    tickMinutes: 30,
    watchdogMinutes: 30,
    dailySummaryHourLocal: 7,
  },
  agents: {
    "codex-node": {
      intervalMinutes: 120,
      cooldownMinutes: 90,
      priorityOverride: ["P0", "P1"],
      script: "agents:report",
      aliases: ["codex node", "principal project orchestrator"],
      reportKey: "codex-node",
      agentDir: "codex-node",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["docs/", "runtime/", "scripts/", "package.json", "package-lock.json"],
      allowedPaths: ["docs/", "runtime/", "scripts/"],
      forbiddenPaths: ["src/", "prisma/"],
    },
    "devops-automation-agent": {
      intervalMinutes: 240,
      cooldownMinutes: 180,
      priorityOverride: ["P0", "P1"],
      script: "ops:doctor",
      aliases: ["devops", "operational auditor", "operational risk auditor"],
      reportKey: "devops-automation-agent",
      agentDir: "devops-automation-agent",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["docs/", "runtime/", "scripts/", ".github/", "package.json", "package-lock.json"],
      allowedPaths: ["docs/", "runtime/", "scripts/", ".github/"],
      forbiddenPaths: ["src/"],
    },
    "qa-analyst-agent": {
      intervalMinutes: 360,
      cooldownMinutes: 240,
      priorityOverride: ["P0", "P1"],
      script: "qa:smoke",
      aliases: ["qa agent", "qa director", "qa analyst"],
      reportKey: "qa-analyst-agent",
      agentDir: "qa-analyst-agent",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["docs/", "tests/", "runtime/", "scripts/qa-", "scripts/beta-check"],
      allowedPaths: ["docs/", "tests/", "runtime/"],
      forbiddenPaths: ["src/"],
    },
    "web-tester-agent": {
      intervalMinutes: 720,
      cooldownMinutes: 480,
      priorityOverride: ["P0"],
      script: "tester:browser",
      aliases: ["web tester", "browser smoke tester", "qa-web-tester-agent"],
      reportKey: "web-tester-agent",
      agentDir: "web-tester-agent",
      fixedHoursLocal: [10, 22],
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["tests/", "playwright.config.ts", "docs/design/", "runtime/", "scripts/tester-browser", "scripts/qa-smoke-runtime.js"],
      allowedPaths: ["docs/", "tests/", "runtime/", "playwright-report/"],
      forbiddenPaths: ["src/"],
    },
    "backend-developer-agent": {
      intervalMinutes: 480,
      cooldownMinutes: 360,
      runOnlyWithAssignedTasks: true,
      priorityOverride: ["P0", "P1"],
      script: "backend:audit",
      aliases: ["backend developer", "full stack agent", "full stack debug agent", "full stack bug fix agent"],
      reportKey: "backend-developer-agent",
      agentDir: "backend-developer-agent",
      auditOnly: false,
      canModifyCode: true,
      watchPaths: ["src/app/api/", "src/services/", "src/lib/", "prisma/", "docs/", "scripts/backend-audit"],
      allowedPaths: ["src/app/api/", "src/services/", "src/lib/", "prisma/", "docs/", "runtime/"],
      forbiddenPaths: ["src/components/", "src/app/globals.css"],
    },
    "frontend-developer-agent": {
      intervalMinutes: 480,
      cooldownMinutes: 360,
      runOnlyWithAssignedTasks: true,
      priorityOverride: ["P0", "P1"],
      script: "frontend:audit",
      aliases: ["frontend developer", "ux/ui agent", "demo engineer", "local website assistant agent", "fullstack-developer-agent"],
      reportKey: "frontend-developer-agent",
      agentDir: "frontend-developer-agent",
      auditOnly: false,
      canModifyCode: true,
      watchPaths: ["src/app/", "src/components/", "docs/design/", "docs/product/", "scripts/frontend-audit"],
      allowedPaths: ["src/app/", "src/components/", "docs/", "runtime/"],
      forbiddenPaths: ["prisma/", "src/app/api/"],
    },
    "ui-ux-product-designer-agent": {
      intervalMinutes: 1440,
      cooldownMinutes: 1200,
      priorityOverride: ["P1"],
      script: "ux:audit",
      aliases: ["ux/ui agent", "ux lead", "ux agent"],
      reportKey: "ui-ux-product-designer-agent",
      agentDir: "ui-ux-product-designer-agent",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["src/app/", "src/components/", "docs/design/", "docs/product/", "scripts/ux-audit"],
      allowedPaths: ["docs/", "src/app/", "src/components/"],
      forbiddenPaths: ["src/app/api/", "prisma/"],
    },
    "cybersecurity-engineer-agent": {
      intervalMinutes: 1440,
      cooldownMinutes: 1200,
      priorityOverride: ["P0", "P1"],
      script: "security:audit",
      aliases: ["cybersecurity", "cybersecurity validation agent", "qa security agent"],
      reportKey: "cybersecurity-engineer-agent",
      agentDir: "cybersecurity-engineer-agent",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["src/app/api/", "src/lib/", "src/services/", ".env.example", "docs/SECURITY", "docs/SECURITY_AUDIT", "scripts/security-audit", "scripts/qa-security"],
      allowedPaths: ["docs/", "src/app/api/", "src/lib/", "src/services/", ".env.example"],
      forbiddenPaths: ["src/components/"],
    },
    "maps-tracking-agent": {
      intervalMinutes: 1440,
      cooldownMinutes: 1200,
      priorityOverride: ["P1"],
      script: "maps:audit",
      aliases: ["maps agent", "maps and tracking engineer", "maps tracking"],
      reportKey: "maps-tracking-agent",
      agentDir: "maps-tracking-agent",
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["src/components/customer/", "src/lib/", "docs/", "scripts/maps-audit"],
      allowedPaths: ["docs/", "src/components/customer/", "src/lib/"],
      forbiddenPaths: ["src/app/api/auth/"],
    },
    "product-gtm-agent": {
      intervalMinutes: 4320,
      cooldownMinutes: 4320,
      priorityOverride: [],
      script: "gtm:brief",
      aliases: ["product gtm", "gtm", "docs agent"],
      reportKey: "product-gtm-agent",
      agentDir: "product-gtm-agent",
      fixedWeekdaysLocal: [2, 5],
      auditOnly: true,
      canModifyCode: false,
      watchPaths: ["README.md", "docs/product/", "docs/GITHUB_REPO_PRESENTATION", "src/components/shared/"],
      allowedPaths: ["docs/", "README.md", "src/components/shared/"],
      forbiddenPaths: ["src/app/api/", "prisma/"],
    },
  },
};

const DEFAULT_BUDGET = {
  generatedAt: "2026-06-01T00:00:00.000Z",
  policy: {
    objective: "No ejecutar agentes sin cambio relevante o señal operativa real.",
    p0BreaksCooldown: true,
    p1ShortensCooldown: true,
    p2RespectsFullCooldown: true,
  },
  agents: {
    "codex-node": { estimatedTokensPerRun: 900, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "devops-automation-agent": { estimatedTokensPerRun: 650, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "qa-analyst-agent": { estimatedTokensPerRun: 1200, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "web-tester-agent": { estimatedTokensPerRun: 1400, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "backend-developer-agent": { estimatedTokensPerRun: 1100, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "frontend-developer-agent": { estimatedTokensPerRun: 1100, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "ui-ux-product-designer-agent": { estimatedTokensPerRun: 700, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "cybersecurity-engineer-agent": { estimatedTokensPerRun: 800, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "maps-tracking-agent": { estimatedTokensPerRun: 650, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
    "product-gtm-agent": { estimatedTokensPerRun: 600, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 },
  },
  totals: {
    executedRuns: 0,
    skippedRuns: 0,
    tokensSpentEstimate: 0,
    tokensSavedEstimate: 0,
  },
};

const DEFAULT_LAST_RUN = {
  generatedAt: "2026-06-01T00:00:00.000Z",
  agents: {},
};

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function mergeAgentMap(baseMap, incomingMap) {
  const merged = { ...baseMap };
  for (const [key, value] of Object.entries(incomingMap || {})) {
    const baseEntry = baseMap[key] || {};
    const nextEntry = { ...baseEntry, ...value };
    if (Array.isArray(baseEntry.aliases) || Array.isArray(value?.aliases)) {
      nextEntry.aliases = [...new Set([...(baseEntry.aliases || []), ...(value?.aliases || [])])];
    }
    merged[key] = nextEntry;
  }
  return merged;
}

function hydrateLastRunFromLatestReports(lastRun) {
  const next = { ...DEFAULT_LAST_RUN, ...lastRun, agents: { ...(lastRun?.agents || {}) } };
  for (const reportFile of fs.readdirSync(REPORT_DIR, { withFileTypes: true })) {
    if (!reportFile.isFile() || !reportFile.name.endsWith("-latest.json")) continue;
    const report = readJson(path.join(REPORT_DIR, reportFile.name), null);
    if (!report?.agentId || !report?.startedAt) continue;
    if (next.agents[report.agentId]?.lastStartedAt) continue;
    next.agents[report.agentId] = {
      lastStartedAt: report.startedAt,
      lastFinishedAt: report.finishedAt || report.startedAt,
      lastStatus: report.status || "unknown",
      lastPriority: report.priority || "NONE",
      lastReason: report.reason || "",
      skippedReason: report.skippedReason || null,
      gitHead: report.gitHead || "unknown",
      gitDirtyHash: report.gitDirtyHash || stableHash(""),
      gitChangedFiles: Array.isArray(report.gitChangedFiles) ? report.gitChangedFiles : [],
    };
  }
  return next;
}

function ensureStateFiles() {
  ensureDir(RUNTIME_DIR);
  ensureDir(REPORT_DIR);
  ensureDir(DOC_REPORT_DIR);

  const schedule = readJson(SCHEDULE_FILE, null);
  const budget = readJson(BUDGET_FILE, null);
  const lastRun = readJson(LAST_RUN_FILE, null);

  writeJson(SCHEDULE_FILE, schedule ? { ...DEFAULT_SCHEDULE, ...schedule, agents: mergeAgentMap(DEFAULT_SCHEDULE.agents, schedule.agents || {}) } : DEFAULT_SCHEDULE);
  writeJson(BUDGET_FILE, budget ? { ...DEFAULT_BUDGET, ...budget, agents: mergeAgentMap(DEFAULT_BUDGET.agents, budget.agents || {}) } : DEFAULT_BUDGET);
  writeJson(LAST_RUN_FILE, hydrateLastRunFromLatestReports(lastRun || DEFAULT_LAST_RUN));
}

function getSchedule() {
  ensureStateFiles();
  return readJson(SCHEDULE_FILE, DEFAULT_SCHEDULE);
}

function getBudget() {
  ensureStateFiles();
  return readJson(BUDGET_FILE, DEFAULT_BUDGET);
}

function getLastRunState() {
  ensureStateFiles();
  return readJson(LAST_RUN_FILE, DEFAULT_LAST_RUN);
}

function saveBudget(budget) {
  budget.generatedAt = nowIso();
  writeJson(BUDGET_FILE, budget);
}

function saveLastRunState(lastRun) {
  lastRun.generatedAt = nowIso();
  writeJson(LAST_RUN_FILE, lastRun);
}

function packageScripts() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  return packageJson.scripts || {};
}

function runShell(command) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
    env: executionEnv(),
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function runPackageScript(scriptName, extraArgs = []) {
  const scripts = packageScripts();
  if (!scripts[scriptName]) {
    return {
      status: 1,
      stdout: "",
      stderr: `Missing package script: ${scriptName}`,
      command: scriptName,
    };
  }
  const command = `${scripts[scriptName]}${extraArgs.length > 0 ? ` ${extraArgs.join(" ")}` : ""}`;
  const result = runShell(command);
  return { ...result, command };
}

function stableHash(value) {
  return crypto.createHash("sha1").update(String(value || "")).digest("hex");
}

function gitState() {
  const head = runShell("git rev-parse HEAD");
  const status = runShell("git status --porcelain");
  const remote = runShell("git remote -v");
  const currentBranch = runShell("git rev-parse --abbrev-ref HEAD");
  const changedFiles = (status.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[ MARCUD?!]{1,2}\s+/, "").trim());
  return {
    head: (head.stdout || "").trim() || "unknown",
    branch: (currentBranch.stdout || "").trim() || "unknown",
    changedFiles,
    dirty: changedFiles.length > 0,
    dirtyHash: stableHash(changedFiles.join("|")),
    remoteConfigured: /\borigin\b/.test(remote.stdout || ""),
  };
}

function normalizeRepoFile(filePath) {
  return String(filePath || "").replace(/\\/g, "/").replace(/^\.\/+/, "");
}

function normalizePrefix(value) {
  return normalizeRepoFile(value).toLowerCase();
}

function isGeneratedChange(filePath) {
  const normalized = normalizeRepoFile(filePath);
  if (!normalized) return true;
  if (GENERATED_CHANGE_FILES.has(normalized)) return true;
  return GENERATED_CHANGE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function relevantChangedFiles(repo) {
  return (repo.changedFiles || []).filter((filePath) => !isGeneratedChange(filePath));
}

function pathMatchesPrefix(filePath, prefix) {
  const normalizedFile = normalizePrefix(filePath);
  const normalizedPrefix = normalizePrefix(prefix);
  if (!normalizedPrefix) return false;
  return normalizedFile === normalizedPrefix || normalizedFile.startsWith(normalizedPrefix);
}

function agentRelevantChangedFiles(config, repo) {
  const files = relevantChangedFiles(repo);
  const watchPaths = [...SHARED_SIGNAL_FILES, ...(config.watchPaths || config.allowedPaths || [])];
  if (watchPaths.length === 0) return files;
  return files.filter((filePath) => watchPaths.some((prefix) => pathMatchesPrefix(filePath, prefix)));
}

function pendingTasksForAgent(agentId, config) {
  const aliases = new Set([agentId, ...(config.aliases || [])].map((value) => String(value).toLowerCase()));
  return parseActiveTasks().filter((task) => {
    if (task.NORMALIZED_STATUS === "completed") return false;
    const fields = [task.AGENT, task.ROLE].map((value) => String(value || "").toLowerCase());
    return fields.some((value) => Array.from(aliases).some((alias) => value === alias || value.includes(alias)));
  });
}

function guessPriorityFromText(text) {
  const value = String(text || "").toLowerCase();
  if (/\b(build failed|build roto|500|auth rota|auth broken|critical bug|p[ _-]?0|exposed secret|secret exposed|tenant isolation roto|tenant isolation broken|data loss|perdida de datos)\b/.test(value)) return "P0";
  if (/\b(smoke|cms roto|driver portal|tracking roto|assistant roto|ci roto|p[ _-]?1)\b/.test(value)) return "P1";
  if (value.trim()) return "P2";
  return "NONE";
}

function highestPriority(values) {
  const normalized = values.filter(Boolean);
  return PRIORITY_ORDER.find((level) => normalized.includes(level)) || "NONE";
}

function taskPriority(tasks) {
  return highestPriority(
    tasks.map((task) => guessPriorityFromText([task.MODULE, task.OBJECTIVE, task.NEXT_STEP, task.RISKS].join(" "))),
  );
}

function bugReports() {
  const raw = readJson(path.join(ROOT, "data", "runtime", "bug-reports.json"), { reports: [] });
  return Array.isArray(raw.reports) ? raw.reports : [];
}

function bugMatchesAgent(bug, agentId, config) {
  const assignedAgents = Array.isArray(bug.assignedAgents) ? bug.assignedAgents.join(" ") : "";
  const haystack = [bug.assignedAgent, bug.agent, bug.category, bug.title, bug.description, assignedAgents]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return [agentId, ...(config.aliases || [])].some((alias) => haystack.includes(String(alias).toLowerCase()));
}

function bugPriority(agentId, config) {
  const matches = bugReports().filter((bug) => bugMatchesAgent(bug, agentId, config));
  return highestPriority(matches.map((bug) => String(bug.severity || "").toUpperCase()));
}

function failureSignals(agentId) {
  const projectStatus = readProjectStatus();
  const signals = [];
  const buildStatus = String(projectStatus.build?.status || "");
  const testsStatus = String(projectStatus.tests?.status || "");
  const betaStatus = String(projectStatus.beta?.status || "");
  const smokeStatus = String(projectStatus.smokeBrowser?.status || "");
  const blockers = Array.isArray(projectStatus.criticalBlockers) ? projectStatus.criticalBlockers.join(" ") : "";
  const joined = `${buildStatus} ${testsStatus} ${betaStatus} ${smokeStatus} ${blockers}`.toLowerCase();

  if (/\b(failed|broken|blocked)\b/.test(buildStatus.toLowerCase())) {
    if (["codex-node", "devops-automation-agent", "backend-developer-agent"].includes(agentId)) signals.push("P0");
  }
  if (/\b(failed|warning|blocked)\b/.test(`${testsStatus} ${betaStatus} ${smokeStatus}`.toLowerCase())) {
    if (["codex-node", "devops-automation-agent", "qa-analyst-agent", "web-tester-agent"].includes(agentId)) signals.push("P1");
  }
  if (/\b(secret|tenant|auth|500|data loss)\b/.test(joined) && ["cybersecurity-engineer-agent", "backend-developer-agent", "codex-node"].includes(agentId)) {
    signals.push("P0");
  }
  return highestPriority(signals);
}

function manualRequired(agentId, tasks) {
  const taskText = tasks.map((task) => [task.OBJECTIVE, task.NEXT_STEP, task.DEPENDENCIES].join(" ")).join(" ").toLowerCase();
  if (/\b(approval|aprobaci[oó]n|decision humana|human approval|manual request)\b/.test(taskText)) return true;
  if (agentId === "maps-tracking-agent" && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && /\bgoogle|apple maps|paid api\b/.test(taskText)) return true;
  return false;
}

function blockedByLocks(agentId, config, tasks) {
  if (!config.canModifyCode) return false;
  const ownedIds = new Set(tasks.map((task) => task.ID));
  const otherLocks = parseActiveTasks()
    .filter((task) => task.NORMALIZED_STATUS !== "completed" && !ownedIds.has(task.ID))
    .flatMap((task) => (task.FILES_LOCKED_LIST || []).map((file) => ({ id: task.ID, file })));
  if (otherLocks.length === 0) return false;
  const allowedPrefixes = config.allowedPaths || [];
  if (allowedPrefixes.length === 0) return true;
  return otherLocks.some((lock) => {
    const normalized = String(lock.file || "").replace(/\\/g, "/").toLowerCase();
    return allowedPrefixes.some((prefix) => normalized.startsWith(String(prefix || "").replace(/\\/g, "/").toLowerCase()));
  });
}

function slotStart(now, hour) {
  const slot = new Date(now);
  slot.setHours(hour, 0, 0, 0);
  return slot;
}

function hasReachedFixedWindow(now, lastRunAt, hours) {
  for (const hour of hours || []) {
    const start = slotStart(now, hour);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    if (now >= start && now < end) {
      if (!lastRunAt || lastRunAt < start.toISOString()) return true;
    }
  }
  return false;
}

function weekdayMatches(now, weekdays) {
  if (!Array.isArray(weekdays) || weekdays.length === 0) return true;
  const jsDay = now.getDay();
  const weekday = jsDay === 0 ? 7 : jsDay;
  return weekdays.includes(weekday);
}

function dueOnSchedule(agentId, config, lastRunAt, now) {
  if (!weekdayMatches(now, config.fixedWeekdaysLocal)) return false;
  if (Array.isArray(config.fixedHoursLocal) && config.fixedHoursLocal.length > 0) {
    return hasReachedFixedWindow(now, lastRunAt, config.fixedHoursLocal);
  }
  if (!lastRunAt) return true;
  const elapsedMinutes = Math.floor((now.getTime() - Date.parse(lastRunAt)) / 60000);
  return elapsedMinutes >= Number(config.intervalMinutes || 0);
}

function cooldownState(config, lastRunAt, priority, now) {
  if (!lastRunAt) return { blocked: false, remainingMinutes: 0 };
  if (priority === "P0") return { blocked: false, remainingMinutes: 0 };
  const cooldown = Number(config.cooldownMinutes || 0);
  const threshold = priority === "P1" ? Math.ceil(cooldown / 2) : cooldown;
  const elapsedMinutes = Math.floor((now.getTime() - Date.parse(lastRunAt)) / 60000);
  return {
    blocked: elapsedMinutes < threshold,
    remainingMinutes: Math.max(threshold - elapsedMinutes, 0),
  };
}

function changesDetected(lastRunEntry, repo, config) {
  if (!lastRunEntry) return true;
  const currentRelevantFiles = Array.isArray(repo.changedFiles) ? repo.changedFiles : [];
  const previousRelevantFiles = agentRelevantChangedFiles(config, {
    changedFiles: Array.isArray(lastRunEntry.gitChangedFiles) ? lastRunEntry.gitChangedFiles : [],
  });
  return lastRunEntry.gitHead !== repo.head || stableHash(currentRelevantFiles.join("|")) !== stableHash(previousRelevantFiles.join("|"));
}

function evaluateAgent(agentId, options = {}) {
  const schedule = getSchedule();
  const config = schedule.agents[agentId];
  if (!config) throw new Error(`Unknown scheduled agent: ${agentId}`);

  const repo = gitState();
  const lastRunState = getLastRunState();
  const lastRunEntry = lastRunState.agents[agentId];
  const tasks = pendingTasksForAgent(agentId, config);
  const priority = highestPriority([taskPriority(tasks), bugPriority(agentId, config), failureSignals(agentId)]);
  const relevantFiles = agentRelevantChangedFiles(config, repo);
  const due = dueOnSchedule(agentId, config, lastRunEntry?.lastStartedAt, options.now || new Date());
  const changed = changesDetected(lastRunEntry, { ...repo, changedFiles: relevantFiles }, config);
  const cooldown = cooldownState(config, lastRunEntry?.lastStartedAt, priority, options.now || new Date());
  const hasTasks = tasks.length > 0;
  const failedCheck = failureSignals(agentId) !== "NONE";
  const urgentBug = ["P0", "P1"].includes(bugPriority(agentId, config));
  const blocked = blockedByLocks(agentId, config, tasks);
  const manual = manualRequired(agentId, tasks);
  const hasOnDemandAssignment = hasTasks && config.runOnlyWithAssignedTasks;
  const shouldIgnoreSchedule = options.force === true || priority === "P0" || hasOnDemandAssignment;
  const shouldIgnoreCooldown = options.force === true || priority === "P0";
  const scriptAvailable = Boolean(packageScripts()[config.script]);

  let status = "ELIGIBLE";
  let reason = "Eligible for execution.";

  if (!scriptAvailable) {
    status = "SKIPPED_BLOCKED";
    reason = `Missing package script ${config.script}.`;
  } else if (manual) {
    status = "SKIPPED_MANUAL_REQUIRED";
    reason = "Task scope requires explicit human intervention.";
  } else if (blocked) {
    status = "SKIPPED_BLOCKED";
    reason = "Other active tasks hold file locks that conflict with this agent.";
  } else if (config.runOnlyWithAssignedTasks && !hasTasks && !urgentBug && !failedCheck) {
    status = "SKIPPED_NO_TASKS";
    reason = "No assigned tasks or urgent failures were found.";
  } else if (!shouldIgnoreSchedule && !due) {
    status = "SKIPPED_COOLDOWN";
    reason = "Scheduled window not reached yet.";
  } else if (cooldown.blocked && !shouldIgnoreCooldown) {
    status = "SKIPPED_COOLDOWN";
    reason = `Cooldown still active for ${cooldown.remainingMinutes} more minutes.`;
  } else if (!changed && !hasTasks && !urgentBug && !failedCheck) {
    status = "SKIPPED_NO_CHANGES";
    reason = "No git changes, tasks, bugs or failed checks were detected.";
  } else if (!hasTasks && !urgentBug && !failedCheck && config.runOnlyWithAssignedTasks) {
    status = "SKIPPED_NO_TASKS";
    reason = "No assigned task exists for a code-modifying agent.";
  }

  return {
    agentId,
    status,
    reason,
    due,
    priority,
    changesDetected: changed,
    tasksFound: tasks.length,
    taskIds: tasks.map((task) => task.ID || "unknown"),
    cooldownRemainingMinutes: cooldown.remainingMinutes,
    failedCheckDetected: failedCheck,
    urgentBugDetected: urgentBug,
    blocked,
    manualRequired: manual,
    script: config.script,
    gitHead: repo.head,
    gitDirty: repo.dirty,
    gitDirtyHash: repo.dirtyHash,
    gitChangedFiles: relevantFiles,
    remoteConfigured: repo.remoteConfigured,
    branch: repo.branch,
    config,
  };
}

function formatMarkdownList(items) {
  if (!items || items.length === 0) return "- none";
  return items.map((item) => `- ${item}`).join("\n");
}

function writeAgentLatestReport(report) {
  ensureDir(REPORT_DIR);
  ensureDir(DOC_REPORT_DIR);
  writeJson(path.join(REPORT_DIR, `${report.agentId}-latest.json`), report);
  const markdown = [
    `# ${report.agentId} Latest Report`,
    "",
    `Agent: ${report.agentId}`,
    `Status: ${report.status}`,
    `StartedAt: ${report.startedAt}`,
    `FinishedAt: ${report.finishedAt}`,
    `Reason: ${report.reason}`,
    `ChangesDetected: ${report.changesDetected}`,
    `TasksFound: ${report.tasksFound}`,
    `ActionsTaken: ${report.actionsTaken.join("; ") || "none"}`,
    `SkippedReason: ${report.skippedReason || "none"}`,
    `Blockers: ${report.blockers.join("; ") || "none"}`,
    `NextAction: ${report.nextAction}`,
    `TokenSavingDecision: ${report.tokenSavingDecision}`,
    "",
    "## Command",
    "",
    `- Script: ${report.script}`,
    `- ExitCode: ${report.exitCode}`,
    "",
    "## Priority",
    "",
    `- Effective priority: ${report.priority}`,
    "",
    "## Task IDs",
    "",
    formatMarkdownList(report.taskIds),
    "",
    "## Git Files",
    "",
    formatMarkdownList(report.gitChangedFiles),
    "",
    "## Output",
    "",
    "```text",
    String(report.stdout || "").trim().slice(0, 8000),
    String(report.stderr || "").trim().slice(0, 4000),
    "```",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(DOC_REPORT_DIR, `${report.agentId}-latest.md`), markdown, "utf8");
}

function updateBudget(agentId, executed) {
  const budget = getBudget();
  const entry = budget.agents[agentId] || { estimatedTokensPerRun: 500, executedRuns: 0, skippedRuns: 0, tokensSpentEstimate: 0, tokensSavedEstimate: 0 };
  if (executed) {
    entry.executedRuns += 1;
    entry.tokensSpentEstimate += entry.estimatedTokensPerRun;
    budget.totals.executedRuns += 1;
    budget.totals.tokensSpentEstimate += entry.estimatedTokensPerRun;
  } else {
    entry.skippedRuns += 1;
    entry.tokensSavedEstimate += entry.estimatedTokensPerRun;
    budget.totals.skippedRuns += 1;
    budget.totals.tokensSavedEstimate += entry.estimatedTokensPerRun;
  }
  budget.agents[agentId] = entry;
  saveBudget(budget);
  return entry;
}

function persistLastRun(report) {
  const lastRun = getLastRunState();
  const previous = lastRun.agents[report.agentId] || {};
  const executed = report.status === "EXECUTED" || report.status === "FAILED";
  lastRun.agents[report.agentId] = {
    ...previous,
    lastEvaluatedAt: report.finishedAt,
    lastStatus: report.status,
    lastPriority: report.priority,
    lastReason: report.reason,
    skippedReason: report.skippedReason || null,
    lastStartedAt: executed ? report.startedAt : previous.lastStartedAt || null,
    lastFinishedAt: executed ? report.finishedAt : previous.lastFinishedAt || null,
    gitHead: executed ? report.gitHead : previous.gitHead || null,
    gitDirtyHash: executed ? report.gitDirtyHash : previous.gitDirtyHash || null,
    gitChangedFiles: executed ? report.gitChangedFiles : previous.gitChangedFiles || [],
  };
  saveLastRunState(lastRun);
}

function dispatchAgent(agentId, options = {}) {
  const evaluation = evaluateAgent(agentId, options);
  const startedAt = nowIso();
  const report = {
    agentId,
    status: evaluation.status,
    startedAt,
    finishedAt: nowIso(),
    reason: evaluation.reason,
    changesDetected: evaluation.changesDetected,
    tasksFound: evaluation.tasksFound,
    actionsTaken: [],
    skippedReason: null,
    blockers: [],
    nextAction: "Wait for the next eligible signal.",
    tokenSavingDecision: "",
    script: evaluation.script,
    exitCode: 0,
    priority: evaluation.priority,
    taskIds: evaluation.taskIds,
    gitHead: evaluation.gitHead,
    gitDirtyHash: evaluation.gitDirtyHash,
    gitChangedFiles: evaluation.gitChangedFiles,
    stdout: "",
    stderr: "",
  };

  if (evaluation.status !== "ELIGIBLE") {
    report.status = evaluation.status;
    report.skippedReason = evaluation.status;
    report.blockers = [
      evaluation.blocked ? "Locked files owned by another active task." : null,
      evaluation.manualRequired ? "Human decision required." : null,
      !packageScripts()[evaluation.script] ? `Missing package script ${evaluation.script}.` : null,
    ].filter(Boolean);
    report.actionsTaken.push("Execution skipped by gating.");
    report.nextAction = evaluation.reason;
    report.tokenSavingDecision = `Saved estimated tokens by skipping ${agentId}.`;
    report.finishedAt = nowIso();
    updateBudget(agentId, false);
    persistLastRun(report);
    writeAgentLatestReport(report);
    appendAgentLog(agentId, `${report.status} ${report.reason}`);
    return report;
  }

  const execution = runPackageScript(evaluation.script);
  report.exitCode = execution.status;
  report.stdout = execution.stdout;
  report.stderr = execution.stderr;
  report.finishedAt = nowIso();
  report.status = execution.status === 0 ? "EXECUTED" : "FAILED";
  report.actionsTaken.push(`Ran ${evaluation.script}.`);
  report.reason = execution.status === 0 ? "Executed because gating conditions were met." : "Execution failed.";
  report.nextAction = execution.status === 0 ? "Review generated report and wait for next due window." : "Fix failing script before the next cycle.";
  report.blockers = execution.status === 0 ? [] : [execution.stderr.trim() || "Script returned non-zero exit status."];
  report.tokenSavingDecision = `Spent estimated tokens/resources because ${agentId} had a real execution signal.`;
  updateBudget(agentId, true);
  persistLastRun(report);
  writeAgentLatestReport(report);
  appendAgentLog(agentId, `${report.status} ${evaluation.script} exit=${execution.status}`);
  return report;
}

function summarizeScheduleState() {
  const schedule = getSchedule();
  const lastRun = getLastRunState();
  const budget = getBudget();
  const agents = Object.keys(schedule.agents).map((agentId) => {
    const config = schedule.agents[agentId];
    const state = lastRun.agents[agentId] || {};
    const budgetEntry = budget.agents[agentId] || {};
    const evaluation = evaluateAgent(agentId);
    return {
      agentId,
      script: config.script,
      intervalMinutes: config.intervalMinutes,
      cooldownMinutes: config.cooldownMinutes,
      lastStartedAt: state.lastStartedAt || "never",
      lastStatus: state.lastStatus || "never",
      nextDecision: evaluation.status,
      priority: evaluation.priority,
      executedRuns: budgetEntry.executedRuns || 0,
      skippedRuns: budgetEntry.skippedRuns || 0,
    };
  });
  return { generatedAt: nowIso(), agents, budget };
}

function writeRuntimeStatusDocs() {
  const summary = summarizeScheduleState();
  const projectStatus = readProjectStatus();
  const lines = [
    "# Agent Runtime Status",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    "## Scheduler Model",
    "",
    "- Local scripts only. No autonomous LLM workers.",
    "- Execution requires schedule plus gating.",
    "- P0 can bypass cooldown. P1 can shorten cooldown. P2 cannot.",
    "- Web tester stays on the 10:00 and 22:00 local windows unless a P0 overrides the gate.",
    "- Backend and frontend agents remain off unless assigned work, urgent bugs or failed checks justify a run.",
    "",
    "## Agent Schedule",
    "",
    "| Agent | Script | Interval | Cooldown | Last run | Last status | Next decision | Priority |",
    "| --- | --- | ---: | ---: | --- | --- | --- | --- |",
    ...summary.agents.map((agent) => `| ${agent.agentId} | ${agent.script} | ${agent.intervalMinutes} | ${agent.cooldownMinutes} | ${agent.lastStartedAt} | ${agent.lastStatus} | ${agent.nextDecision} | ${agent.priority} |`),
    "",
    "## Budget",
    "",
    `- Executed runs: ${summary.budget.totals.executedRuns}`,
    `- Skipped runs: ${summary.budget.totals.skippedRuns}`,
    `- Estimated tokens spent: ${summary.budget.totals.tokensSpentEstimate}`,
    `- Estimated tokens saved: ${summary.budget.totals.tokensSavedEstimate}`,
    "",
    "## Watchdog Snapshot",
    "",
    `- Server: ${projectStatus.server?.status || "unknown"}`,
    `- Scheduler: ${projectStatus.scheduler?.status || "unknown"}`,
    `- Last beta-check: ${projectStatus.beta?.lastRun || "never"}`,
    `- Smoke status: ${projectStatus.smokeBrowser?.status || "unknown"}`,
    "",
    "## Immediate Triggers",
    "",
    "- P0: build broken, route 500, auth broken, critical bug, data loss, exposed secret, broken tenant isolation.",
    "- P1: smoke failed, CMS broken, driver portal broken, customer tracking broken, assistant broken, GitHub CI broken.",
    "- Manual-only: paid maps activation, feature implementation without assignment, any human approval boundary.",
    "",
  ];
  writeText("docs/AGENT_RUNTIME_STATUS.md", `${lines.join("\n")}\n`);
  return summary;
}

function updateProjectStatusFromSchedule(summary, extra = {}) {
  const current = readProjectStatus();
  const next = {
    ...current,
    scheduler: {
      status: "running",
      lastRun: nowIso(),
      tickMinutes: getSchedule().scheduler.tickMinutes,
      agents: summary.agents.map((agent) => ({
        id: agent.agentId,
        lastStatus: agent.lastStatus,
        nextDecision: agent.nextDecision,
        priority: agent.priority,
      })),
    },
    tokenBudget: {
      ...summary.budget.totals,
      updatedAt: nowIso(),
    },
    ...extra,
  };
  writeJson(path.join(RUNTIME_DIR, "project-status.json"), next);
}

module.exports = {
  BUDGET_FILE,
  DEFAULT_BUDGET,
  DEFAULT_LAST_RUN,
  DEFAULT_SCHEDULE,
  LAST_RUN_FILE,
  REPORT_DIR,
  SCHEDULE_FILE,
  SKIP_STATUSES,
  dispatchAgent,
  ensureStateFiles,
  evaluateAgent,
  getBudget,
  getLastRunState,
  getSchedule,
  gitState,
  runPackageScript,
  summarizeScheduleState,
  updateProjectStatusFromSchedule,
  writeRuntimeStatusDocs,
};
