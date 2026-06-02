#!/usr/bin/env node
const {
  ensureOpsDirs,
  nowIso,
  readJson,
  runShell,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

function runStep(name, command, timeoutMs = 180000) {
  const startedAt = nowIso();
  const result = runShell(command, { timeoutMs });
  return {
    name,
    command,
    startedAt,
    finishedAt: nowIso(),
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
  };
}

function hasCodexEligibleTasks(classification) {
  return (classification.findings || []).some((finding) => finding.severity === "P0" || (finding.severity === "P1" && finding.affectsBetaStable));
}

function writeDaemonReport(report) {
  const codexStep = report.steps.find((step) => step.name === "codex-task-runner");
  const lines = [
    "# Autonomous Ops Daemon Report",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Watchdog: ${report.steps.find((step) => step.name === "watchdog")?.status ?? "not_run"}`,
    `- Classifier: ${report.steps.find((step) => step.name === "classifier")?.status ?? "not_run"}`,
    `- Safe autofix: ${report.steps.find((step) => step.name === "safe-autofix")?.status ?? "not_run"}`,
    `- Codex queue prepared: ${report.codexQueuePrepared ? "YES" : "NO"}`,
    `- Local model checked: ${report.localModelChecked ? "YES" : "NO"}`,
    `- Codex direct execution: ${report.codexDirectExecution ? "YES" : "NO"}`,
    `- Codex runner: ${codexStep?.status ?? "not_run"}`,
    "",
    "## Limits",
    "",
    "- Codex execution is real when CODEX_AUTORUN=1 or --run-codex is supplied.",
    "- The default 30 minute watchdog cycle keeps Codex disabled unless explicitly enabled.",
    "- This daemon does not commit or push code.",
    "- GitHub sync is a separate command with a 6 hour cooldown.",
    "- Full validation belongs to preflight/post-change checks, not the 30 minute watchdog.",
  ];
  writeText("runtime/autonomous/daemon-latest.md", `${lines.join("\n")}\n`);
}

function main() {
  ensureOpsDirs();
  const codexAutorun = process.env.CODEX_AUTORUN === "1" || process.argv.includes("--run-codex");
  const report = {
    generatedAt: nowIso(),
    steps: [],
    codexQueuePrepared: false,
    localModelChecked: false,
    codexDirectExecution: codexAutorun,
  };

  report.steps.push(runStep("watchdog", "node scripts/watchdog.js"));
  report.steps.push(runStep("classifier", "node scripts/task-classifier.js"));
  report.steps.push(runStep("safe-autofix", "node scripts/safe-autofix.js --apply"));

  const classification = readJson("runtime/decisions/classification-latest.json", { findings: [] });
  if (hasCodexEligibleTasks(classification)) {
    report.steps.push(runStep("codex-task-preparer", "node scripts/codex-task-preparer.js"));
    report.codexQueuePrepared = true;
    if (codexAutorun) {
      report.steps.push(runStep("codex-task-runner", "node scripts/codex-task-runner.js", 60 * 60 * 1000));
    } else {
      report.steps.push({
        name: "codex-task-runner",
        command: "node scripts/codex-task-runner.js",
        status: "skipped",
        detail: "Real Codex execution is available but not enabled for this daemon cycle.",
      });
    }
  } else {
    report.steps.push({
      name: "codex-task-preparer",
      command: "node scripts/codex-task-preparer.js",
      status: "skipped",
      detail: "No P0/P1 beta-affecting finding.",
    });
  }

  if ((classification.p2 || []).length > 0) {
    report.steps.push(runStep("local-model-runner", "node scripts/local-model-runner.js"));
    report.localModelChecked = true;
  } else {
    report.steps.push({
      name: "local-model-runner",
      command: "node scripts/local-model-runner.js",
      status: "skipped",
      detail: "No P2 local-model task.",
    });
  }

  report.finishedAt = nowIso();
  writeJson("runtime/autonomous/daemon-latest.json", report);
  writeDaemonReport(report);
  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    steps: report.steps.map((step) => ({ name: step.name, status: step.status })),
    codexQueuePrepared: report.codexQueuePrepared,
    localModelChecked: report.localModelChecked,
    codexDirectExecution: report.codexDirectExecution,
  }, null, 2));
}

main();
