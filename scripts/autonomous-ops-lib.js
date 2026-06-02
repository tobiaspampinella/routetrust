const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_LIMIT = 12000;
const OPS_DIRS = [
  "runtime/autonomous",
  "runtime/tasks",
  "runtime/decisions",
  "runtime/local-model",
  "runtime/codex-queue",
  "runtime/github-sync",
  "runtime/reports",
];

const PREFERRED_LOCAL_MODELS = [
  "qwen2.5-coder:14b",
  "qwen2.5-coder:7b",
  "qwen3-coder:480b-cloud",
  "qwen3.6",
  "deepseek-coder",
  "llama3.1",
];

function nowIso() {
  return new Date().toISOString();
}

function todayCompact() {
  return nowIso().slice(0, 10).replace(/-/g, "");
}

function absolutePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/");
}

function ensureDir(relativeDir) {
  fs.mkdirSync(absolutePath(relativeDir), { recursive: true });
}

function ensureOpsDirs() {
  for (const dir of OPS_DIRS) ensureDir(dir);
}

function readText(relativeFile) {
  const file = absolutePath(relativeFile);
  if (!fs.existsSync(file)) return "";
  return fs.readFileSync(file, "utf8");
}

function writeText(relativeFile, content) {
  ensureDir(path.dirname(relativeFile));
  fs.writeFileSync(absolutePath(relativeFile), content, "utf8");
}

function readJson(relativeFile, fallback) {
  try {
    const content = readText(relativeFile);
    if (!content.trim()) return fallback;
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function writeJson(relativeFile, value) {
  writeText(relativeFile, `${JSON.stringify(value, null, 2)}\n`);
}

function truncate(value, limit = OUTPUT_LIMIT) {
  const text = String(value || "");
  return text.length > limit ? `${text.slice(0, limit)}\n[truncated]` : text;
}

function commandEnv() {
  const localBin = path.join(ROOT, "node_modules", ".bin");
  const pathValue = process.env.PATH || process.env.Path || "";
  return {
    ...process.env,
    PATH: [localBin, path.dirname(process.execPath), pathValue].filter(Boolean).join(path.delimiter),
  };
}

function runShell(command, options = {}) {
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    env: commandEnv(),
    maxBuffer: 1024 * 1024 * 20,
    timeout: options.timeoutMs || 120000,
  });

  return {
    command,
    status: result.status ?? 1,
    stdout: truncate(result.stdout || ""),
    stderr: truncate(result.stderr || ""),
    error: result.error ? result.error.message : "",
    timedOut: result.error && result.error.code === "ETIMEDOUT",
  };
}

function runPackageScript(scriptName, options = {}) {
  const args = options.args || [];
  return runShell(`npm run ${scriptName}${args.length ? ` -- ${args.join(" ")}` : ""}`, options);
}

function getCurrentBranch() {
  const result = runShell("git rev-parse --abbrev-ref HEAD", { timeoutMs: 15000 });
  return result.status === 0 ? result.stdout.trim() : "unknown";
}

function getGitStatus() {
  const result = runShell("git status --short --branch", { timeoutMs: 15000 });
  const lines = `${result.stdout}\n${result.stderr}`.split(/\r?\n/).filter(Boolean);
  const header = lines.find((line) => line.startsWith("##")) || "";
  const entries = lines.filter((line) => !line.startsWith("##"));
  return {
    ok: result.status === 0,
    branchLine: header,
    currentBranch: getCurrentBranch(),
    dirty: entries.length > 0,
    entries,
    dirtyCount: entries.length,
    preview: entries.slice(0, 20),
    command: result,
  };
}

function getGitRemote() {
  const result = runShell("git remote -v", { timeoutMs: 15000 });
  return {
    configured: result.status === 0 && /origin\s+/.test(result.stdout),
    output: result.stdout.trim(),
    command: result,
  };
}

function getGitSyncStatus() {
  const branch = getCurrentBranch();
  const upstreamResult = runShell("git rev-parse --abbrev-ref --symbolic-full-name @{upstream}", { timeoutMs: 15000 });
  if (upstreamResult.status !== 0) {
    return {
      branch,
      upstreamConfigured: false,
      upstream: null,
      ahead: null,
      behind: null,
      pushPending: false,
      detail: "NO_UPSTREAM",
    };
  }

  const aheadResult = runShell("git rev-list --count @{upstream}..HEAD", { timeoutMs: 15000 });
  const behindResult = runShell("git rev-list --count HEAD..@{upstream}", { timeoutMs: 15000 });
  const ahead = aheadResult.status === 0 ? Number.parseInt(aheadResult.stdout.trim(), 10) || 0 : null;
  const behind = behindResult.status === 0 ? Number.parseInt(behindResult.stdout.trim(), 10) || 0 : null;

  return {
    branch,
    upstreamConfigured: true,
    upstream: upstreamResult.stdout.trim(),
    ahead,
    behind,
    pushPending: Number.isInteger(ahead) && ahead > 0,
    detail: `ahead=${ahead ?? "unknown"} behind=${behind ?? "unknown"}`,
  };
}

function fileHasEnvKey(file, key) {
  const content = readText(file);
  if (!content) return false;
  return content.split(/\r?\n/).some((line) => new RegExp(`^\\s*${key}\\s*=`).test(line) && !line.trim().startsWith("#"));
}

function getDatabaseSignal() {
  const envFiles = [".env.local", ".env", ".env.development.local", ".env.staging"];
  const presentInEnvFile = envFiles.some((file) => fileHasEnvKey(file, "DATABASE_URL"));
  return {
    present: Boolean(process.env.DATABASE_URL) || presentInEnvFile,
    presentInProcess: Boolean(process.env.DATABASE_URL),
    presentInEnvFile,
    valueExposed: false,
  };
}

function detectDocker() {
  const docker = runShell("docker --version", { timeoutMs: 15000 });
  const compose = runShell("docker compose version", { timeoutMs: 15000 });
  const legacyCompose = compose.status === 0 ? null : runShell("docker-compose --version", { timeoutMs: 15000 });
  return {
    dockerAvailable: docker.status === 0,
    composeAvailable: compose.status === 0 || legacyCompose?.status === 0,
    dockerVersion: docker.status === 0 ? docker.stdout.trim() : null,
    composeVersion: compose.status === 0 ? compose.stdout.trim() : legacyCompose?.status === 0 ? legacyCompose.stdout.trim() : null,
    composeFileExists: fs.existsSync(absolutePath("docker-compose.yml")),
  };
}

async function httpHealthCheck() {
  const baseUrls = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ].filter(Boolean).map((url) => String(url).replace(/\/$/, ""));

  const attempts = [];
  let last = {
    ok: false,
    status: 0,
    url: `${baseUrls[0] || "http://127.0.0.1:3000"}/api/health`,
    detail: "not_checked",
    payload: null,
    attempts,
  };

  for (const baseUrl of baseUrls) {
    const url = `${baseUrl}/api/health`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(url, { signal: controller.signal });
      const body = await response.text().catch(() => "");
      clearTimeout(timeout);
      let payload = null;
      try {
        payload = body ? JSON.parse(body) : null;
      } catch {
        payload = null;
      }
      last = {
        ok: response.ok,
        status: response.status,
        url,
        detail: `HTTP ${response.status}`,
        payload,
        attempts,
      };
      attempts.push({ url, ok: response.ok, status: response.status, detail: `HTTP ${response.status}` });
      if (response.ok) return last;
    } catch (error) {
      attempts.push({ url, ok: false, status: 0, detail: error.message });
      last = {
        ok: false,
        status: 0,
        url,
        detail: error.message,
        payload: null,
        attempts,
      };
    }
  }

  return last;
}

function readProjectStatus() {
  return readJson("runtime/project-status.json", {});
}

function runCheapSecretScan() {
  const filesResult = runShell("git ls-files --cached --others --exclude-standard", { timeoutMs: 30000 });
  if (filesResult.status !== 0) {
    return {
      ok: false,
      exposed: false,
      findings: [],
      detail: "git ls-files failed",
    };
  }

  const excludedPrefixes = [
    "node_modules/",
    ".next",
    ".git/",
    "runtime/logs/",
    "runtime/heartbeats/",
    "playwright-report/",
    "test-results/",
  ];
  const extensions = new Set([".js", ".ts", ".tsx", ".json", ".md", ".yml", ".yaml", ".ps1", ".prisma"]);
  const patterns = [
    { name: "private_key", regex: /-----BEGIN (RSA |OPENSSH |EC |DSA |)PRIVATE KEY-----/ },
    { name: "openai_key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
    { name: "github_token", regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/ },
    { name: "telegram_bot_token", regex: /\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/ },
    { name: "database_url_with_password", regex: /DATABASE_URL\s*=\s*["']?postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i },
  ];
  const criticalFindings = [];
  const informationalFindings = [];

  for (const rawFile of filesResult.stdout.split(/\r?\n/).filter(Boolean)) {
    const file = normalizePath(rawFile);
    if (excludedPrefixes.some((prefix) => file.startsWith(prefix))) continue;
    if (file.startsWith(".env")) continue;
    const ext = path.extname(file).toLowerCase();
    if (!extensions.has(ext)) continue;

    const content = readText(file);
    if (!content) continue;
    for (const pattern of patterns) {
      if (pattern.regex.test(content)) {
        if (pattern.name === "database_url_with_password" && file.startsWith("docs/")) {
          informationalFindings.push({ file, type: pattern.name, detail: "documented local database URL example" });
        } else {
          criticalFindings.push({ file, type: pattern.name });
        }
      }
    }
  }

  return {
    ok: true,
    exposed: criticalFindings.length > 0,
    findings: criticalFindings,
    informationalFindings,
    detail: criticalFindings.length > 0 ? `${criticalFindings.length} high-confidence finding(s)` : "none",
  };
}

function createFinding(severity, module, reason, evidence, options = {}) {
  return {
    severity,
    module,
    reason,
    evidence,
    affectsBetaStable: Boolean(options.affectsBetaStable),
    localModelEligible: Boolean(options.localModelEligible),
    recommendedAgent: options.recommendedAgent || recommendedAgent(module, severity),
  };
}

function recommendedAgent(module, severity) {
  if (severity === "P2") return "Local model or backlog";
  if (module === "security" || module === "auth") return "Codex GPT-5.5 Security Lead";
  if (module === "db" || module === "cms") return "Codex GPT-5.5 Backend Lead";
  if (module === "github" || module === "devops") return "Codex GPT-5.5 DevOps Lead";
  if (module === "qa") return "Codex GPT-5.5 QA Lead";
  if (module === "frontend") return "Codex GPT-5.5 Full Stack Lead";
  return "Codex GPT-5.5";
}

function classifyWatchdog(watchdog) {
  const findings = [];
  const health = watchdog.health || {};
  const db = watchdog.environment?.database || {};
  const git = watchdog.git || {};
  const projectStatus = watchdog.projectStatusSnapshot || {};
  const secretScan = watchdog.security?.secretScan || {};
  const telegramConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

  if (secretScan.exposed) {
    findings.push(createFinding("P0", "security", "Potential secret exposure detected", secretScan.detail, { affectsBetaStable: true }));
  }

  if (health.ok === false) {
    const evidence = Array.isArray(health.attempts) && health.attempts.length > 0
      ? health.attempts.map((attempt) => `${attempt.url}: ${attempt.detail}`).join("; ")
      : `${health.url || "unknown"} ${health.detail || ""}`.trim();
    findings.push(createFinding("P0", "devops", "GET /api/health failed", evidence, { affectsBetaStable: true }));
  }

  const healthDb = health.payload?.checks?.db || health.payload?.checks?.database;
  if (db.present && healthDb && healthDb !== "ok") {
    findings.push(createFinding("P0", "db", "Database health failed while DATABASE_URL is configured", `health db=${healthDb}`, { affectsBetaStable: true }));
  }

  const buildStatus = String(projectStatus.build?.status || "").toLowerCase();
  if (/\bfailed|broken\b/.test(buildStatus)) {
    findings.push(createFinding("P0", "qa", "Last known build is broken", `runtime/project-status.json build.status=${buildStatus}`, { affectsBetaStable: true }));
  }

  const smokeStatus = String(projectStatus.smokeBrowser?.status || "").toLowerCase();
  if (/\bfailed|broken\b/.test(smokeStatus)) {
    findings.push(createFinding("P0", "qa", "Last known smoke check is failing", `runtime/project-status.json smokeBrowser.status=${smokeStatus}`, { affectsBetaStable: true }));
  }

  if (!db.present) {
    const docker = watchdog.environment?.docker || {};
    const evidence = [
      "No DATABASE_URL in process env or local env files",
      `docker=${docker.dockerAvailable ? "available" : "unavailable"}`,
      `dockerCompose=${docker.composeFileExists ? "present" : "missing"}`,
    ].join("; ");
    findings.push(createFinding("P1", "db", "Configure local PostgreSQL DATABASE_URL", evidence, { affectsBetaStable: true }));
  }

  if (git.pushPending) {
    findings.push(createFinding("P1", "github", "GitHub push is pending", `${git.branch || "unknown"} ${git.detail || ""}`.trim(), { affectsBetaStable: true }));
  }

  if (git.dirty) {
    findings.push(createFinding("P1", "github", "Worktree is dirty", `${git.dirtyCount || 0} changed/untracked entries`, { affectsBetaStable: true }));
  }

  if (!watchdog.checks?.gitRemote?.configured) {
    findings.push(createFinding("P1", "github", "GitHub origin is missing", "git remote -v did not expose origin", { affectsBetaStable: true }));
  }

  if (!db.present && watchdog.files?.cmsPresent) {
    findings.push(createFinding("P1", "cms", "CMS is operating without a configured database", "CMS files exist but DATABASE_URL is absent", { affectsBetaStable: true }));
  }

  if (!db.present && watchdog.files?.fileFallbackPresent) {
    findings.push(createFinding("P1", "db", "File fallback remains active because DB is absent", "src/lib/storage/fileStore.ts exists and DATABASE_URL is absent", { affectsBetaStable: true }));
  }

  if (!telegramConfigured) {
    findings.push(createFinding("P2", "devops", "Telegram credentials are absent", "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing", { localModelEligible: true }));
  }

  return {
    generatedAt: nowIso(),
    source: "runtime/autonomous/watchdog-latest.json",
    findings,
    p0: findings.filter((finding) => finding.severity === "P0"),
    p1: findings.filter((finding) => finding.severity === "P1"),
    p2: findings.filter((finding) => finding.severity === "P2"),
  };
}

function markdownCommandResult(name, result) {
  if (!result) return `- ${name}: not run`;
  const status = result.skipped ? result.reason || "skipped" : result.status;
  return `- ${name}: ${status}`;
}

function forbiddenRuntimePath(file) {
  const normalized = normalizePath(file);
  return (
    normalized.startsWith(".env") ||
    normalized.startsWith("runtime/logs/") ||
    normalized.startsWith("runtime/heartbeats/") ||
    normalized.includes("private") ||
    /\.(pem|key|p12|crt|cer)$/i.test(normalized)
  );
}

module.exports = {
  OPS_DIRS,
  OUTPUT_LIMIT,
  PREFERRED_LOCAL_MODELS,
  ROOT,
  absolutePath,
  classifyWatchdog,
  detectDocker,
  ensureDir,
  ensureOpsDirs,
  forbiddenRuntimePath,
  getCurrentBranch,
  getDatabaseSignal,
  getGitRemote,
  getGitStatus,
  getGitSyncStatus,
  httpHealthCheck,
  markdownCommandResult,
  normalizePath,
  nowIso,
  readJson,
  readProjectStatus,
  readText,
  recommendedAgent,
  runCheapSecretScan,
  runPackageScript,
  runShell,
  todayCompact,
  writeJson,
  writeText,
};
