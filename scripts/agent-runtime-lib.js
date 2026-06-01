const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const AGENTS = require("../config/routeTrustAgents.json");

const ROOT = path.resolve(__dirname, "..");
const RUNTIME_DIR = path.join(ROOT, "runtime");
const HEARTBEAT_DIR = path.join(RUNTIME_DIR, "heartbeats");
const DATA_RUNTIME_DIR = path.join(ROOT, "data", "runtime");
const VALID_STATUSES = ["pending", "running", "blocked", "completed", "failed"];
const VALID_MODES = ["documented", "executable", "scheduled", "running"];
const REQUIRED_AGENT_FILES = ["mission.md", "tasks.md", "status.md", "output.md", "risks.md"];
const REQUIRED_SCRIPTS = [
  "agent-status",
  "agent-runner",
  "agent-scheduler",
  "agent-heartbeat",
  "agent-report",
  "dev-dashboard",
  "telegram-test",
  "telegram-status",
  "telegram-notify",
  "qa-smoke",
  "qa-build",
  "beta-check",
  "watchdog",
  "ux-audit",
  "debug-scan",
  "debug-report",
  "qa-security",
  "security-audit",
  "locks-sync",
  "locks-check",
  "bugs-list",
  "bugs-report",
  "bugs-triage",
];

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return nowIso().slice(0, 10);
}

function relativePath(...parts) {
  return path.join(...parts).replace(/\\/g, "/");
}

function absolutePath(...parts) {
  return path.join(ROOT, ...parts);
}

function ensureDir(relativeDir) {
  fs.mkdirSync(absolutePath(relativeDir), { recursive: true });
}

function ensureAbsoluteDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readText(relativeFile) {
  const file = absolutePath(relativeFile);
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function writeText(relativeFile, content) {
  ensureDir(path.dirname(relativeFile));
  fs.writeFileSync(absolutePath(relativeFile), content, "utf8");
}

function appendText(relativeFile, content) {
  ensureDir(path.dirname(relativeFile));
  fs.appendFileSync(absolutePath(relativeFile), content, "utf8");
}

function readJson(relativeFile, fallback) {
  try {
    return JSON.parse(readText(relativeFile) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(relativeFile, value) {
  writeText(relativeFile, `${JSON.stringify(value, null, 2)}\n`);
}

function fileExists(relativeFile) {
  return fs.existsSync(absolutePath(relativeFile));
}

function executionEnv() {
  const nodeDir = path.dirname(process.execPath);
  const localBin = absolutePath("node_modules", ".bin");
  const currentPath = process.env.PATH || process.env.Path || "";
  return {
    ...process.env,
    PATH: [nodeDir, localBin, currentPath].filter(Boolean).join(path.delimiter),
  };
}

function sleep(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return;
  const boundedMs = Math.min(Math.floor(ms), 300000);
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, boundedMs);
}

function normalizeTaskStatus(status) {
  const value = String(status || "pending").trim().toLowerCase();
  if (value === "done") return "completed";
  if (VALID_STATUSES.includes(value)) return value;
  return value || "pending";
}

function parseSections(markdown, headingPrefix = "## ") {
  const sections = [];
  let current = null;
  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith(headingPrefix)) {
      if (current) sections.push(current);
      current = { title: line.slice(headingPrefix.length).trim(), body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

function parseActiveTasks() {
  const content = readText("docs/ACTIVE_TASKS.md");
  if (!content.trim()) return [];

  return content
    .split(/\r?\n(?=\[TASK\])/g)
    .filter((block) => block.includes("[TASK]"))
    .map((block) => {
      const task = {};
      for (const line of block.split(/\r?\n/)) {
        const match = line.match(/^([A-Z_]+):\s*(.*)$/);
        if (match) task[match[1]] = match[2].trim();
      }
      task.NORMALIZED_STATUS = normalizeTaskStatus(task.STATUS);
      task.FILES_LOCKED_LIST = String(task.FILES_LOCKED || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return task;
    });
}

function parseOwnership() {
  const content = readText("docs/AGENT_OWNERSHIP.md");
  if (!content.trim()) return [];

  return parseSections(content).map((section) => ({
    title: section.title,
    body: section.body.join("\n").trim(),
  }));
}

function findAgent(agentId) {
  const normalized = String(agentId || "").trim().toLowerCase();
  return AGENTS.find((agent) => {
    const names = [agent.id, agent.name, agent.role, ...(agent.aliases || [])].map((value) => value.toLowerCase());
    return names.includes(normalized);
  });
}

function taskMatchesAgent(task, agent) {
  const agentField = String(task.AGENT || "").trim().toLowerCase();
  const roleField = String(task.ROLE || "").trim().toLowerCase();
  const names = new Set([agent.id, agent.name, agent.role, ...(agent.aliases || [])].map((value) => value.toLowerCase()));
  return names.has(agentField) || names.has(roleField);
}

function getTasksForAgent(agent) {
  return parseActiveTasks().filter((task) => taskMatchesAgent(task, agent));
}

function parseStatus(markdown) {
  const match = markdown.match(/^STATUS:\s*([a-zA-Z_-]+)/m);
  const status = match ? match[1].toLowerCase() : "pending";
  return VALID_STATUSES.includes(status) ? status : "failed";
}

function getStatusMeta(agent) {
  const markdown = readText(`agents/${agent.id}/status.md`);
  const status = parseStatus(markdown);
  const lastRun = (markdown.match(/^LAST_RUN:\s*(.*)$/m) || [])[1]?.trim() || "never";
  const command = (markdown.match(/^COMMAND:\s*(.*)$/m) || [])[1]?.trim() || `node scripts/agent-runner ${agent.id}`;
  const activeProcess = (markdown.match(/^ACTIVE_PROCESS:\s*(.*)$/m) || [])[1]?.trim() || "none";
  const note = markdown.split(/\r?\n\r?\n/).slice(1).join("\n\n").trim();
  return { status, lastRun, command, activeProcess, note };
}

function validateRuntime() {
  const missing = [];
  const invalidStatuses = [];

  for (const agent of AGENTS) {
    for (const file of REQUIRED_AGENT_FILES) {
      const agentFile = `agents/${agent.id}/${file}`;
      if (!fileExists(agentFile)) missing.push(agentFile);
    }

    const statusFile = `agents/${agent.id}/status.md`;
    if (fileExists(statusFile)) {
      const rawStatus = (readText(statusFile).match(/^STATUS:\s*(.*)$/m) || [])[1];
      if (!rawStatus || !VALID_STATUSES.includes(rawStatus.trim().toLowerCase())) {
        invalidStatuses.push(statusFile);
      }
    }
  }

  for (const script of REQUIRED_SCRIPTS) {
    if (!fileExists(`scripts/${script}`)) missing.push(`scripts/${script}`);
  }

  for (const file of [
    "AGENTS.md",
    "AGENT_RUNTIME.md",
    "docs/AGENT_RUNTIME_STATUS.md",
    "docs/LOCKED_FILES.md",
    "runtime/project-status.json",
  ]) {
    if (!fileExists(file)) missing.push(file);
  }

  return { missing, invalidStatuses };
}

function isPidActive(pid) {
  const numericPid = Number(pid);
  if (!Number.isInteger(numericPid) || numericPid <= 0) return false;
  try {
    process.kill(numericPid, 0);
    return true;
  } catch (error) {
    return error && error.code === "EPERM";
  }
}

function readProcessMarkers() {
  const logDir = absolutePath("docs/agent-logs");
  if (!fs.existsSync(logDir)) return [];

  return fs
    .readdirSync(logDir)
    .filter((file) => file.endsWith(".running.json"))
    .map((file) => {
      const markerPath = path.join(logDir, file);
      try {
        const marker = JSON.parse(fs.readFileSync(markerPath, "utf8"));
        return {
          ...marker,
          markerFile: relativePath("docs", "agent-logs", file),
          active: isPidActive(marker.pid),
        };
      } catch (error) {
        return {
          agentId: file.replace(".running.json", ""),
          pid: null,
          markerFile: relativePath("docs", "agent-logs", file),
          active: false,
          error: error.message,
        };
      }
    });
}

function appendAgentLog(agentId, message) {
  const safeAgentId = agentId.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  appendText(`docs/agent-logs/${todayKey()}-${safeAgentId}.log`, `[${nowIso()}] ${message}\n`);
}

function createProcessMarker(nameOrAgent, metadata = {}) {
  const id = typeof nameOrAgent === "string" ? nameOrAgent : nameOrAgent.id;
  const name = typeof nameOrAgent === "string" ? nameOrAgent : nameOrAgent.name;
  const marker = {
    agentId: id,
    agentName: name,
    pid: process.pid,
    status: "running",
    startedAt: nowIso(),
    command: process.argv.join(" "),
    ...metadata,
  };
  writeText(`docs/agent-logs/${id}.running.json`, `${JSON.stringify(marker, null, 2)}\n`);
  return marker;
}

function closeProcessMarker(nameOrAgent, status, metadata = {}) {
  const id = typeof nameOrAgent === "string" ? nameOrAgent : nameOrAgent.id;
  const name = typeof nameOrAgent === "string" ? nameOrAgent : nameOrAgent.name;
  const runningFile = absolutePath("docs/agent-logs", `${id}.running.json`);
  const marker = {
    agentId: id,
    agentName: name,
    pid: process.pid,
    status,
    finishedAt: nowIso(),
    command: process.argv.join(" "),
    ...metadata,
  };
  writeText(`docs/agent-logs/${id}.last-run.json`, `${JSON.stringify(marker, null, 2)}\n`);
  if (fs.existsSync(runningFile)) fs.unlinkSync(runningFile);
}

function readHeartbeat(id) {
  return readJson(`runtime/heartbeats/${id}.json`, null);
}

function writeHeartbeat(id, data) {
  const next = {
    agentId: id,
    ...readHeartbeat(id),
    ...data,
    lastSeen: nowIso(),
  };
  writeJson(`runtime/heartbeats/${id}.json`, next);
  return next;
}

function removeHeartbeatError(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [String(value)];
}

function setAgentStatus(agent, status, note, extras = {}) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status "${status}". Valid statuses: ${VALID_STATUSES.join(", ")}`);
  }

  const heartbeat = writeHeartbeat(agent.id, {
    status,
    currentTask: extras.currentTask || null,
    lastOutput: extras.lastOutput || note || "",
    errors: removeHeartbeatError(extras.errors),
    pid: extras.pid ?? (status === "running" ? process.pid : null),
    mode: extras.mode || "executable",
  });

  writeText(
    `agents/${agent.id}/status.md`,
    `# ${agent.name} Status

STATUS: ${status}
MODE: ${heartbeat.mode}
ACTIVE_PROCESS: ${status === "running" ? `pid ${process.pid}` : "none"}
LAST_RUN: ${nowIso()}
COMMAND: node scripts/agent-runner ${agent.id}
CURRENT_TASK: ${heartbeat.currentTask || "none"}

${note || "Runtime status is controlled by scripts. Documentation alone does not mark this agent active."}
`,
  );
}

function writeAgentOutput(agent, content) {
  writeText(
    `agents/${agent.id}/output.md`,
    `# ${agent.name} Output

Last updated: ${nowIso()}

${content}
`,
  );
}

function getAgentRuntimeMode(agent, context) {
  if (context.activeProcess) return "running";
  if (context.schedulerActive) return "scheduled";
  if (context.hasRequiredFiles && fileExists("scripts/agent-runner")) return "executable";
  return "documented";
}

function computeAgentRuntime(agent, context) {
  const tasks = getTasksForAgent(agent);
  const statusMeta = getStatusMeta(agent);
  const heartbeat = readHeartbeat(agent.id);
  const activeProcess = context.processMarkers.find((marker) => marker.agentId === agent.id && marker.active) || null;
  const hasRequiredFiles = REQUIRED_AGENT_FILES.every((file) => fileExists(`agents/${agent.id}/${file}`));
  const pendingTasks = tasks.filter((task) => task.NORMALIZED_STATUS !== "completed");
  const mode = getAgentRuntimeMode(agent, {
    activeProcess,
    hasRequiredFiles,
    schedulerActive: context.schedulerActive,
  });
  const status =
    activeProcess
      ? "running"
      : statusMeta.status === "blocked"
        ? "blocked"
        : pendingTasks.length > 0
          ? "pending"
          : tasks.length > 0
            ? "completed"
            : statusMeta.status;

  return {
    ...agent,
    status,
    mode,
    tasks,
    pendingTasks,
    activeProcess,
    heartbeat,
    lastRun: statusMeta.lastRun,
    command: statusMeta.command,
    note: statusMeta.note,
    documented: hasRequiredFiles,
    executable: fileExists("scripts/agent-runner"),
  };
}

function parseLockedFilesFromTasks(tasks = parseActiveTasks()) {
  const activeTasks = tasks.filter((task) => !["completed", "failed"].includes(task.NORMALIZED_STATUS));
  const fileToTasks = new Map();
  for (const task of activeTasks) {
    for (const file of task.FILES_LOCKED_LIST || []) {
      if (!fileToTasks.has(file)) fileToTasks.set(file, []);
      fileToTasks.get(file).push(task.ID || task.AGENT || "unknown");
    }
  }
  return Array.from(fileToTasks.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([file, owners]) => ({ file, owners }));
}

function syncLockedFilesDoc(tasks = parseActiveTasks()) {
  const locks = parseLockedFilesFromTasks(tasks);
  const lines = [
    "# Locked Files",
    "",
    `Last updated: ${nowIso()}`,
    "",
    "## Active Lock",
    "",
  ];

  if (locks.length === 0) {
    lines.push("None.");
  } else {
    for (const lock of locks) {
      lines.push(`- \`${lock.file}\` -> ${lock.owners.join(", ")}`);
    }
  }

  lines.push(
    "",
    "## Rules",
    "",
    "- This file is generated from pending tasks in `docs/ACTIVE_TASKS.md`.",
    "- Completed tasks do not keep locks.",
    "- Update task status or FILES_LOCKED entries before editing contested files.",
  );

  writeText("docs/LOCKED_FILES.md", `${lines.join("\n")}\n`);
  return locks;
}

function checkLocks(tasks = parseActiveTasks()) {
  const docContent = readText("docs/LOCKED_FILES.md");
  const activeLocks = parseLockedFilesFromTasks(tasks);
  const doneWithLocks = tasks
    .filter((task) => task.NORMALIZED_STATUS === "completed" && task.FILES_LOCKED_LIST.length > 0)
    .map((task) => ({
      taskId: task.ID || "unknown",
      files: task.FILES_LOCKED_LIST,
    }));

  const docHasNone = /\bNone\./.test(docContent);
  const inconsistencies = [];
  if (docHasNone && activeLocks.length > 0) {
    inconsistencies.push("LOCKED_FILES.md says None while pending tasks still lock files.");
  }
  for (const task of doneWithLocks) {
    inconsistencies.push(`Task ${task.taskId} is completed but still declares FILES_LOCKED.`);
  }

  return {
    activeLocks,
    doneWithLocks,
    inconsistencies,
    ok: inconsistencies.length === 0,
  };
}

function getBugReports() {
  const filePath = path.join(DATA_RUNTIME_DIR, "bug-reports.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data?.reports) ? data.reports : [];
  } catch {
    return [];
  }
}

function summarizeBugs() {
  const reports = getBugReports();
  const critical = reports.filter((report) => ["P0", "P1"].includes(report.severity));
  return {
    reports,
    critical,
  };
}

function readProjectStatus() {
  return readJson("runtime/project-status.json", {
    server: { status: "unknown" },
    build: { status: "unknown" },
    tests: { status: "unknown" },
    agents: [],
    tasks: [],
    bugs: [],
    telegram: { status: "unknown" },
    locks: { status: "unknown" },
    beta: { status: "unknown" },
    watchdog: { status: "unknown" },
    scheduler: { status: "stopped" },
    lastUpdated: null,
  });
}

function writeProjectStatus(snapshot, overrides = {}) {
  const existing = readProjectStatus();
  const bugSummary = summarizeBugs();
  const next = {
    ...existing,
    server: existing.server || { status: "unknown" },
    build: existing.build || { status: "unknown" },
    tests: existing.tests || { status: "unknown" },
    agents: snapshot.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      status: agent.status,
      mode: agent.mode,
      lastRun: agent.lastRun,
      pid: agent.activeProcess?.pid || agent.heartbeat?.pid || null,
      currentTask:
        agent.pendingTasks[0]?.ID ||
        agent.heartbeat?.currentTask ||
        agent.tasks[0]?.ID ||
        null,
      pendingTasks: agent.pendingTasks.length,
      documented: agent.documented,
      executable: agent.executable,
    })),
    tasks: snapshot.activeTasks.map((task) => ({
      id: task.ID || "unknown",
      agent: task.AGENT || "unassigned",
      status: task.NORMALIZED_STATUS,
      module: task.MODULE || "",
      nextStep: task.NEXT_STEP || "",
      filesLocked: task.FILES_LOCKED_LIST || [],
    })),
    bugs: bugSummary.reports.slice(0, 25),
    telegram: existing.telegram || { status: "unknown" },
    locks: existing.locks || { status: "unknown" },
    beta: existing.beta || { status: "unknown" },
    watchdog: existing.watchdog || { status: "unknown" },
    scheduler: existing.scheduler || { status: "stopped" },
    lastUpdated: nowIso(),
    ...overrides,
  };
  writeJson("runtime/project-status.json", next);
  return next;
}

function createAgentSummary(snapshot) {
  return snapshot.agents
    .map((agent) => {
      const processState = agent.activeProcess ? `running pid ${agent.activeProcess.pid}` : "none";
      return `| ${agent.id} | ${agent.status} | ${agent.mode} | ${processState} | ${agent.tasks.length} | ${agent.pendingTasks.length} |`;
    })
    .join("\n");
}

function createTaskSummary(tasks) {
  if (tasks.length === 0) return "| none | none | none | none | none |";
  return tasks
    .map((task) => `| ${task.ID || "unknown"} | ${task.AGENT || "unassigned"} | ${task.NORMALIZED_STATUS} | ${task.MODULE || ""} | ${task.NEXT_STEP || ""} |`)
    .join("\n");
}

function getRuntimeSnapshot() {
  ensureAbsoluteDir(RUNTIME_DIR);
  ensureAbsoluteDir(HEARTBEAT_DIR);
  ensureAbsoluteDir(path.join(ROOT, "docs", "agent-logs"));
  ensureAbsoluteDir(path.join(ROOT, "docs", "agent-reports"));
  const activeTasks = parseActiveTasks();
  const processMarkers = readProcessMarkers();
  const schedulerHeartbeat = readHeartbeat("scheduler");
  const schedulerActive = Boolean(schedulerHeartbeat?.pid && isPidActive(schedulerHeartbeat.pid));
  const validation = validateRuntime();
  const agents = AGENTS.map((agent) =>
    computeAgentRuntime(agent, {
      processMarkers,
      schedulerActive,
    }),
  );

  return {
    generatedAt: nowIso(),
    agents,
    activeTasks,
    ownership: parseOwnership(),
    processMarkers,
    activeProcesses: processMarkers.filter((marker) => marker.active),
    schedulerActive,
    validation,
  };
}

function writeRuntimeStatusReport(snapshot, extraSections = {}) {
  const missing = snapshot.validation.missing.length > 0 ? snapshot.validation.missing.map((file) => `- ${file}`).join("\n") : "- none";
  const invalidStatuses =
    snapshot.validation.invalidStatuses.length > 0
      ? snapshot.validation.invalidStatuses.map((file) => `- ${file}`).join("\n")
      : "- none";
  const activeProcesses =
    snapshot.activeProcesses.length > 0
      ? snapshot.activeProcesses.map((processMarker) => `- ${processMarker.agentId}: pid ${processMarker.pid}`).join("\n")
      : "- none";
  const staleProcesses =
    snapshot.processMarkers.filter((marker) => !marker.active).length > 0
      ? snapshot.processMarkers
          .filter((marker) => !marker.active)
          .map((marker) => `- ${marker.agentId}: stale marker ${marker.markerFile}`)
          .join("\n")
      : "- none";

  const report = `# Agent Runtime Status

Generated: ${snapshot.generatedAt}

## Runtime Truth Model

1. documented: folder and agent docs exist.
2. executable: runner-based commands exist.
3. scheduled: local scheduler heartbeat is alive.
4. running: a real process marker is active.
5. blocked: runtime detected an external or structural blocker.
6. completed: task evidence is complete for the current pass.
7. failed: validation or command execution failed.

Documentation does not mean an agent is actively working.

## Agent Status

| Agent | Status | Mode | Active process | Tasks | Pending tasks |
| --- | --- | --- | --- | ---: | ---: |
${createAgentSummary(snapshot)}

## Active Processes

${activeProcesses}

## Stale Process Markers

${staleProcesses}

## Tasks From docs/ACTIVE_TASKS.md

| ID | Agent | Status | Module | Next step |
| --- | --- | --- | --- | --- |
${createTaskSummary(snapshot.activeTasks)}

## Runtime Validation

Missing files:

${missing}

Invalid statuses:

${invalidStatuses}

## Manual Work Boundary

- The runtime is supervised and local.
- It does not create autonomous LLM workers.
- Product implementation still requires an explicit coding session.
- Telegram is optional and outside the local operations baseline.
`;

  const extras = Object.entries(extraSections)
    .map(([title, body]) => `\n## ${title}\n\n${body}\n`)
    .join("");

  writeText("docs/AGENT_RUNTIME_STATUS.md", `${report}${extras}`);
  return `${report}${extras}`;
}

function recordStatusLog(snapshot) {
  for (const agent of snapshot.agents) {
    appendAgentLog(
      agent.id,
      `status=${agent.status} mode=${agent.mode} activeProcess=${agent.activeProcess ? agent.activeProcess.pid : "none"} tasks=${agent.tasks.length}`,
    );
  }
}

function writeAgentReport(snapshot) {
  const stamp = snapshot.generatedAt.replace(/[:.]/g, "-");
  const reportPath = `docs/agent-reports/${stamp}-agent-report.md`;
  const pendingTasks = snapshot.activeTasks.filter((task) => task.NORMALIZED_STATUS !== "completed");
  const report = `# Agent Runtime Report

Generated: ${snapshot.generatedAt}

## Agents

| Agent | Role | Branch | Status | Mode | Active process |
| --- | --- | --- | --- | --- | --- |
${snapshot.agents
  .map((agent) => `| ${agent.name} | ${agent.role} | ${agent.branch} | ${agent.status} | ${agent.mode} | ${agent.activeProcess ? `pid ${agent.activeProcess.pid}` : "none"} |`)
  .join("\n")}

## Pending Tasks

${pendingTasks.length === 0 ? "No pending tasks in docs/ACTIVE_TASKS.md." : pendingTasks.map((task) => `- ${task.ID || "unknown"}: ${task.AGENT || "unassigned"} - ${task.NEXT_STEP || "No next step defined."}`).join("\n")}

## Ownership Entries

- Ownership blocks found: ${snapshot.ownership.length}
- Scheduler active: ${snapshot.schedulerActive ? "yes" : "no"}
- Active processes: ${snapshot.activeProcesses.length}
`;
  writeText(reportPath, report);
  return reportPath;
}

function printStatus(snapshot) {
  console.log("Agent runtime status");
  console.log(`Generated: ${snapshot.generatedAt}`);
  console.log("");
  for (const agent of snapshot.agents) {
    const processState = agent.activeProcess ? `running pid ${agent.activeProcess.pid}` : "no active process";
    console.log(
      `- ${agent.id}: status=${agent.status}; mode=${agent.mode}; ${processState}; tasks=${agent.tasks.length}; pending=${agent.pendingTasks.length}; lastRun=${agent.lastRun}`,
    );
  }
  console.log("");
  console.log(`Missing runtime files: ${snapshot.validation.missing.length}`);
  console.log(`Invalid status files: ${snapshot.validation.invalidStatuses.length}`);
  console.log(`Active processes: ${snapshot.activeProcesses.length}`);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: executionEnv(),
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  return {
    command: [command, ...args].join(" "),
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function runShellCommand(command, label) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: executionEnv(),
    maxBuffer: 1024 * 1024 * 20,
  });
  return {
    command: label ? `${label}: ${command}` : command,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function runPackageScript(scriptName, extraArgs = []) {
  const packageJson = JSON.parse(readText("package.json"));
  const script = packageJson.scripts && packageJson.scripts[scriptName];
  if (!script) {
    return {
      command: `package script "${scriptName}"`,
      status: 1,
      stdout: "",
      stderr: `Missing package script: ${scriptName}\n`,
      error: "missing package script",
    };
  }
  const command = `${script}${extraArgs.length > 0 ? ` ${extraArgs.join(" ")}` : ""}`;
  return runShellCommand(command, `package script "${scriptName}"`);
}

function parseCliArgs(args) {
  const values = { _: [] };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      values._.push(arg);
      continue;
    }
    const [key, inlineValue] = arg.slice(2).split("=");
    if (inlineValue !== undefined) {
      values[key] = inlineValue;
      continue;
    }
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      values[key] = true;
      continue;
    }
    values[key] = next;
    index += 1;
  }
  return values;
}

function sanitizeText(value, limit = 400) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

module.exports = {
  AGENTS,
  DATA_RUNTIME_DIR,
  HEARTBEAT_DIR,
  ROOT,
  RUNTIME_DIR,
  VALID_MODES,
  VALID_STATUSES,
  appendAgentLog,
  absolutePath,
  checkLocks,
  closeProcessMarker,
  createProcessMarker,
  ensureDir,
  executionEnv,
  fileExists,
  findAgent,
  getBugReports,
  getRuntimeSnapshot,
  getTasksForAgent,
  nowIso,
  parseActiveTasks,
  parseCliArgs,
  parseLockedFilesFromTasks,
  printStatus,
  readHeartbeat,
  readJson,
  readProjectStatus,
  readText,
  recordStatusLog,
  relativePath,
  runCommand,
  runPackageScript,
  runShellCommand,
  sanitizeText,
  setAgentStatus,
  sleep,
  summarizeBugs,
  syncLockedFilesDoc,
  validateRuntime,
  writeAgentOutput,
  writeAgentReport,
  writeHeartbeat,
  writeJson,
  writeProjectStatus,
  writeRuntimeStatusReport,
  writeText,
};
