#!/usr/bin/env node
const { classifyWatchdog, ensureRuntimeDirs, nowIso, readJson, writeJson, writeText } = require("./autonomous-lib.js");

function markdown(result) {
  const section = (title, items) => `## ${title}

${items.length === 0 ? "- none" : items.map((item) => `- ${item.module}: ${item.reason}\n  Evidence: ${item.evidence}`).join("\n")}
`;
  return `# Autonomous Task Classification

Generated: ${result.generatedAt}
Source: ${result.source}

${section("P0", result.p0)}
${section("P1", result.p1)}
${section("P2", result.p2)}
`;
}

function main() {
  ensureRuntimeDirs();
  const source = readJson("runtime/autonomous/watchdog-latest.json", null);
  const classification = source?.classification || classifyWatchdog(source || {});
  const result = {
    generatedAt: nowIso(),
    source: "runtime/autonomous/watchdog-latest.json",
    findings: classification.findings,
    p0: classification.p0,
    p1: classification.p1,
    p2: classification.p2,
  };
  writeJson("runtime/tasks/classification-latest.json", result);
  writeJson("runtime/decisions/classification-latest.json", result);
  writeText("runtime/tasks/classification-latest.md", markdown(result));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main();
