#!/usr/bin/env node
const {
  classifyWatchdog,
  ensureOpsDirs,
  nowIso,
  readJson,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

function writeReport(classification) {
  const lines = [
    "# Autonomous Task Classification",
    "",
    `Generated: ${classification.generatedAt}`,
    "",
    "## P0",
    "",
    ...(classification.p0.length
      ? classification.p0.map((finding) => `- ${finding.module}: ${finding.reason} - ${finding.evidence}`)
      : ["- none"]),
    "",
    "## P1",
    "",
    ...(classification.p1.length
      ? classification.p1.map((finding) => `- ${finding.module}: ${finding.reason} - ${finding.evidence}`)
      : ["- none"]),
    "",
    "## P2",
    "",
    ...(classification.p2.length
      ? classification.p2.map((finding) => `- ${finding.module}: ${finding.reason} - ${finding.evidence}`)
      : ["- none"]),
  ];
  writeText("runtime/tasks/classification-latest.md", `${lines.join("\n")}\n`);
}

function main() {
  ensureOpsDirs();
  const watchdog = readJson("runtime/autonomous/watchdog-latest.json", null);
  if (!watchdog) {
    const empty = {
      generatedAt: nowIso(),
      source: "runtime/autonomous/watchdog-latest.json",
      findings: [],
      p0: [],
      p1: [],
      p2: [],
      status: "blocked",
      reason: "watchdog output missing",
    };
    writeJson("runtime/decisions/classification-latest.json", empty);
    writeReport(empty);
    console.log(JSON.stringify(empty, null, 2));
    return;
  }

  const classification = classifyWatchdog(watchdog);
  writeJson("runtime/decisions/classification-latest.json", classification);
  writeJson("runtime/tasks/classification-latest.json", classification);
  writeReport(classification);
  console.log(JSON.stringify(classification, null, 2));
}

main();
