#!/usr/bin/env node
const { runShell, writeJson, nowIso } = require("./autonomous-lib.js");

function main() {
  const result = runShell("node scripts/qa-smoke", { timeoutMs: 240000 });
  writeJson("runtime/reports/qa-smoke-runtime-latest.json", {
    generatedAt: nowIso(),
    command: result.command,
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    error: result.error,
  });
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.status !== 0) process.exit(result.status);
}

main();
