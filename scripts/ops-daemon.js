#!/usr/bin/env node
const fs = require("node:fs");
const {
  ensureRuntimeDirs,
  nowIso,
  readJson,
  runShell,
  writeJson,
  writeText,
} = require("./autonomous-lib.js");

const DEFAULT_INTERVAL_MS = 30 * 60 * 1000;
const LOCK_FILE = "runtime/autonomous/ops-daemon.lock";

function hasArg(name) {
  return process.argv.includes(name);
}

function argValue(name, fallback) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return fallback;
  const value = Number(found.slice(prefix.length));
  return Number.isFinite(value) ? value : fallback;
}

function lockIsFresh(lock) {
  if (!lock?.createdAt) return false;
  const ageMs = Date.now() - Date.parse(lock.createdAt);
  return Number.isFinite(ageMs) && ageMs < 2 * 60 * 60 * 1000;
}

function acquireLock() {
  const existing = readJson(LOCK_FILE, null);
  if (lockIsFresh(existing)) return false;
  writeJson(LOCK_FILE, { createdAt: nowIso(), pid: process.pid });
  return true;
}

function releaseLock() {
  try {
    fs.unlinkSync(LOCK_FILE);
  } catch {
    // Lock cleanup is best effort only.
  }
}

function step(name, command) {
  const result = runShell(command, { timeoutMs: 180000 });
  return { name, ...result };
}

function classificationHasCodexWork(classification) {
  return (classification.p0 || []).length > 0 || (classification.p1 || []).some((finding) => finding.affectsBetaStable !== false);
}

function classificationHasLocalModelWork(classification) {
  return (classification.p2 || []).some((finding) => finding.localModelEligible);
}

async function runCycle() {
  ensureRuntimeDirs();
  const steps = [];
  steps.push(step("watchdog", "node scripts/watchdog.js"));
  steps.push(step("classifier", "node scripts/task-classifier.js"));

  const classification = readJson("runtime/tasks/classification-latest.json", { p0: [], p1: [], p2: [] });
  steps.push(step("safe-autofix", "node scripts/safe-autofix.js --apply"));

  if (classificationHasCodexWork(classification)) {
    steps.push(step("codex-task-preparer", "node scripts/codex-task-preparer.js"));
  } else {
    steps.push({
      name: "codex-task-preparer",
      command: "node scripts/codex-task-preparer.js",
      status: "skipped",
      detail: "No P0/P1 beta-affecting finding.",
    });
  }

  if (classificationHasLocalModelWork(classification)) {
    steps.push(step("local-model-runner", "node scripts/local-model-runner.js"));
  } else {
    steps.push({
      name: "local-model-runner",
      command: "node scripts/local-model-runner.js",
      status: "skipped",
      detail: "No local-model eligible P2 finding.",
    });
  }

  const report = {
    generatedAt: nowIso(),
    steps,
    codexQueuePrepared: steps.some((item) => item.name === "codex-task-preparer" && item.status === 0),
    localModelChecked: steps.some((item) => item.name === "local-model-runner" && item.status === 0),
    codexDirectExecution: false,
    finishedAt: nowIso(),
  };
  writeJson("runtime/autonomous/daemon-latest.json", report);
  writeText(
    "runtime/autonomous/daemon-latest.md",
    `# Autonomous Ops Daemon

Generated: ${report.generatedAt}

- Codex direct execution: NO
- Codex queue prepared: ${report.codexQueuePrepared ? "YES" : "NO"}
- Local model checked: ${report.localModelChecked ? "YES" : "NO"}

## Steps

${steps.map((item) => `- ${item.name}: ${item.status}`).join("\n")}
`,
  );

  process.stdout.write(`${JSON.stringify({ generatedAt: report.generatedAt, codexDirectExecution: false, steps: steps.map((item) => [item.name, item.status]) }, null, 2)}\n`);
  return report;
}

async function main() {
  const watch = hasArg("--watch");
  const intervalMs = argValue("--interval-ms", DEFAULT_INTERVAL_MS);
  do {
    if (!acquireLock()) {
      console.log("Ops daemon skipped: fresh lock exists.");
      return;
    }
    try {
      await runCycle();
    } finally {
      releaseLock();
    }
    if (!watch) break;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (watch);
}

main().catch((error) => {
  releaseLock();
  console.error(error.stack || error.message);
  process.exit(1);
});
