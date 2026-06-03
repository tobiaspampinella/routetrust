#!/usr/bin/env node
const { ensureRuntimeDirs, loadProjectStatus, nowIso, writeJson } = require("./autonomous-lib.js");

function main() {
  ensureRuntimeDirs();
  const status = loadProjectStatus();
  const output = {
    generatedAt: nowIso(),
    source: "runtime/project-status.json",
    exists: Object.keys(status).length > 0,
    classifications: status.classifications || {},
    beta: status.beta || {},
    server: status.server || {},
    runtime: status.runtime || {},
    criticalBlockers: status.criticalBlockers || [],
  };
  writeJson("runtime/reports/project-status-latest.json", output);
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
}

main();
