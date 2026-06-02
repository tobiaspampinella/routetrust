#!/usr/bin/env node
const {
  ensureOpsDirs,
  nowIso,
  readJson,
  todayCompact,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const DEFAULT_PRECHECKS = [
  "npm run typecheck",
  "npm run lint",
  "npm test",
  "npm run qa:security",
];

const DEFAULT_POSTCHECKS = [
  "npm run typecheck",
  "npm run lint",
  "npm test",
  "npm run build",
  "npm run qa:smoke",
  "npm run beta-check",
];

const FORBIDDEN_FILES = [
  ".env",
  ".env.local",
  ".env.*",
  ".env.production",
  "*.pem",
  "*.key",
  "*.p12",
  "*.cer",
  "*.crt",
];

function moduleAllowedFiles(module) {
  const map = {
    db: ["docs/**", "scripts/**", "runtime/codex-queue/**", "docker-compose.yml", "prisma/**", "src/lib/db/**", "src/services/**", "src/app/api/health/**", "src/app/api/bugs/**"],
    auth: ["docs/**", "scripts/**", "runtime/codex-queue/**", "src/lib/sessionToken.ts", "src/lib/serverAuth.ts", "src/app/api/auth/**", "src/middleware.ts"],
    cms: ["docs/**", "scripts/**", "src/modules/cms/**", "src/services/cms/**", "src/app/admin/cms/**", "src/app/api/cms/**", "runtime/codex-queue/**"],
    frontend: ["docs/**", "src/components/**", "src/app/**", "src/design-system/**", "runtime/codex-queue/**"],
    github: ["docs/**", "scripts/**", ".github/**", "runtime/codex-queue/**"],
    devops: ["docs/**", "scripts/**", "runtime/codex-queue/**", "docker-compose.yml", "package.json", "package-lock.json"],
    security: ["docs/**", "scripts/**", "runtime/codex-queue/**", "src/**", "tests/**"],
    qa: ["docs/**", "scripts/**", "tests/**", "src/**/*.test.ts", "runtime/codex-queue/**"],
  };
  return map[module] || ["docs/**", "scripts/**", "runtime/codex-queue/**"];
}

function taskKey(task) {
  return [task.severity, task.module, task.reason, task.evidence].join("|").toLowerCase();
}

function nextId(severity, existing) {
  const prefix = `${severity}-${todayCompact()}-`;
  const max = existing
    .map((task) => String(task.id || ""))
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number.parseInt(id.slice(prefix.length), 10) || 0)
    .reduce((highest, value) => Math.max(highest, value), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function findingToTask(finding, existing) {
  return {
    id: nextId(finding.severity, existing),
    severity: finding.severity,
    module: finding.module,
    reason: finding.reason,
    evidence: finding.evidence,
    recommendedAgent: finding.recommendedAgent,
    allowedFiles: moduleAllowedFiles(finding.module),
    forbiddenFiles: FORBIDDEN_FILES,
    preChecks: DEFAULT_PRECHECKS,
    postChecks: DEFAULT_POSTCHECKS,
    status: "pending",
    requiresHumanApproval: false,
    requiresReviewBeforeMerge: true,
  };
}

function normalizeTaskPolicy(task) {
  return {
    ...task,
    allowedFiles: moduleAllowedFiles(task.module),
    forbiddenFiles: FORBIDDEN_FILES,
    preChecks: Array.isArray(task.preChecks) && task.preChecks.length > 0 ? task.preChecks : DEFAULT_PRECHECKS,
    postChecks: Array.isArray(task.postChecks) && task.postChecks.length > 0 ? task.postChecks : DEFAULT_POSTCHECKS,
    requiresHumanApproval: false,
    requiresReviewBeforeMerge: true,
  };
}

function eligibleFinding(finding) {
  if (finding.severity === "P0") return true;
  return finding.severity === "P1" && finding.affectsBetaStable;
}

function reconcileExistingTasks(existingTasks, eligibleKeys, reconciledAt) {
  return existingTasks.map((task) => {
    const normalizedTask = normalizeTaskPolicy(task);
    const isPendingCodexTask = task.status === "pending" && ["P0", "P1"].includes(task.severity);
    if (!isPendingCodexTask || eligibleKeys.has(taskKey(task))) return normalizedTask;

    return {
      ...normalizedTask,
      status: "blocked",
      blockedReason: "SUPERSEDED_BY_CURRENT_CLASSIFICATION",
      blockedAt: reconciledAt,
    };
  });
}

function renderPrompt(task, queue) {
  if (!task) {
    return `# Next Codex Task\n\nNo pending P0/P1 task is ready.\n\nPolicy: Codex execution is available through npm run codex:run or npm run ops:daemon -- --run-codex. P2 stays local/backlog.\n`;
  }

  return `# Next Codex Task\n\nGenerated: ${nowIso()}\n\nCodex direct execution is operational through \`npm run codex:run\` or \`npm run ops:daemon -- --run-codex\`.\n\n## Single Task For This Cycle\n\n\`\`\`json\n${JSON.stringify(task, null, 2)}\n\`\`\`\n\n## Operating Rules\n\n- Create or use a task branch before source changes.\n- Core source changes are allowed when listed in allowedFiles.\n- Do not modify main directly.\n- Do not force push.\n- Do not upload secrets.\n- Run preChecks before changes and postChecks after changes.\n- Stop after this one task; do not pull unrelated queue items.\n\n## Queue State\n\n- Total tasks: ${queue.tasks.length}\n- Pending tasks: ${queue.tasks.filter((item) => item.status === "pending").length}\n`;
}

function nextPendingCodexTask(tasks) {
  const severityRank = { P0: 0, P1: 1 };
  return tasks
    .filter((task) => task.status === "pending" && Object.prototype.hasOwnProperty.call(severityRank, task.severity))
    .sort((left, right) => severityRank[left.severity] - severityRank[right.severity])
    [0] || null;
}

function main() {
  ensureOpsDirs();
  const generatedAt = nowIso();
  const classification = readJson("runtime/decisions/classification-latest.json", { findings: [] });
  const existingQueue = readJson("runtime/codex-queue/tasks.json", { updatedAt: null, tasks: [] });
  const existingTasks = Array.isArray(existingQueue.tasks) ? existingQueue.tasks : [];
  const eligibleFindings = (classification.findings || []).filter(eligibleFinding);
  const eligibleKeys = new Set(eligibleFindings.map((finding) => taskKey({
    severity: finding.severity,
    module: finding.module,
    reason: finding.reason,
    evidence: finding.evidence,
  })));
  const retainedTasks = reconcileExistingTasks(existingTasks, eligibleKeys, generatedAt);
  const existingKeys = new Set(retainedTasks.map(taskKey));
  const newTasks = [];

  for (const finding of eligibleFindings) {
    const draft = findingToTask(finding, retainedTasks.concat(newTasks));
    if (existingKeys.has(taskKey(draft))) continue;
    newTasks.push(draft);
    existingKeys.add(taskKey(draft));
  }

  const queue = {
    updatedAt: generatedAt,
    policy: "one_codex_task_per_cycle",
    codexDirectExecution: true,
    tasks: retainedTasks.concat(newTasks),
  };
  const nextTask = nextPendingCodexTask(queue.tasks);

  writeJson("runtime/codex-queue/tasks.json", queue);
  writeText("runtime/codex-queue/next-codex-prompt.md", renderPrompt(nextTask, queue));
  writeJson("runtime/codex-queue/latest-preparer-result.json", {
    generatedAt: queue.updatedAt,
    added: newTasks.length,
    nextTaskId: nextTask?.id || null,
    codexDirectExecution: true,
  });

  console.log(JSON.stringify({
    added: newTasks.length,
    total: queue.tasks.length,
    nextTaskId: nextTask?.id || null,
  }, null, 2));
}

main();
