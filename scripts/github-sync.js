#!/usr/bin/env node
const {
  ensureOpsDirs,
  forbiddenRuntimePath,
  getGitStatus,
  getGitSyncStatus,
  nowIso,
  readJson,
  runShell,
  writeJson,
} = require("./autonomous-ops-lib.js");

const COOLDOWN_MS = 6 * 60 * 60 * 1000;

function cooldownActive(lastAttemptAt) {
  if (!lastAttemptAt) return false;
  const timestamp = Date.parse(lastAttemptAt);
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp < COOLDOWN_MS;
}

function committedFilesSinceUpstream(sync) {
  if (!sync.upstreamConfigured) {
    const result = runShell("git diff-tree --no-commit-id --name-only -r HEAD", { timeoutMs: 30000 });
    return result.status === 0 ? result.stdout.split(/\r?\n/).filter(Boolean) : [];
  }

  const result = runShell("git diff --name-only @{upstream}..HEAD", { timeoutMs: 30000 });
  return result.status === 0 ? result.stdout.split(/\r?\n/).filter(Boolean) : [];
}

function main() {
  ensureOpsDirs();
  const previous = readJson("runtime/github-sync/state.json", {});
  const status = getGitStatus();
  const sync = getGitSyncStatus();
  const result = {
    generatedAt: nowIso(),
    cooldownHours: 6,
    branch: sync.branch,
    status: null,
    detail: null,
    pushAttempted: false,
    pushStatus: null,
  };

  if (cooldownActive(previous.lastAttemptAt)) {
    result.status = "SKIPPED_COOLDOWN";
    result.detail = `lastAttemptAt=${previous.lastAttemptAt}`;
    writeJson("runtime/github-sync/state.json", { ...previous, lastResult: result });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (status.dirty) {
    result.status = "WORKTREE_DIRTY_NO_PUSH";
    result.detail = `${status.dirtyCount} dirty entries`;
    writeJson("runtime/github-sync/state.json", { ...previous, lastResult: result });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (sync.upstreamConfigured && !sync.pushPending) {
    result.status = "SKIPPED_NO_COMMITS";
    result.detail = sync.detail;
    writeJson("runtime/github-sync/state.json", { ...previous, lastResult: result });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const committedFiles = committedFilesSinceUpstream(sync);
  const forbiddenFiles = committedFiles.filter(forbiddenRuntimePath);
  if (forbiddenFiles.length > 0) {
    result.status = "BLOCKED_FORBIDDEN_FILES";
    result.detail = forbiddenFiles.join(", ");
    writeJson("runtime/github-sync/state.json", { ...previous, lastResult: result });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const pushCommand = sync.upstreamConfigured ? "git push origin HEAD" : "git push -u origin HEAD";
  const push = runShell(pushCommand, { timeoutMs: 120000 });
  result.pushAttempted = true;
  result.pushStatus = push.status;
  result.status = push.status === 0 ? "PUSHED" : "GITHUB_PUSH_BLOCKED_BY_NETWORK";
  result.detail = push.status === 0 ? push.stdout : `${push.stderr}\n${push.error}`.trim();

  writeJson("runtime/github-sync/state.json", {
    lastAttemptAt: nowIso(),
    lastResult: result,
  });
  console.log(JSON.stringify(result, null, 2));
}

main();
