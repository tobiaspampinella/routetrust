#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const {
  ROOT,
  ensureOpsDirs,
  getCurrentBranch,
  getGitStatus,
  nowIso,
  readJson,
  runPackageScript,
  runShell,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const SEVERITY_RANK = { P0: 0, P1: 1 };

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function argValue(name, fallback) {
  const inline = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split("=").slice(1).join("=");
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

function commandEnv() {
  const localBin = path.join(ROOT, "node_modules", ".bin");
  const pathValue = process.env.PATH || process.env.Path || "";
  return {
    ...process.env,
    PATH: [localBin, path.dirname(process.execPath), pathValue].filter(Boolean).join(path.delimiter),
  };
}

function nextTask(queue) {
  return (queue.tasks || [])
    .filter((task) => task.status === "pending" && Object.prototype.hasOwnProperty.call(SEVERITY_RANK, task.severity))
    .sort((left, right) => SEVERITY_RANK[left.severity] - SEVERITY_RANK[right.severity])
    [0] || null;
}

function updateTask(queue, taskId, patch) {
  return {
    ...queue,
    updatedAt: nowIso(),
    tasks: (queue.tasks || []).map((task) => (task.id === taskId ? { ...task, ...patch } : task)),
  };
}

function slug(value) {
  return String(value || "task")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "task";
}

function ensureTaskBranch(task) {
  const currentBranch = getCurrentBranch();
  if (currentBranch !== "main" && currentBranch !== "master") {
    return { status: 0, branch: currentBranch, detail: "using_current_branch" };
  }

  const branch = `codex/${task.id.toLowerCase()}-${slug(task.reason)}`;
  const exists = runShell(`git branch --list ${branch}`, { timeoutMs: 15000 });
  const command = exists.stdout.trim() ? `git switch ${branch}` : `git switch -c ${branch}`;
  const result = runShell(command, { timeoutMs: 30000 });
  return {
    status: result.status,
    branch,
    detail: result.status === 0 ? "ready" : result.stderr || result.error,
  };
}

function runChecks(commands, stage) {
  const results = [];
  for (const command of commands || []) {
    const script = command.replace(/^npm run\s+/, "").replace(/^npm test$/, "test");
    const result = script === "test"
      ? runPackageScript("test", { timeoutMs: 300000 })
      : runShell(command, { timeoutMs: stage === "post" && /build|beta-check|qa:smoke/.test(command) ? 600000 : 300000 });
    results.push({ command, status: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error });
    if (result.status !== 0) break;
  }
  return results;
}

function codexCommand(promptFile, outputFile, model) {
  const args = [
    "exec",
    "--cd",
    ROOT,
    "--sandbox",
    "danger-full-access",
    "--ask-for-approval",
    "never",
    "--output-last-message",
    outputFile,
  ];
  if (model) args.push("--model", model);
  args.push("-");

  const prompt = fs.readFileSync(promptFile, "utf8");
  const result = spawnSync("codex", args, {
    cwd: ROOT,
    shell: true,
    input: prompt,
    encoding: "utf8",
    env: commandEnv(),
    timeout: Number(process.env.CODEX_TASK_TIMEOUT_MS || 45 * 60 * 1000),
    maxBuffer: 1024 * 1024 * 50,
  });

  return {
    command: `codex ${args.map((arg) => (arg === ROOT ? "<repo>" : arg)).join(" ")}`,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function renderCodexPrompt(task) {
  return `You are running as the RouteTrust Codex task executor.

Execute exactly one task and then stop.

Task:
\`\`\`json
${JSON.stringify(task, null, 2)}
\`\`\`

Rules:
- Work in the current repository only.
- You may modify core source files when the task requires it.
- Do not modify .env files, production secrets, private keys, certificates, or credential material.
- Do not force push.
- Do not merge to main.
- Do not create broad unrelated refactors.
- Prefer the repository's existing patterns.
- Run targeted validation while working.
- Do not commit; the runner handles the commit after postchecks pass.

Expected output:
- Summary of files changed.
- Tests/checks run.
- Any blocker that prevented completion.
`;
}

function changedFiles() {
  const result = runShell("git status --short", { timeoutMs: 15000 });
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

function forbiddenChangedFiles(files) {
  return files.filter((file) => (
    /^\.env($|\.|\/|\\)/.test(file) ||
    /(^|[\\/])private($|[\\/])/.test(file) ||
    /\.(pem|key|p12|cer|crt)$/i.test(file)
  ));
}

function commitTask(task) {
  const files = changedFiles();
  if (files.length === 0) return { status: "NO_CHANGES", detail: "Codex completed without file changes." };

  const forbidden = forbiddenChangedFiles(files);
  if (forbidden.length > 0) {
    return { status: "BLOCKED_FORBIDDEN_FILES", detail: forbidden.join(", ") };
  }

  const add = runShell("git add -A", { timeoutMs: 30000 });
  if (add.status !== 0) return { status: "GIT_ADD_FAILED", detail: add.stderr || add.error };

  const message = `fix: ${task.reason}`;
  const commit = runShell(`git commit -m "${message.replace(/"/g, "'")}"`, { timeoutMs: 120000 });
  return {
    status: commit.status === 0 ? "COMMITTED" : "COMMIT_FAILED",
    detail: commit.status === 0 ? commit.stdout : commit.stderr || commit.error,
  };
}

function main() {
  ensureOpsDirs();
  const dryRun = hasArg("dry-run");
  const skipPrecheck = hasArg("skip-precheck");
  const skipPostcheck = hasArg("skip-postcheck");
  const skipCommit = hasArg("skip-commit");
  const model = argValue("model", process.env.CODEX_TASK_MODEL || null);
  const startedAt = nowIso();
  let queue = readJson("runtime/codex-queue/tasks.json", { updatedAt: null, tasks: [] });
  const task = nextTask(queue);
  const report = {
    generatedAt: startedAt,
    dryRun,
    taskId: task?.id || null,
    taskReason: task?.reason || null,
    codexDirectExecution: !dryRun,
    status: null,
    branch: getCurrentBranch(),
    steps: [],
  };

  if (!task) {
    report.status = "NO_PENDING_CODEX_TASK";
    writeJson("runtime/codex-queue/runner-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const status = getGitStatus();
  if (status.dirty && !hasArg("allow-dirty")) {
    report.status = "WORKTREE_DIRTY_BLOCKED";
    report.steps.push({ name: "git_status", status: 1, detail: `${status.dirtyCount} dirty entries` });
    writeJson("runtime/codex-queue/runner-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const branch = ensureTaskBranch(task);
  report.branch = branch.branch;
  report.steps.push({ name: "task_branch", status: branch.status, detail: branch.detail });
  if (branch.status !== 0) {
    report.status = "BRANCH_FAILED";
    writeJson("runtime/codex-queue/runner-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  if (dryRun) {
    report.status = "DRY_RUN_READY";
    report.promptPreview = renderCodexPrompt(task).slice(0, 2000);
    writeJson("runtime/codex-queue/runner-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  queue = updateTask(queue, task.id, { status: "running", startedAt });
  writeJson("runtime/codex-queue/tasks.json", queue);

  if (!skipPrecheck) {
    const pre = runChecks(task.preChecks || [], "pre");
    report.steps.push({ name: "prechecks", status: pre.every((entry) => entry.status === 0) ? 0 : 1, results: pre.map((entry) => ({ command: entry.command, status: entry.status })) });
    if (pre.some((entry) => entry.status !== 0)) {
      report.status = "PRECHECK_FAILED";
      queue = updateTask(queue, task.id, { status: "failed", failedAt: nowIso(), failureReason: "PRECHECK_FAILED" });
      writeJson("runtime/codex-queue/tasks.json", queue);
      writeJson("runtime/codex-queue/runner-latest.json", report);
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
  }

  const promptFile = `runtime/codex-queue/${task.id}-prompt.md`;
  const outputFile = `runtime/codex-queue/${task.id}-codex-output.md`;
  writeText(promptFile, renderCodexPrompt(task));
  const codex = codexCommand(path.join(ROOT, promptFile), path.join(ROOT, outputFile), model);
  report.steps.push({ name: "codex_exec", status: codex.status, command: codex.command, outputFile, stderr: codex.stderr.slice(0, 4000), error: codex.error });

  if (codex.status !== 0) {
    report.status = "CODEX_EXEC_FAILED";
    queue = updateTask(queue, task.id, { status: "failed", failedAt: nowIso(), failureReason: "CODEX_EXEC_FAILED" });
    writeJson("runtime/codex-queue/tasks.json", queue);
    writeJson("runtime/codex-queue/runner-latest.json", report);
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  if (!skipPostcheck) {
    const post = runChecks(task.postChecks || [], "post");
    report.steps.push({ name: "postchecks", status: post.every((entry) => entry.status === 0) ? 0 : 1, results: post.map((entry) => ({ command: entry.command, status: entry.status })) });
    if (post.some((entry) => entry.status !== 0)) {
      report.status = "POSTCHECK_FAILED";
      queue = updateTask(queue, task.id, { status: "failed", failedAt: nowIso(), failureReason: "POSTCHECK_FAILED" });
      writeJson("runtime/codex-queue/tasks.json", queue);
      writeJson("runtime/codex-queue/runner-latest.json", report);
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
  }

  if (!skipCommit) {
    const commit = commitTask(task);
    report.steps.push({ name: "commit", status: commit.status, detail: commit.detail });
    if (commit.status !== "COMMITTED" && commit.status !== "NO_CHANGES") {
      report.status = commit.status;
      queue = updateTask(queue, task.id, { status: "failed", failedAt: nowIso(), failureReason: commit.status });
      writeJson("runtime/codex-queue/tasks.json", queue);
      writeJson("runtime/codex-queue/runner-latest.json", report);
      console.log(JSON.stringify(report, null, 2));
      process.exit(1);
    }
  }

  report.status = "DONE";
  report.finishedAt = nowIso();
  queue = updateTask(queue, task.id, { status: "done", finishedAt: report.finishedAt });
  writeJson("runtime/codex-queue/tasks.json", queue);
  writeJson("runtime/codex-queue/runner-latest.json", report);
  console.log(JSON.stringify(report, null, 2));
}

main();
