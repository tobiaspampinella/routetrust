#!/usr/bin/env node
const { ensureRuntimeDirs, getGitAheadBehind, getGitStatus, getTrackedForbiddenFiles, nowIso, readJson, runShell, writeJson } = require("./autonomous-lib.js");

const COOLDOWN_MS = 6 * 60 * 60 * 1000;

function withinCooldown(lastAttemptAt) {
  if (!lastAttemptAt) return false;
  const timestamp = Date.parse(lastAttemptAt);
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp < COOLDOWN_MS;
}

function main() {
  ensureRuntimeDirs();
  const previous = readJson("runtime/github-sync/state.json", {});
  const force = process.argv.includes("--force");

  let status = "UNKNOWN";
  let detail = "";
  let push = null;

  if (!force && withinCooldown(previous.lastAttemptAt)) {
    status = "SKIPPED_COOLDOWN";
    detail = "Last push attempt was less than 6 hours ago.";
  } else {
    const forbidden = getTrackedForbiddenFiles();
    const gitStatus = getGitStatus();
    const sync = getGitAheadBehind();

    if (forbidden.length > 0) {
      status = "BLOCKED_FORBIDDEN_TRACKED_FILES";
      detail = forbidden.join(", ");
    } else if (gitStatus.dirty) {
      status = "WORKTREE_DIRTY_NO_PUSH";
      detail = `${gitStatus.changedCount} changed or untracked entries.`;
    } else if (!sync.configured || !sync.pushPending) {
      status = "SKIPPED_NO_COMMITS";
      detail = sync.detail;
    } else {
      push = runShell("git push origin HEAD", { timeoutMs: 120000 });
      status = push.status === 0 ? "PUSHED" : "GITHUB_PUSH_BLOCKED_BY_NETWORK";
      detail = push.status === 0 ? "git push origin HEAD completed." : push.stderr || push.stdout || push.error;
    }
  }

  const state = {
    generatedAt: nowIso(),
    lastAttemptAt: status.startsWith("SKIPPED_COOLDOWN") ? previous.lastAttemptAt : nowIso(),
    cooldownHours: 6,
    status,
    detail,
    push,
  };
  writeJson("runtime/github-sync/state.json", state);
  process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
}

main();
