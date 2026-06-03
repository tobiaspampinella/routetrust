#!/usr/bin/env node
const { ensureRuntimeDirs, getGitStatus, nowIso, readJson, runShell, slugify, writeJson } = require("./autonomous-lib.js");

const SAFE_BRANCH_PATTERN = /^(codex|agent|stabilization|implementation)\/[A-Za-z0-9._/-]+$/;

function requestedTask() {
  const idArg = process.argv.find((arg) => arg.startsWith("--task-id="));
  const taskId = idArg ? idArg.slice("--task-id=".length) : null;
  const queue = readJson("runtime/codex-queue/tasks.json", { tasks: [] });
  const tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  if (taskId) return tasks.find((task) => task.id === taskId) || null;
  const latest = readJson("runtime/codex-queue/latest-preparer-result.json", {});
  if (latest.selectedTaskId) {
    const selected = tasks.find((task) => task.id === latest.selectedTaskId && ["pending", "running", "blocked"].includes(task.status));
    if (selected) return selected;
  }
  return tasks.find((task) => task.status === "pending") || null;
}

function main() {
  ensureRuntimeDirs();
  const task = requestedTask();
  const status = getGitStatus();
  let result;

  if (!task) {
    result = {
      generatedAt: nowIso(),
      status: "NO_PENDING_TASK",
      branch: null,
      detail: "No pending Codex task was found.",
    };
  } else if (status.dirty && !process.argv.includes("--allow-dirty")) {
    result = {
      generatedAt: nowIso(),
      status: "WORKTREE_DIRTY_NO_BRANCH",
      branch: task.branchName,
      detail: "Worktree is dirty. Branch manager will not mix tasks unless --allow-dirty is explicitly passed.",
      changedCount: status.changedCount,
      changedPreview: status.entries,
    };
  } else {
    const branch = task.branchName || `codex/${task.severity}-${slugify(task.module)}-${slugify(task.reason)}`;
    if (!SAFE_BRANCH_PATTERN.test(branch) || branch.includes("..") || branch.endsWith("/") || branch.includes("//")) {
      result = {
        generatedAt: nowIso(),
        status: "UNSAFE_BRANCH_NAME",
        branch,
        detail: "Branch name failed the safe automation branch policy.",
      };
    } else {
      const create = runShell(`git switch -c ${branch}`, { timeoutMs: 30000 });
      result = {
        generatedAt: nowIso(),
        status: create.status === 0 ? "BRANCH_CREATED" : "BRANCH_CREATE_FAILED",
        branch,
        detail: create.status === 0 ? "Branch created." : create.stderr || create.stdout || create.error,
        command: create.command,
      };
    }
  }

  writeJson("runtime/reports/branch-manager-latest.json", result);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
