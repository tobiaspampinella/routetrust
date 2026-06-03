#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const { ensureRuntimeDirs, nowIso, readJson, runShell, writeJson, writeText } = require("./autonomous-lib.js");

const RECOMMENDED_MODELS = ["qwen2.5-coder:7b", "qwen2.5-coder:14b", "qwen3.6", "deepseek-coder", "llama3.1"];

function cleanTerminalText(value, max = 1200) {
  const cleaned = String(value || "")
    .replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/[^\S\r\n]+/g, " ")
    .replace(/\r/g, "")
    .trim();
  const errorIndex = cleaned.indexOf("Error:");
  return (errorIndex >= 0 ? cleaned.slice(errorIndex) : cleaned)
    .slice(0, max);
}

function defaultConfig() {
  return {
    provider: "ollama",
    enabled: true,
    autoDownload: false,
    preferredModels: RECOMMENDED_MODELS,
    allowedTasks: [
      "summarize logs",
      "classify bugs",
      "generate checklists",
      "translate README/docs EN/ES",
      "detect documentation drift",
      "draft issues",
      "group errors",
      "suggest microcopy",
      "superficial UX audit",
    ],
    forbiddenDecisions: ["security final approval", "DB migrations", "architecture", "deploy", "auth", "RBAC", "tenant isolation", "beta stable", "production readiness"],
  };
}

function parseModels(stdout) {
  return stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function selectModel(models, preferred) {
  for (const model of preferred) {
    if (models.includes(model)) return model;
  }
  return models.find((model) => /coder|qwen|deepseek|llama/i.test(model)) || null;
}

function buildPrompt(classification) {
  const p2 = classification.p2 || [];
  return `You are a cheap local analysis model for RouteTrust. Do not decide security, DB migrations, deploy, auth, RBAC, tenant isolation, beta stable, or production readiness.

Summarize only these P2/backlog findings as a short operational checklist:

${p2.length === 0 ? "- No P2 findings." : p2.map((item) => `- ${item.module}: ${item.reason}. Evidence: ${item.evidence}`).join("\n")}
`;
}

function main() {
  ensureRuntimeDirs();

  let config = readJson("runtime/local-model/config.json", null);
  if (!config) {
    config = defaultConfig();
    writeJson("runtime/local-model/config.json", config);
  }

  const list = runShell("ollama list", { timeoutMs: 20000 });
  const models = list.status === 0 ? parseModels(list.stdout) : [];
  const selectedModel = selectModel(models, config.preferredModels || RECOMMENDED_MODELS);
  const classification = readJson("runtime/tasks/classification-latest.json", { p2: [] });
  const p2 = classification.p2 || [];
  let output = "";
  let ranModel = false;
  let status = "skipped";
  let reason = "";

  if (list.status !== 0) {
    reason = "OLLAMA_UNAVAILABLE";
  } else if (!config.enabled) {
    reason = "LOCAL_MODEL_DISABLED";
  } else if (!selectedModel) {
    reason = "NO_RECOMMENDED_MODEL_INSTALLED";
  } else if (p2.length === 0) {
    reason = "NO_LOCAL_MODEL_TASKS";
  } else {
    const prompt = buildPrompt(classification);
    const result = spawnSync("ollama", ["run", selectedModel, prompt], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 90000,
      env: { ...process.env, NO_COLOR: "1", TERM: "dumb" },
    });
    ranModel = typeof result.status === "number" && result.status === 0;
    status = ranModel ? "completed" : "failed";
    reason = ranModel ? "OK" : cleanTerminalText(result.error?.message || result.stderr || result.stdout || "ollama run failed");
    output = cleanTerminalText(result.stdout || "", 12000);
    writeText("runtime/local-model/latest-output.md", output || `Local model produced no output. Reason: ${reason}\n`);
  }

  if (!ranModel && !output) {
    writeText("runtime/local-model/latest-output.md", `# Local Model Output\n\nGenerated: ${nowIso()}\nStatus: ${status}\nReason: ${reason}\n`);
  }

  const report = {
    generatedAt: nowIso(),
    provider: "ollama",
    available: list.status === 0,
    enabled: Boolean(config.enabled),
    autoDownload: false,
    models,
    selectedModel,
    ranModel,
    status,
    reason,
    outputFile: "runtime/local-model/latest-output.md",
  };
  writeJson("runtime/local-model/status-latest.json", report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main();
