#!/usr/bin/env node
const {
  ensureOpsDirs,
  getCurrentBranch,
  getGitStatus,
  nowIso,
  runShell,
  writeJson,
} = require("./autonomous-ops-lib.js");

function argValue(name, fallback) {
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split("=").slice(1).join("=");
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function main() {
  ensureOpsDirs();
  const requestedName = argValue("name", "codex/P1-autonomous-ops");
  const allowDirtyWip = process.argv.includes("--allow-dirty-wip");
  const status = getGitStatus();
  const currentBranch = getCurrentBranch();
  const report = {
    generatedAt: nowIso(),
    requestedName,
    currentBranch,
    dirty: status.dirty,
    createdOrSwitched: false,
    status: null,
    detail: null,
  };

  if (!requestedName.startsWith("codex/")) {
    report.status = "BLOCKED_INVALID_BRANCH_NAME";
    report.detail = "Automation branches must start with codex/.";
    writeJson("runtime/decisions/branch-manager-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  if (currentBranch === "main" || currentBranch === "master") {
    report.detail = "Current branch is protected; manager will create a task branch only.";
  }

  if (status.dirty && !allowDirtyWip) {
    report.status = "WORKTREE_DIRTY_NO_BRANCH_SWITCH";
    report.detail = "Dirty worktree detected. Use --allow-dirty-wip only for an explicit WIP task branch.";
    writeJson("runtime/decisions/branch-manager-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const exists = runShell(`git branch --list ${requestedName}`, { timeoutMs: 15000 });
  const command = exists.stdout.trim() ? `git switch ${requestedName}` : `git switch -c ${requestedName}`;
  const result = runShell(command, { timeoutMs: 30000 });
  report.createdOrSwitched = result.status === 0;
  report.status = result.status === 0 ? "READY" : "FAILED";
  report.detail = result.status === 0 ? result.stdout || result.stderr : `${result.stderr}\n${result.error}`.trim();
  writeJson("runtime/decisions/branch-manager-latest.json", report);
  console.log(JSON.stringify(report, null, 2));
  if (result.status !== 0) process.exit(1);
}

main();
