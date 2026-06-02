#!/usr/bin/env node
const {
  ensureOpsDirs,
  nowIso,
  readText,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const SAFE_GITIGNORE_PATTERNS = [
  "runtime/autonomous/*.json",
  "runtime/decisions/*.json",
  "runtime/github-sync/*.json",
  "runtime/reports/*.json",
  "runtime/reports/*.md",
  "runtime/tasks/*.json",
  "runtime/tasks/*.md",
  "runtime/local-model/*.log",
  "runtime/local-model/status-latest.json",
  "runtime/local-model/latest-output.md",
  "runtime/codex-queue/*.tmp",
  "runtime/codex-queue/latest-preparer-result.json",
];

function applyGitignoreFix(apply) {
  const current = readText(".gitignore");
  const missing = SAFE_GITIGNORE_PATTERNS.filter((pattern) => !current.split(/\r?\n/).includes(pattern));
  if (!apply || missing.length === 0) {
    return {
      name: "gitignore-runtime-generated-files",
      applied: false,
      missing,
    };
  }

  const next = [
    current.trimEnd(),
    "",
    "# Autonomous ops generated runtime",
    ...missing,
    "",
  ].join("\n");
  writeText(".gitignore", next);
  return {
    name: "gitignore-runtime-generated-files",
    applied: true,
    missing,
  };
}

function main() {
  ensureOpsDirs();
  const apply = process.argv.includes("--apply");
  const fixes = [applyGitignoreFix(apply)];
  const result = {
    generatedAt: nowIso(),
    mode: apply ? "apply" : "dry-run",
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
    changed: fixes.some((fix) => fix.applied),
  };

  writeJson("runtime/reports/safe-autofix-latest.json", result);
  console.log(JSON.stringify(result, null, 2));
}

main();
