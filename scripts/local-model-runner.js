#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
const {
  PREFERRED_LOCAL_MODELS,
  ROOT,
  commandEnv,
  ensureOpsDirs,
  nowIso,
  readJson,
  readText,
  runShell,
  writeJson,
  writeText,
} = (() => {
  const lib = require("./autonomous-ops-lib.js");
  return {
    ...lib,
    commandEnv: () => ({
      ...process.env,
      PATH: [
        require("node:path").join(lib.ROOT, "node_modules", ".bin"),
        require("node:path").dirname(process.execPath),
        process.env.PATH || process.env.Path || "",
      ].filter(Boolean).join(require("node:path").delimiter),
    }),
  };
})();

const DEFAULT_CONFIG = {
  enabled: true,
  provider: "ollama",
  endpoint: "http://127.0.0.1:11434",
  selectedModel: null,
  preferredModels: PREFERRED_LOCAL_MODELS,
  autoDownload: false,
  allowedTasks: [
    "summarize logs",
    "classify bugs",
    "generate checklist",
    "translate docs EN/ES",
    "detect documentation drift",
    "draft issues",
    "group errors",
    "suggest microcopy",
    "superficial UX audit",
  ],
  forbiddenDecisions: [
    "security final approval",
    "DB migrations",
    "architecture",
    "deploy",
    "auth",
    "RBAC",
    "tenant isolation",
    "beta stable",
    "production readiness",
  ],
};

function ensureConfig() {
  const existing = readJson("runtime/local-model/config.json", null);
  const next = existing ? { ...DEFAULT_CONFIG, ...existing } : DEFAULT_CONFIG;
  writeJson("runtime/local-model/config.json", next);
  return next;
}

function parseOllamaModels(output) {
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function detectOllama() {
  const result = runShell("ollama list", { timeoutMs: 30000 });
  return {
    available: result.status === 0,
    command: result.command,
    status: result.status,
    models: result.status === 0 ? parseOllamaModels(result.stdout) : [],
    stderr: result.stderr,
    error: result.error,
  };
}

function chooseModel(config, models) {
  if (config.selectedModel && models.includes(config.selectedModel)) return config.selectedModel;
  return config.preferredModels.find((model) => models.includes(model)) || null;
}

function runOllama(model, prompt) {
  const result = spawnSync("ollama", ["run", model, prompt], {
    cwd: ROOT,
    shell: false,
    encoding: "utf8",
    env: commandEnv(),
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 10,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function defaultPrompt() {
  const classification = readText("runtime/tasks/classification-latest.md");
  if (classification.trim()) {
    return `Summarize this RouteTrust autonomous classification for a local operator. Do not decide security, DB migrations, auth, deploy, tenant isolation, beta stable, or production readiness.\n\n${classification}`;
  }

  return "Summarize current RouteTrust autonomous ops status. No production readiness decisions.";
}

function main() {
  ensureOpsDirs();
  const config = ensureConfig();
  const ollama = detectOllama();
  const selectedModel = chooseModel(config, ollama.models);
  const promptFileArg = process.argv.find((arg) => arg.startsWith("--prompt-file="));
  const promptFile = promptFileArg ? promptFileArg.split("=")[1] : null;
  const prompt = promptFile ? readText(promptFile) : defaultPrompt();

  const status = {
    generatedAt: nowIso(),
    provider: "ollama",
    available: ollama.available,
    enabled: Boolean(config.enabled),
    autoDownload: false,
    models: ollama.models,
    selectedModel,
    ranModel: false,
    status: "unavailable",
    reason: null,
    outputFile: null,
  };

  if (!ollama.available) {
    status.reason = "OLLAMA_UNAVAILABLE";
  } else if (!selectedModel) {
    status.reason = "NO_RECOMMENDED_MODEL_INSTALLED";
  } else if (!config.enabled) {
    status.status = "configured_disabled";
    status.reason = "LOCAL_MODEL_DISABLED_BY_CONFIG";
  } else {
    const result = runOllama(selectedModel, prompt);
    status.ranModel = result.status === 0;
    status.status = result.status === 0 ? "completed" : "failed";
    status.reason = result.status === 0 ? "OK" : result.stderr || result.error || "ollama run failed";
    status.outputFile = "runtime/local-model/latest-output.md";
    writeText("runtime/local-model/latest-output.md", result.status === 0 ? result.stdout : `${result.stderr}\n${result.error}\n`);
  }

  writeJson("runtime/local-model/status-latest.json", status);
  console.log(JSON.stringify(status, null, 2));
}

main();
