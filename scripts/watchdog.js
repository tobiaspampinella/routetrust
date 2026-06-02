#!/usr/bin/env node
const fs = require("node:fs");
const {
  absolutePath,
  classifyWatchdog,
  detectDocker,
  ensureOpsDirs,
  getDatabaseSignal,
  getGitRemote,
  getGitStatus,
  getGitSyncStatus,
  httpHealthCheck,
  markdownCommandResult,
  nowIso,
  readProjectStatus,
  runCheapSecretScan,
  runPackageScript,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

function betaCheckPolicyResult() {
  if (process.env.WATCHDOG_ALLOW_HEAVY === "1") {
    return runPackageScript("beta-check", { timeoutMs: 300000 });
  }

  return runPackageScript("beta-check", { args: ["--cheap"], timeoutMs: 120000 });
}

function commandSummary(result) {
  if (result.skipped) {
    return {
      command: result.command,
      status: "skipped",
      reason: result.reason,
      detail: result.detail,
    };
  }

  return {
    command: result.command,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
    timedOut: Boolean(result.timedOut),
  };
}

function writeWatchdogReport(watchdog, classification) {
  const p0 = classification.p0.map((finding) => `- ${finding.module}: ${finding.reason} (${finding.evidence})`);
  const p1 = classification.p1.map((finding) => `- ${finding.module}: ${finding.reason} (${finding.evidence})`);
  const p2 = classification.p2.map((finding) => `- ${finding.module}: ${finding.reason} (${finding.evidence})`);

  const lines = [
    "# Watchdog Report",
    "",
    `Generated: ${watchdog.generatedAt}`,
    "",
    "## Cheap Checks",
    "",
    markdownCommandResult("git status --short --branch", watchdog.checks.gitStatus.command),
    markdownCommandResult("git remote -v", watchdog.checks.gitRemote.command),
    markdownCommandResult("npm run project:status", watchdog.checks.projectStatus.command),
    markdownCommandResult("npm run beta-check", watchdog.checks.betaCheck.command),
    markdownCommandResult("npm run agents:status", watchdog.checks.agentsStatus.command),
    `- GET /api/health: ${watchdog.health.ok ? `ok ${watchdog.health.status}` : `failed ${watchdog.health.detail}`}`,
    `- DATABASE_URL present: ${watchdog.environment.database.present ? "YES" : "NO"}`,
    `- GitHub push pending: ${watchdog.git.pushPending ? "YES" : "NO"}`,
    `- Worktree dirty: ${watchdog.git.dirty ? `YES (${watchdog.git.dirtyCount})` : "NO"}`,
    "",
    "## Classification",
    "",
    "### P0",
    "",
    ...(p0.length ? p0 : ["- none"]),
    "",
    "### P1",
    "",
    ...(p1.length ? p1 : ["- none"]),
    "",
    "### P2",
    "",
    ...(p2.length ? p2 : ["- none"]),
    "",
    "## Policy Notes",
    "",
    "- Watchdog does not modify code.",
    "- Watchdog does not run Codex.",
    "- Watchdog runs beta-check in cheap mode unless WATCHDOG_ALLOW_HEAVY=1.",
    "- Watchdog does not run full build unless WATCHDOG_ALLOW_HEAVY=1.",
    "- GitHub sync is handled by scripts/github-sync.js with a 6 hour cooldown.",
  ];

  writeText("docs/WATCHDOG_REPORT.md", `${lines.join("\n")}\n`);
}

async function main() {
  ensureOpsDirs();

  const gitStatus = getGitStatus();
  const gitRemote = getGitRemote();
  const gitSync = getGitSyncStatus();
  const projectStatusResult = runPackageScript("project:status", { timeoutMs: 90000 });
  const betaCheckResult = betaCheckPolicyResult();
  const agentsStatusResult = runPackageScript("agents:status", { timeoutMs: 90000 });
  const health = await httpHealthCheck();
  const database = getDatabaseSignal();
  const docker = detectDocker();
  const secretScan = runCheapSecretScan();
  const projectStatusSnapshot = readProjectStatus();

  const watchdog = {
    generatedAt: nowIso(),
    mode: "autonomous-ops-cheap-watchdog",
    intervalMinutes: 30,
    checks: {
      gitStatus: {
        configured: gitStatus.ok,
        command: commandSummary(gitStatus.command),
      },
      gitRemote: {
        configured: gitRemote.configured,
        command: commandSummary(gitRemote.command),
      },
      projectStatus: {
        command: commandSummary(projectStatusResult),
      },
      betaCheck: {
        command: commandSummary(betaCheckResult),
      },
      agentsStatus: {
        command: commandSummary(agentsStatusResult),
      },
    },
    git: {
      branch: gitStatus.currentBranch,
      branchLine: gitStatus.branchLine,
      dirty: gitStatus.dirty,
      dirtyCount: gitStatus.dirtyCount,
      dirtyPreview: gitStatus.preview,
      remoteConfigured: gitRemote.configured,
      upstreamConfigured: gitSync.upstreamConfigured,
      upstream: gitSync.upstream,
      ahead: gitSync.ahead,
      behind: gitSync.behind,
      pushPending: gitSync.pushPending,
      detail: gitSync.detail,
    },
    health,
    environment: {
      database,
      docker,
    },
    security: {
      secretScan,
    },
    files: {
      cmsPresent: fs.existsSync(absolutePath("src/modules/cms")) || fs.existsSync(absolutePath("src/services/cms")),
      fileFallbackPresent: fs.existsSync(absolutePath("src/lib/storage/fileStore.ts")),
      dockerComposePresent: fs.existsSync(absolutePath("docker-compose.yml")),
    },
    projectStatusSnapshot,
  };

  const classification = classifyWatchdog(watchdog);
  watchdog.classification = {
    p0: classification.p0,
    p1: classification.p1,
    p2: classification.p2,
  };
  watchdog.codexDirectExecution = "disabled_no_safe_cli_contract";

  writeJson("runtime/autonomous/watchdog-latest.json", watchdog);
  writeJson("runtime/decisions/watchdog-classification-latest.json", classification);
  writeWatchdogReport(watchdog, classification);

  console.log(JSON.stringify({
    generatedAt: watchdog.generatedAt,
    p0: classification.p0.length,
    p1: classification.p1.length,
    p2: classification.p2.length,
    health: health.ok ? "ok" : "failed",
    betaCheck: betaCheckResult.skipped ? betaCheckResult.reason : betaCheckResult.status,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
