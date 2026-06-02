#!/usr/bin/env node
const {
  ensureOpsDirs,
  nowIso,
  runPackageScript,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const CHECKS = ["typecheck", "lint", "test", "qa:security"];

function runChecks() {
  return CHECKS.map((script) => ({
    script,
    result: runPackageScript(script, { timeoutMs: 300000 }),
  }));
}

function writeReport(report) {
  const lines = [
    "# Preflight Check Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${report.passed ? "PASSED" : "FAILED"}`,
    "",
    ...report.results.map((entry) => `- npm run ${entry.script}: ${entry.result.status}`),
  ];
  writeText("runtime/reports/preflight-latest.md", `${lines.join("\n")}\n`);
}

function main() {
  ensureOpsDirs();
  const results = runChecks();
  const report = {
    generatedAt: nowIso(),
    checks: CHECKS,
    results,
    passed: results.every((entry) => entry.result.status === 0),
  };
  writeJson("runtime/reports/preflight-latest.json", report);
  writeReport(report);
  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    passed: report.passed,
    results: report.results.map((entry) => ({ script: entry.script, status: entry.result.status })),
  }, null, 2));
  if (!report.passed) process.exit(1);
}

main();
