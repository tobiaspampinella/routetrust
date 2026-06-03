#!/usr/bin/env node
const { ensureRuntimeDirs, nowIso, runShell, writeJson, writeText } = require("./autonomous-lib.js");

const COMMANDS = ["npm run typecheck", "npm run lint", "npm test", "npm run qa:security"];

function main() {
  ensureRuntimeDirs();
  const results = [];
  for (const command of COMMANDS) {
    const result = runShell(command, { timeoutMs: 240000 });
    results.push(result);
    if (result.status !== 0) break;
  }

  const passed = results.length === COMMANDS.length && results.every((result) => result.status === 0);
  const report = {
    generatedAt: nowIso(),
    source: "preflight-check",
    passed,
    commands: results,
  };
  writeJson("runtime/reports/preflight-latest.json", report);
  writeText(
    "runtime/reports/preflight-latest.md",
    `# Preflight Check Report

Generated: ${report.generatedAt}
Status: ${passed ? "PASSED" : "FAILED"}

${results.map((result) => `- ${result.command}: ${result.status}`).join("\n")}
`,
  );
  process.stdout.write(`${JSON.stringify({ generatedAt: report.generatedAt, passed, commands: results.map((item) => [item.command, item.status]) }, null, 2)}\n`);
  if (!passed) process.exit(1);
}

main();
