const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const RUNTIME_DIRS = [
  "runtime/autonomous",
  "runtime/tasks",
  "runtime/decisions",
  "runtime/local-model",
  "runtime/codex-queue",
  "runtime/github-sync",
  "runtime/reports",
];

const SECRET_PATTERNS = [
  { name: "openai_api_key", pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "google_api_key", pattern: /AIza[0-9A-Za-z_-]{20,}/ },
  { name: "github_token", pattern: /gh[pousr]_[A-Za-z0-9_]{30,}/ },
  { name: "slack_token", pattern: /xox[baprs]-[A-Za-z0-9-]{20,}/ },
  { name: "private_key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/ },
];

const FORBIDDEN_PUSH_PATTERNS = [
  /^\.env$/,
  /^\.env\.(?!example$|local\.example$).+/,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.cer$/,
  /\.crt$/,
  /^runtime\//,
  /^runtime\/heartbeats\//,
  /^runtime\/logs\//,
];

function nowIso() {
  return new Date().toISOString();
}

function rootPath(relativePath) {
  return path.join(ROOT, relativePath);
}

function ensureDir(relativePath) {
  fs.mkdirSync(rootPath(relativePath), { recursive: true });
}

function ensureRuntimeDirs() {
  for (const dir of RUNTIME_DIRS) ensureDir(dir);
}

function fileExists(relativePath) {
  return fs.existsSync(rootPath(relativePath));
}

function readText(relativePath, fallback = "") {
  const file = rootPath(relativePath);
  if (!fs.existsSync(file)) return fallback;
  return fs.readFileSync(file, "utf8");
}

function writeText(relativePath, content) {
  const file = rootPath(relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function readJson(relativePath, fallback = null) {
  try {
    const text = readText(relativePath, "");
    if (!text.trim()) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function writeJson(relativePath, data) {
  writeText(relativePath, `${JSON.stringify(data, null, 2)}\n`);
}

function truncate(value, max = 12000) {
  const text = String(value || "");
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n[truncated ${text.length - max} chars]`;
}

function runShell(command, options = {}) {
  const startedAt = nowIso();
  const result = spawnSync(command, {
    cwd: ROOT,
    shell: true,
    encoding: "utf8",
    timeout: options.timeoutMs || 30000,
    env: { ...process.env, ...(options.env || {}) },
    input: options.input,
  });
  return {
    command,
    startedAt,
    finishedAt: nowIso(),
    status: typeof result.status === "number" ? result.status : result.error ? 1 : 0,
    stdout: truncate(result.stdout || ""),
    stderr: truncate(result.stderr || ""),
    error: result.error ? result.error.message : "",
  };
}

function runNpmScript(scriptName, options = {}) {
  return runShell(`npm run ${scriptName}`, options);
}

function getGitStatus() {
  const result = runShell("git status --short --branch", { timeoutMs: 15000 });
  const lines = `${result.stdout}\n${result.stderr}`.split(/\r?\n/).filter(Boolean);
  const branchLine = lines.find((line) => line.startsWith("##")) || "";
  const entries = lines.filter((line) => !line.startsWith("##"));
  return {
    result,
    branchLine,
    dirty: entries.length > 0,
    changedCount: entries.length,
    entries: entries.slice(0, 50),
  };
}

function getGitRemote() {
  return runShell("git remote -v", { timeoutMs: 15000 });
}

function getGitAheadBehind() {
  const upstream = runShell("git rev-parse --abbrev-ref --symbolic-full-name @{upstream}", { timeoutMs: 15000 });
  if (upstream.status !== 0) {
    return {
      configured: false,
      upstream: null,
      ahead: null,
      behind: null,
      pushPending: false,
      detail: "No upstream configured.",
    };
  }

  const ahead = runShell("git rev-list --count @{upstream}..HEAD", { timeoutMs: 15000 });
  const behind = runShell("git rev-list --count HEAD..@{upstream}", { timeoutMs: 15000 });
  const aheadCount = ahead.status === 0 ? Number.parseInt(ahead.stdout.trim(), 10) || 0 : null;
  const behindCount = behind.status === 0 ? Number.parseInt(behind.stdout.trim(), 10) || 0 : null;
  return {
    configured: true,
    upstream: upstream.stdout.trim(),
    ahead: aheadCount,
    behind: behindCount,
    pushPending: (aheadCount || 0) > 0,
    detail: `upstream=${upstream.stdout.trim()} ahead=${aheadCount ?? "unknown"} behind=${behindCount ?? "unknown"}`,
  };
}

function parseEnvPresence(file, key) {
  const text = readText(file, "");
  return text
    .split(/\r?\n/)
    .some((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith("#") && new RegExp(`^${key}\\s*=`).test(trimmed) && trimmed.split("=").slice(1).join("=").trim().length > 0;
    });
}

function getDatabaseUrlStatus() {
  const sources = [];
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) sources.push("process.env");
  for (const file of [".env.local", ".env"]) {
    if (parseEnvPresence(file, "DATABASE_URL")) sources.push(file);
  }
  return {
    present: sources.length > 0,
    sources,
  };
}

async function checkHealthEndpoint() {
  const candidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ]
    .filter(Boolean)
    .map((url) => url.replace(/\/$/, ""));

  const attempts = [];
  for (const baseUrl of candidates) {
    const url = `${baseUrl}/api/health`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const response = await fetch(url, { signal: controller.signal });
      const body = await response.text().catch(() => "");
      let payload = null;
      try {
        payload = JSON.parse(body);
      } catch {
        payload = null;
      }
      const attempt = {
        url,
        ok: response.status === 200,
        status: response.status,
        detail: `HTTP ${response.status}`,
        payload,
      };
      attempts.push(attempt);
      if (attempt.ok) return { ...attempt, attempts };
    } catch (error) {
      attempts.push({
        url,
        ok: false,
        status: 0,
        detail: error.message,
        payload: null,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    url: candidates[0] ? `${candidates[0]}/api/health` : "unknown",
    ok: false,
    status: 0,
    detail: attempts.map((item) => `${item.url}: ${item.detail}`).join("; ") || "No health candidates.",
    payload: null,
    attempts,
  };
}

function scanTrackedFilesForSecrets() {
  const listed = runShell("git ls-files", { timeoutMs: 20000 });
  if (listed.status !== 0) {
    return {
      ok: false,
      findings: [],
      error: listed.stderr || listed.error || "git ls-files failed",
    };
  }

  const candidates = listed.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => /^(src|scripts|config|\.github)\//.test(file) || /^(package\.json|next\.config\.ts|middleware\.ts)$/.test(file));

  const findings = [];
  for (const file of candidates) {
    const absolute = rootPath(file);
    if (!fs.existsSync(absolute)) continue;
    const stat = fs.statSync(absolute);
    if (!stat.isFile() || stat.size > 2_000_000) continue;
    const text = fs.readFileSync(absolute, "utf8");
    for (const check of SECRET_PATTERNS) {
      if (check.pattern.test(text)) {
        findings.push({ file, pattern: check.name });
      }
    }
  }

  return {
    ok: findings.length === 0,
    findings,
    error: "",
  };
}

function getTrackedForbiddenFiles() {
  const listed = runShell("git ls-files", { timeoutMs: 20000 });
  if (listed.status !== 0) return [];
  return listed.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => FORBIDDEN_PUSH_PATTERNS.some((pattern) => pattern.test(file.replace(/\\/g, "/"))));
}

function loadProjectStatus() {
  return readJson("runtime/project-status.json", {});
}

function makeFinding(severity, module, reason, evidence, options = {}) {
  return {
    severity,
    module,
    reason,
    evidence,
    affectsBetaStable: options.affectsBetaStable !== false,
    localModelEligible: Boolean(options.localModelEligible),
    recommendedAgent:
      options.recommendedAgent ||
      (severity === "P2"
        ? "Local model or backlog"
        : module === "security" || module === "auth"
          ? "Codex GPT-5.5 Security Lead"
          : module === "db" || module === "cms"
            ? "Codex GPT-5.5 Backend Lead"
            : module === "qa"
              ? "Codex GPT-5.5 QA Lead"
              : "Codex GPT-5.5 DevOps Lead"),
  };
}

function dedupeFindings(findings) {
  const seen = new Set();
  const result = [];
  for (const finding of findings) {
    const key = `${finding.severity}|${finding.module}|${finding.reason}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(finding);
  }
  return result;
}

function statusIsBad(value) {
  return /failed|fail|broken|blocked|error/i.test(String(value || ""));
}

function classifyWatchdog(watchdog) {
  const findings = [];
  const health = watchdog.health || {};
  const projectStatus = watchdog.projectStatus || {};
  const db = watchdog.database || {};
  const git = watchdog.git || {};
  const security = watchdog.security || {};
  const healthPayload = health.payload || {};
  const checks = healthPayload.checks || {};
  const betaStatus = projectStatus.beta || {};
  const freshBetaReport = watchdog.betaCheckReport || null;
  const staleBetaBlockers = [
    ...(Array.isArray(betaStatus.blockers) ? betaStatus.blockers : []),
    ...(Array.isArray(healthPayload.betaBlockers) ? healthPayload.betaBlockers : []),
  ].filter(Boolean);
  const betaBlockers = freshBetaReport && Array.isArray(freshBetaReport.blockers) ? freshBetaReport.blockers.filter(Boolean) : staleBetaBlockers;
  const betaBlockerText = betaBlockers.join("; ");
  const betaFailedChecks = new Set(freshBetaReport ? [] : Array.isArray(betaStatus.failedChecks) ? betaStatus.failedChecks : []);

  if ((security.potentialSecrets || []).length > 0) {
    findings.push(
      makeFinding(
        "P0",
        "security",
        "Potential exposed secret pattern in tracked source",
        security.potentialSecrets.map((item) => `${item.file}:${item.pattern}`).join("; "),
      ),
    );
  }

  if (!health.ok) {
    findings.push(makeFinding("P0", "devops", "GET /api/health failed", health.detail || "No healthy local endpoint."));
  }

  if (statusIsBad(projectStatus.build?.status)) {
    findings.push(makeFinding("P0", "qa", "Last known build check is failing", `runtime/project-status.json build.status=${projectStatus.build.status}`));
  }

  if (statusIsBad(projectStatus.smokeBrowser?.status)) {
    findings.push(makeFinding("P0", "qa", "Last known smoke check is failing", `runtime/project-status.json smokeBrowser.status=${projectStatus.smokeBrowser.status}`));
  }

  if (db.present && checks.db === "fail") {
    findings.push(makeFinding("P0", "db", "Database health failed while DATABASE_URL is configured", healthPayload.details?.db || "health checks.db=fail"));
  }

  if (checks.auth === "missing") {
    findings.push(makeFinding("P0", "auth", "Auth is missing", "health checks.auth=missing"));
  }

  if (!db.present) {
    findings.push(makeFinding("P1", "db", "Configure local PostgreSQL DATABASE_URL", "DATABASE_URL is absent from process env, .env.local and .env."));
  }

  if (betaFailedChecks.has("prisma_validate") || /Prisma validation is blocked/i.test(betaBlockerText)) {
    findings.push(
      makeFinding(
        "P1",
        "db",
        "Prisma validation is blocked",
        betaBlockers.find((item) => /Prisma validation is blocked/i.test(item)) || "beta-check failed prisma_validate.",
      ),
    );
  }

  if (
    (db.present && !fileExists("prisma/migrations")) ||
    betaFailedChecks.has("prisma_migration_exists") ||
    /Prisma migration .*not been created|migration.*missing/i.test(betaBlockerText)
  ) {
    findings.push(
      makeFinding(
        "P1",
        "db",
        "Prisma migration baseline is missing",
        betaBlockers.find((item) => /Prisma migration .*not been created|migration.*missing/i.test(item)) || "prisma/migrations directory is missing.",
      ),
    );
  }

  if (git.status?.dirty) {
    findings.push(makeFinding("P1", "github", "Worktree is dirty", `${git.status.changedCount} changed or untracked entries.`));
  }

  if (git.sync?.pushPending) {
    findings.push(makeFinding("P1", "github", "GitHub push pending", git.sync.detail));
  }

  if (!db.present && fileExists("src/app/admin/cms")) {
    findings.push(makeFinding("P1", "cms", "CMS is operating without a configured database", "CMS route exists and DATABASE_URL is absent."));
  }

  if (!db.present && fileExists("src/lib/storage/fileStore.ts")) {
    findings.push(makeFinding("P1", "db", "File fallback remains active because DB is absent", "src/lib/storage/fileStore.ts exists and DATABASE_URL is absent."));
  }

  if (health.ok && (healthPayload.storageMode === "file_fallback" || checks.persistence === "file_fallback")) {
    findings.push(makeFinding("P1", "db", "API persistence is still file fallback", `storageMode=${healthPayload.storageMode || checks.persistence}`));
  }

  if (health.ok && healthPayload.demoMode === true) {
    findings.push(makeFinding("P1", "auth", "Demo mode remains enabled", "health demoMode=true"));
  }

  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    findings.push(
      makeFinding("P2", "devops", "Telegram credentials are absent", "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.", {
        affectsBetaStable: false,
        localModelEligible: true,
      }),
    );
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    findings.push(
      makeFinding("P2", "frontend", "Premium maps credentials are absent", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing.", {
        affectsBetaStable: false,
        localModelEligible: true,
      }),
    );
  }

  const result = dedupeFindings(findings);
  return {
    findings: result,
    p0: result.filter((item) => item.severity === "P0"),
    p1: result.filter((item) => item.severity === "P1"),
    p2: result.filter((item) => item.severity === "P2"),
  };
}

function taskFilePolicy(module) {
  const forbiddenFiles = [
    ".env",
    ".env.local",
    ".env.*",
    ".env.production",
    "*.pem",
    "*.key",
    "*.p12",
    "*.cer",
    "*.crt",
  ];
  const common = ["docs/**", "scripts/**", "runtime/codex-queue/**"];
  const byModule = {
    db: [...common, "docker-compose.yml", "prisma/**", "src/lib/db/**", "src/lib/storage/**", "src/app/api/health/**", "src/app/api/bugs/**"],
    auth: [...common, "src/app/api/auth/**", "src/services/permissions/**", "src/middleware.ts", "middleware.ts"],
    cms: [...common, "src/app/admin/cms/**", "src/app/api/cms/**", "src/services/cms/**"],
    frontend: [...common, "src/app/**", "src/components/**"],
    github: [...common, ".github/**", "package.json"],
    devops: [...common, "package.json", "docker-compose.yml", ".github/**", "src/app/api/health/**", "src/lib/storage/**", "src/services/**"],
    security: [...common, "src/app/api/**", "src/services/**", "middleware.ts"],
    qa: [...common, "tests/**", "src/**/*.test.ts", "playwright.config.ts"],
  };
  return {
    allowedFiles: byModule[module] || common,
    forbiddenFiles,
  };
}

function slugify(value) {
  return String(value || "task")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function yyyymmdd(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function nextTaskId(existingTasks, severity) {
  const day = yyyymmdd();
  const prefix = `${severity}-${day}-`;
  const max = existingTasks
    .map((task) => task.id || "")
    .filter((id) => id.startsWith(prefix))
    .map((id) => Number.parseInt(id.slice(prefix.length), 10) || 0)
    .reduce((largest, value) => Math.max(largest, value), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function taskFromFinding(finding, existingTasks = []) {
  const policy = taskFilePolicy(finding.module);
  return {
    id: nextTaskId(existingTasks, finding.severity),
    severity: finding.severity,
    module: finding.module,
    reason: finding.reason,
    evidence: finding.evidence,
    recommendedAgent: finding.recommendedAgent,
    allowedFiles: policy.allowedFiles,
    forbiddenFiles: policy.forbiddenFiles,
    preChecks: ["npm run typecheck", "npm run lint", "npm test", "npm run qa:security"],
    postChecks: ["npm run typecheck", "npm run lint", "npm test", "npm run build", "npm run qa:smoke", "npm run beta-check"],
    status: "pending",
    requiresHumanApproval: false,
    branchName: `codex/${finding.severity}-${slugify(finding.module)}-${slugify(finding.reason)}`,
    requiresReviewBeforeMerge: true,
    createdAt: nowIso(),
  };
}

module.exports = {
  ROOT,
  RUNTIME_DIRS,
  ensureRuntimeDirs,
  ensureDir,
  fileExists,
  readText,
  writeText,
  readJson,
  writeJson,
  runShell,
  runNpmScript,
  nowIso,
  getGitStatus,
  getGitRemote,
  getGitAheadBehind,
  getDatabaseUrlStatus,
  checkHealthEndpoint,
  scanTrackedFilesForSecrets,
  getTrackedForbiddenFiles,
  loadProjectStatus,
  classifyWatchdog,
  taskFromFinding,
  taskFilePolicy,
  slugify,
};
