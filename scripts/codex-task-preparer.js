#!/usr/bin/env node
const { ensureRuntimeDirs, nowIso, readJson, taskFromFinding, writeJson, writeText } = require("./autonomous-lib.js");

function loadQueue() {
  return readJson("runtime/codex-queue/tasks.json", {
    updatedAt: nowIso(),
    policy: "one_codex_task_per_cycle",
    codexDirectExecution: false,
    tasks: [],
  });
}

function taskMatchesFinding(task, finding) {
  return task.severity === finding.severity && task.module === finding.module && task.reason === finding.reason;
}

function findingKey(item) {
  return `${item.severity}|${item.module}|${item.reason}`;
}

function reconcileStaleTasks(queue, classification) {
  const activeFindings = [...(classification.p0 || []), ...(classification.p1 || [])];
  const activeKeys = new Set(activeFindings.map(findingKey));
  let blocked = 0;

  for (const task of queue.tasks) {
    if (!["P0", "P1"].includes(task.severity)) continue;
    if (task.status !== "pending") continue;
    if (activeKeys.has(findingKey(task))) continue;

    task.status = "blocked";
    task.blockedReason = "SUPERSEDED_BY_CURRENT_CLASSIFICATION";
    task.blockedAt = nowIso();
    task.updatedAt = nowIso();
    blocked += 1;
  }

  return blocked;
}

function selectFinding(classification) {
  const p0 = classification.p0 || [];
  if (p0.length > 0) return p0[0];
  return (classification.p1 || []).find((finding) => finding.affectsBetaStable !== false) || null;
}

function blockedByExternalCondition(task) {
  return /network|credential|credencial/i.test(String(task.blockedReason || task.evidence || ""));
}

function promptForTask(task, note = "") {
  if (!task) {
    return `# Next Codex Task

Generated: ${nowIso()}

${note ? `${note}\n\n` : ""}No retriable P0/P1 beta-affecting task is pending. Do not execute Codex GPT-5.5 for P2 backlog.
`;
  }

  return `# Next Codex Task

Generated: ${nowIso()}

## Task

- id: ${task.id}
- severity: ${task.severity}
- module: ${task.module}
- branch: ${task.branchName}
- recommended agent: ${task.recommendedAgent}

## Reason

${task.reason}

## Evidence

${task.evidence}

## Required Operating Rules

- Take only this task in the current cycle.
- Create or use branch ${task.branchName}; never modify main directly.
- Do not force push.
- Do not commit secrets or runtime logs.
- Do not run Prisma migrations unless this task explicitly requires it and checks pass.
- Run pre-checks before implementation and post-checks after implementation.
- If checks fail, document the failure and stop.

## Allowed Files

${task.allowedFiles.map((file) => `- ${file}`).join("\n")}

## Forbidden Files

${task.forbiddenFiles.map((file) => `- ${file}`).join("\n")}

## Pre-checks

${task.preChecks.map((check) => `- ${check}`).join("\n")}

## Post-checks

${task.postChecks.map((check) => `- ${check}`).join("\n")}
`;
}

function main() {
  ensureRuntimeDirs();
  const classification = readJson("runtime/tasks/classification-latest.json", { p0: [], p1: [], p2: [] });
  const queue = loadQueue();
  queue.codexDirectExecution = false;
  queue.policy = "one_codex_task_per_cycle";
  queue.tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  const staleTasksBlocked = reconcileStaleTasks(queue, classification);

  const finding = selectFinding(classification);
  let selectedTask = null;
  let created = false;
  let suppressedReason = "";

  if (finding) {
    selectedTask = queue.tasks.find((task) => ["pending", "running", "blocked"].includes(task.status) && taskMatchesFinding(task, finding));
    if (!selectedTask) {
      selectedTask = taskFromFinding(finding, queue.tasks);
      queue.tasks.push(selectedTask);
      created = true;
    } else {
      const fresh = taskFromFinding(finding, queue.tasks);
      const canReactivate = selectedTask.status === "blocked" && !blockedByExternalCondition(selectedTask);
      Object.assign(selectedTask, {
        severity: fresh.severity,
        module: fresh.module,
        reason: fresh.reason,
        evidence: fresh.evidence,
        recommendedAgent: fresh.recommendedAgent,
        allowedFiles: fresh.allowedFiles,
        forbiddenFiles: fresh.forbiddenFiles,
        preChecks: fresh.preChecks,
        postChecks: fresh.postChecks,
        status: canReactivate ? "pending" : selectedTask.status,
        requiresHumanApproval: fresh.requiresHumanApproval,
        branchName: selectedTask.branchName || fresh.branchName,
        requiresReviewBeforeMerge: true,
        updatedAt: nowIso(),
      });
      if (canReactivate) {
        delete selectedTask.blockedReason;
        delete selectedTask.blockedAt;
      }
      if (selectedTask.status === "blocked" && blockedByExternalCondition(selectedTask)) {
        suppressedReason = `Current finding matches task ${selectedTask.id}, but it is blocked by network or credential evidence. Policy prevents retry until the external condition changes.`;
        selectedTask = null;
      }
    }
  }

  queue.updatedAt = nowIso();
  writeJson("runtime/codex-queue/tasks.json", queue);
  writeText("runtime/codex-queue/next-codex-prompt.md", promptForTask(selectedTask, suppressedReason));

  const result = {
    generatedAt: nowIso(),
    codexDirectExecution: false,
    selectedTaskId: selectedTask?.id || null,
    created,
    staleTasksBlocked,
    suppressedExternalBlockedTask: Boolean(suppressedReason),
    reason: selectedTask ? selectedTask.reason : suppressedReason || "No P0/P1 beta-affecting task.",
    prompt: "runtime/codex-queue/next-codex-prompt.md",
  };
  writeJson("runtime/codex-queue/latest-preparer-result.json", result);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
