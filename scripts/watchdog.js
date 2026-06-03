#!/usr/bin/env node
const {
  checkHealthEndpoint,
  classifyWatchdog,
  ensureRuntimeDirs,
  getDatabaseUrlStatus,
  getGitAheadBehind,
  getGitRemote,
  getGitStatus,
  loadProjectStatus,
  nowIso,
  readJson,
  runNpmScript,
  scanTrackedFilesForSecrets,
  writeJson,
  writeText,
} = require("./autonomous-lib.js");

const DEFAULT_INTERVAL_MS = 30 * 60 * 1000;

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

function summarizeCommand(result) {
  return {
    command: result.command,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
  };
}

function writeMarkdown(report, classification) {
  const formatItems = (items) => (items.length === 0 ? "- none" : items.map((item) => `- ${item.module}: ${item.reason} (${item.evidence})`).join("\n"));
  const body = `# Watchdog Report

Generated: ${report.generatedAt}

## Cheap Checks

- git status --short --branch: ${report.commands.gitStatus.status}
- git remote -v: ${report.commands.gitRemote.status}
- npm run project:status: ${report.commands.projectStatus.status}
- npm run beta-check: ${report.commands.betaCheck.status}
- npm run agents:status: ${report.commands.agentsStatus.status}
- GET /api/health: ${report.health.ok ? `ok ${report.health.status}` : `failed ${report.health.detail}`}
- DATABASE_URL present: ${report.database.present ? "YES" : "NO"}
- GitHub push pending: ${report.git.sync.pushPending ? "YES" : "NO"}
- Worktree dirty: ${report.git.status.dirty ? "YES" : "NO"}

## Classification

### P0

${formatItems(classification.p0)}

### P1

${formatItems(classification.p1)}

### P2

${formatItems(classification.p2)}

## Policy Notes

- Watchdog does not modify code.
- Watchdog does not run Codex.
- Watchdog runs beta-check in cheap mode unless WATCHDOG_ALLOW_HEAVY=1.
- Watchdog does not run full build unless WATCHDOG_ALLOW_HEAVY=1.
- GitHub sync is handled by scripts/github-sync.js with a 6 hour cooldown.
`;
  writeText("docs/WATCHDOG_REPORT.md", body);
}

async function runOnce() {
  ensureRuntimeDirs();

  const generatedAt = nowIso();
  const gitStatus = getGitStatus();
  const gitRemote = getGitRemote();
  const gitSync = getGitAheadBehind();
  const projectStatus = runNpmScript("project:status", { timeoutMs: 45000 });
  const betaEnv = process.env.WATCHDOG_ALLOW_HEAVY === "1" ? {} : { ROUTETRUST_BETA_CHECK_CHEAP: "1" };
  const betaCheck = runNpmScript("beta-check", { timeoutMs: process.env.WATCHDOG_ALLOW_HEAVY === "1" ? 240000 : 60000, env: betaEnv });
  const betaCheckReport = process.env.WATCHDOG_ALLOW_HEAVY === "1" ? null : readJson("runtime/reports/beta-check-cheap-latest.json", null);
  const agentsStatus = runNpmScript("agents:status", { timeoutMs: 45000, env: { ROUTETRUST_STATUS_READONLY: "1" } });
  const health = await checkHealthEndpoint();
  const database = getDatabaseUrlStatus();
  const security = scanTrackedFilesForSecrets();

  const report = {
    generatedAt,
    mode: "cheap-watchdog",
    intervalMs: DEFAULT_INTERVAL_MS,
    commands: {
      gitStatus: summarizeCommand(gitStatus.result),
      gitRemote: summarizeCommand(gitRemote),
      projectStatus: summarizeCommand(projectStatus),
      betaCheck: summarizeCommand(betaCheck),
      agentsStatus: summarizeCommand(agentsStatus),
    },
    git: {
      status: {
        branchLine: gitStatus.branchLine,
        dirty: gitStatus.dirty,
        changedCount: gitStatus.changedCount,
        entries: gitStatus.entries,
      },
      remote: {
        status: gitRemote.status,
        configured: gitRemote.status === 0 && gitRemote.stdout.trim().length > 0,
      },
      sync: gitSync,
    },
    database,
    health,
    security: {
      ok: security.ok,
      potentialSecrets: security.findings,
      error: security.error,
    },
    betaCheckReport,
    projectStatus: loadProjectStatus(),
  };

  const classification = classifyWatchdog(report);
  report.classification = classification;

  writeJson("runtime/autonomous/watchdog-latest.json", report);
  writeJson("runtime/decisions/watchdog-classification-latest.json", {
    generatedAt: nowIso(),
    source: "runtime/autonomous/watchdog-latest.json",
    ...classification,
  });
  writeMarkdown(report, classification);

  process.stdout.write(
    `${JSON.stringify(
      {
        generatedAt,
        p0: classification.p0.length,
        p1: classification.p1.length,
        p2: classification.p2.length,
        health: health.ok ? "ok" : "failed",
        betaCheck: betaCheck.status,
      },
      null,
      2,
    )}\n`,
  );
  return report;
}

async function main() {
  const watch = hasArg("--watch");
  const intervalMs = argValue("--interval-ms", DEFAULT_INTERVAL_MS);
  do {
    await runOnce();
    if (!watch) break;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (watch);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
