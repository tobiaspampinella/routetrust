#!/usr/bin/env node
const { ensureRuntimeDirs, nowIso, readText, runShell, writeJson, writeText } = require("./autonomous-lib.js");

const APPLY = process.argv.includes("--apply");
const PROTECTED_BRANCHES = new Set(["main", "master"]);
const REQUIRED_GITIGNORE_PATTERNS = [
  "runtime/",
  "docs/WATCHDOG_REPORT.md",
  "runtime/autonomous/*.log",
  "runtime/autonomous/*.tmp",
  "runtime/github-sync/*.log",
  "runtime/github-sync/*.tmp",
  "runtime/local-model/*.tmp",
  "runtime/reports/*.tmp",
];

function main() {
  ensureRuntimeDirs();

  const fixes = [];
  const branchResult = runShell("git branch --show-current", { timeoutMs: 15000 });
  const currentBranch = branchResult.status === 0 ? branchResult.stdout.trim() : "";
  const protectedBranch = PROTECTED_BRANCHES.has(currentBranch);
  const gitignore = readText(".gitignore", "");
  const missing = REQUIRED_GITIGNORE_PATTERNS.filter((pattern) => !gitignore.includes(pattern));
  let changed = false;

  if (missing.length > 0 && APPLY && !protectedBranch) {
    const next = `${gitignore.trimEnd()}\n${missing.join("\n")}\n`;
    writeText(".gitignore", next);
    changed = true;
  }

  fixes.push({
    name: "gitignore-runtime-generated-files",
    applied: APPLY && missing.length > 0 && !protectedBranch,
    missing,
    skippedReason: APPLY && protectedBranch ? "PROTECTED_BRANCH_NO_WRITE" : "",
  });

  const report = {
    generatedAt: nowIso(),
    mode: APPLY ? "apply" : "dry-run",
    currentBranch,
    protectedBranch,
    allowedScope: [
      "docs",
      "CHANGELOG draft",
      "NEXT_AGENT_PROMPT",
      "status reports",
      "README links",
      "minor EN/ES translations",
      ".gitignore runtime files",
      "project-status from JSON only",
    ],
    forbiddenScope: [
      "Prisma schema",
      "auth",
      "RBAC",
      "tenant isolation",
      "security headers",
      "DB migrations",
      "deploy config",
      "package upgrades",
      "core source without Codex task",
    ],
    fixes,
    changed,
  };

  writeJson("runtime/reports/safe-autofix-latest.json", report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
