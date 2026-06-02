#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const { spawnSync } = require("node:child_process");
const {
  ROOT,
  ensureOpsDirs,
  nowIso,
  runShell,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const LOCAL_DB = {
  host: "127.0.0.1",
  port: "55432",
  database: "routetrust_local",
  user: "routetrust",
  password: "routetrust_local_password",
  postgresPassword: "routetrust_local_password",
};

const DATABASE_URL = `postgresql://${LOCAL_DB.user}:${LOCAL_DB.password}@${LOCAL_DB.host}:${LOCAL_DB.port}/${LOCAL_DB.database}?schema=public`;
const PORTABLE_POSTGRES_URL = "https://sbp.enterprisedb.com/getfile.jsp?fileid=1260202";
const PORTABLE_ROOT = path.join(ROOT, "runtime", "postgres");
const PORTABLE_ZIP = path.join(PORTABLE_ROOT, "postgresql-16.14-windows-x64-binaries.zip");
const PORTABLE_EXTRACT_DIR = path.join(PORTABLE_ROOT, "pgsql");
const PORTABLE_DATA_DIR = path.join(PORTABLE_ROOT, "data");
const PORTABLE_LOG = path.join(PORTABLE_ROOT, "postgres.log");

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function commandEnv(extra = {}) {
  const localBin = path.join(ROOT, "node_modules", ".bin");
  const pathValue = process.env.PATH || process.env.Path || "";
  return {
    ...process.env,
    PATH: [localBin, path.dirname(process.execPath), pathValue].filter(Boolean).join(path.delimiter),
    DATABASE_URL,
    ...extra,
  };
}

function runFile(file, args = [], options = {}) {
  const result = spawnSync(file, args, {
    cwd: ROOT,
    shell: false,
    encoding: "utf8",
    env: commandEnv(options.env || {}),
    timeout: options.timeoutMs || 120000,
    maxBuffer: 1024 * 1024 * 20,
  });

  return {
    command: options.redactedCommand || `${file} ${args.join(" ")}`,
    status: result.status ?? 1,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
    error: result.error ? result.error.message : "",
  };
}

function findExecutable(name, fallbacks = []) {
  const where = runShell(`where.exe ${name}`, { timeoutMs: 15000 });
  if (where.status === 0) {
    const match = where.stdout.split(/\r?\n/).find(Boolean);
    if (match) return match.trim();
  }

  for (const candidate of fallbacks) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function parseEnv(content) {
  const values = new Map();
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
    if (match && !line.trim().startsWith("#")) values.set(match[1], match[2]);
  }
  return values;
}

function updateEnvFile(relativeFile, requiredValues) {
  const file = absolute(relativeFile);
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const values = parseEnv(existing);
  const lines = existing.trimEnd() ? existing.trimEnd().split(/\r?\n/) : [
    "# RouteTrust generated local runtime environment.",
    "# This file is ignored by Git. Do not paste production secrets here.",
  ];

  for (const [key, value] of Object.entries(requiredValues)) {
    const existingValue = values.get(key)?.trim();
    const isLegacyLocalDatabaseUrl =
      key === "DATABASE_URL" &&
      existingValue &&
      /postgresql:\/\/routetrust:routetrust_local_password@(?:localhost|127\.0\.0\.1):5432\/routetrust_local\?schema=public/.test(existingValue);
    if (values.has(key) && existingValue && !isLegacyLocalDatabaseUrl) continue;
    const index = lines.findIndex((line) => new RegExp(`^\\s*${key}\\s*=`).test(line));
    const nextLine = `${key}=${value}`;
    if (index >= 0) lines[index] = nextLine;
    else lines.push(nextLine);
  }

  fs.writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

function ensureLocalEnv() {
  const authSecret = process.env.AUTH_SECRET?.trim() || `routetrust-local-${randomBytes(32).toString("hex")}`;
  const values = {
    DATABASE_URL,
    AUTH_SECRET: authSecret,
    ROUTEPULSE_DEMO_SECRET: authSecret,
    APP_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_MAP_PROVIDER: "maplibre",
    DEMO_MODE: "false",
    NODE_ENV: "development",
  };

  updateEnvFile(".env", values);
  updateEnvFile(".env.local", values);

  return {
    files: [".env", ".env.local"],
    databaseUrlConfigured: true,
    authSecretConfigured: true,
    demoMode: "false",
  };
}

function detectDocker() {
  const docker = runShell("docker --version", { timeoutMs: 15000 });
  const compose = runShell("docker compose version", { timeoutMs: 15000 });
  return {
    available: docker.status === 0 && compose.status === 0,
    docker,
    compose,
  };
}

function startDockerPostgres() {
  return runShell("docker compose up -d postgres", { timeoutMs: 180000 });
}

function portableBin(name) {
  return path.join(PORTABLE_EXTRACT_DIR, "bin", name);
}

function ensurePortablePostgres() {
  fs.mkdirSync(PORTABLE_ROOT, { recursive: true });
  if (!fs.existsSync(portableBin("psql.exe"))) {
    if (!fs.existsSync(PORTABLE_ZIP) || fs.statSync(PORTABLE_ZIP).size < 100 * 1024 * 1024) {
      const curl = findExecutable("curl.exe") || findExecutable("curl");
      const download = curl
        ? runFile(curl, ["-L", "--fail", "--output", PORTABLE_ZIP, PORTABLE_POSTGRES_URL], { timeoutMs: 20 * 60 * 1000, redactedCommand: "curl -L --fail --output runtime/postgres/postgresql-16.14-windows-x64-binaries.zip <edb-url>" })
        : runShell(`powershell -NoProfile -Command "Invoke-WebRequest -Uri '${PORTABLE_POSTGRES_URL}' -OutFile '${PORTABLE_ZIP}'"`, { timeoutMs: 20 * 60 * 1000 });
      if (download.status !== 0) {
        return { ok: false, step: { name: "portable_postgres_download", status: download.status, detail: download.stderr || download.error } };
      }
    }

    const tar = findExecutable("tar.exe") || findExecutable("tar");
    const expand = tar
      ? runFile(tar, ["-xf", PORTABLE_ZIP, "-C", PORTABLE_ROOT], { timeoutMs: 10 * 60 * 1000, redactedCommand: "tar -xf runtime/postgres/postgresql-16.14-windows-x64-binaries.zip -C runtime/postgres" })
      : runShell(`powershell -NoProfile -Command "Expand-Archive -LiteralPath '${PORTABLE_ZIP}' -DestinationPath '${PORTABLE_ROOT}' -Force"`, { timeoutMs: 10 * 60 * 1000 });
    if (expand.status !== 0) {
      return { ok: false, step: { name: "portable_postgres_extract", status: expand.status, detail: expand.stderr || expand.error } };
    }
  }

  if (!fs.existsSync(PORTABLE_DATA_DIR) || !fs.existsSync(path.join(PORTABLE_DATA_DIR, "PG_VERSION"))) {
    const pwFile = path.join(PORTABLE_ROOT, "postgres-password.txt");
    fs.writeFileSync(pwFile, `${LOCAL_DB.postgresPassword}\n`, "utf8");
    const initdb = runFile(portableBin("initdb.exe"), [
      "-D", PORTABLE_DATA_DIR,
      "-U", "postgres",
      "-A", "scram-sha-256",
      "--pwfile", pwFile,
      "-E", "UTF8",
    ], {
      timeoutMs: 180000,
      redactedCommand: "initdb -D runtime/postgres/data -U postgres --pwfile <redacted>",
    });
    if (initdb.status !== 0) {
      return { ok: false, step: { name: "portable_postgres_initdb", status: initdb.status, detail: initdb.stderr || initdb.error } };
    }
  }

  const start = runFile(portableBin("pg_ctl.exe"), [
    "-D", PORTABLE_DATA_DIR,
    "-l", PORTABLE_LOG,
    "-o", `-p ${LOCAL_DB.port}`,
    "start",
  ], {
    timeoutMs: 120000,
    redactedCommand: "pg_ctl -D runtime/postgres/data -l runtime/postgres/postgres.log start",
  });
  const alreadyRunning = /another server might be running|server is already running|PID file/.test(`${start.stdout}\n${start.stderr}`);
  if (start.status !== 0 && !alreadyRunning) {
    return { ok: false, step: { name: "portable_postgres_start", status: start.status, detail: start.stderr || start.error } };
  }

  return { ok: true, step: { name: "portable_postgres_start", status: 0, detail: alreadyRunning ? "already_running" : "OK" } };
}

function installPostgresWithWinget() {
  const winget = findExecutable("winget.exe");
  if (!winget) {
    return {
      status: 1,
      stdout: "",
      stderr: "winget is not available.",
      error: "",
      command: "winget install PostgreSQL.PostgreSQL.16",
    };
  }

  const override = [
    "--mode unattended",
    "--unattendedmodeui none",
    `--superpassword ${LOCAL_DB.postgresPassword}`,
    `--serverport ${LOCAL_DB.port}`,
    "--servicename postgresql-x64-16",
    "--disable-components stackbuilder",
  ].join(" ");

  return runFile(winget, [
    "install",
    "--id",
    "PostgreSQL.PostgreSQL.16",
    "--exact",
    "--silent",
    "--accept-package-agreements",
    "--accept-source-agreements",
    "--override",
    override,
  ], {
    timeoutMs: 20 * 60 * 1000,
    redactedCommand: "winget install PostgreSQL.PostgreSQL.16 --silent --override <local-postgres-options>",
  });
}

function startPostgresService() {
  return runShell("powershell -NoProfile -Command \"Get-Service postgresql* -ErrorAction SilentlyContinue | Where-Object {$_.Status -ne 'Running'} | Start-Service\"", { timeoutMs: 60000 });
}

function findPsql() {
  const fallbacks = [
    portableBin("psql.exe"),
    "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe",
  ];
  return findExecutable("psql.exe", fallbacks) || findExecutable("psql", fallbacks);
}

function psql(psqlPath, args, options = {}) {
  return runFile(psqlPath, args, {
    env: { PGPASSWORD: options.password || LOCAL_DB.postgresPassword },
    timeoutMs: options.timeoutMs || 60000,
    redactedCommand: `psql ${args.map((arg) => (String(arg).includes("PASSWORD") ? "<sql-redacted>" : arg)).join(" ")}`,
  });
}

function canConnectAsRouteTrust(psqlPath) {
  const result = psql(psqlPath, [
    "-h", LOCAL_DB.host,
    "-p", LOCAL_DB.port,
    "-U", LOCAL_DB.user,
    "-d", LOCAL_DB.database,
    "-tAc", "SELECT 1",
  ], { password: LOCAL_DB.password });
  return result.status === 0;
}

function ensureDatabaseWithPsql(psqlPath) {
  const steps = [];
  const createRole = psql(psqlPath, [
    "-h", LOCAL_DB.host,
    "-p", LOCAL_DB.port,
    "-U", "postgres",
    "-d", "postgres",
    "-v", "ON_ERROR_STOP=1",
    "-c",
    `DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${LOCAL_DB.user}') THEN CREATE ROLE ${LOCAL_DB.user} LOGIN PASSWORD '${LOCAL_DB.password}'; ELSE ALTER ROLE ${LOCAL_DB.user} WITH LOGIN PASSWORD '${LOCAL_DB.password}'; END IF; END $$;`,
  ]);
  steps.push({ name: "create_or_update_role", status: createRole.status, detail: createRole.status === 0 ? "OK" : createRole.stderr || createRole.error });
  if (createRole.status !== 0) return { ok: false, steps };

  const dbExists = psql(psqlPath, [
    "-h", LOCAL_DB.host,
    "-p", LOCAL_DB.port,
    "-U", "postgres",
    "-d", "postgres",
    "-tAc",
    `SELECT 1 FROM pg_database WHERE datname='${LOCAL_DB.database}'`,
  ]);
  steps.push({ name: "check_database", status: dbExists.status, detail: dbExists.status === 0 ? "OK" : dbExists.stderr || dbExists.error });
  if (dbExists.status !== 0) return { ok: false, steps };

  if (!dbExists.stdout.trim()) {
    const createDb = psql(psqlPath, [
      "-h", LOCAL_DB.host,
      "-p", LOCAL_DB.port,
      "-U", "postgres",
      "-d", "postgres",
      "-v", "ON_ERROR_STOP=1",
      "-c",
      `CREATE DATABASE ${LOCAL_DB.database} OWNER ${LOCAL_DB.user}`,
    ]);
    steps.push({ name: "create_database", status: createDb.status, detail: createDb.status === 0 ? "OK" : createDb.stderr || createDb.error });
    if (createDb.status !== 0) return { ok: false, steps };
  }

  const grantSchema = psql(psqlPath, [
    "-h", LOCAL_DB.host,
    "-p", LOCAL_DB.port,
    "-U", "postgres",
    "-d", LOCAL_DB.database,
    "-v", "ON_ERROR_STOP=1",
    "-c",
    `GRANT ALL PRIVILEGES ON DATABASE ${LOCAL_DB.database} TO ${LOCAL_DB.user}; GRANT ALL ON SCHEMA public TO ${LOCAL_DB.user};`,
  ]);
  steps.push({ name: "grant_database", status: grantSchema.status, detail: grantSchema.status === 0 ? "OK" : grantSchema.stderr || grantSchema.error });

  const routeTrustConnects = canConnectAsRouteTrust(psqlPath);
  steps.push({ name: "verify_routetrust_connection", status: routeTrustConnects ? 0 : 1, detail: routeTrustConnects ? "OK" : "routetrust user cannot connect" });

  return { ok: grantSchema.status === 0 && routeTrustConnects, steps };
}

function runPrisma() {
  const validate = runShell("npx prisma validate", { timeoutMs: 120000 });
  if (validate.status !== 0) return { ok: false, steps: [{ name: "prisma_validate", status: validate.status, detail: validate.stderr || validate.error }] };

  const migrate = runShell("npx prisma migrate deploy", { timeoutMs: 180000 });
  if (migrate.status !== 0) return { ok: false, steps: [{ name: "prisma_validate", status: 0, detail: "OK" }, { name: "prisma_migrate_deploy", status: migrate.status, detail: migrate.stderr || migrate.error }] };

  const generate = runShell("npx prisma generate", { timeoutMs: 180000 });
  if (generate.status !== 0) {
    return {
      ok: false,
      steps: [
        { name: "prisma_validate", status: 0, detail: "OK" },
        { name: "prisma_migrate_deploy", status: 0, detail: "OK" },
        { name: "prisma_generate", status: generate.status, detail: generate.stderr || generate.error },
      ],
    };
  }

  const seed = hasArg("no-seed") ? { status: "skipped", stderr: "", error: "" } : runShell("npm run db:seed", { timeoutMs: 180000 });
  return {
    ok: seed.status === 0 || seed.status === "skipped",
    steps: [
      { name: "prisma_validate", status: validate.status, detail: "OK" },
      { name: "prisma_migrate_deploy", status: migrate.status, detail: "OK" },
      { name: "prisma_generate", status: generate.status, detail: "OK" },
      { name: "prisma_seed", status: seed.status, detail: seed.status === 0 || seed.status === "skipped" ? "OK" : seed.stderr || seed.error },
    ],
  };
}

function main() {
  ensureOpsDirs();
  const generatedAt = nowIso();
  const env = ensureLocalEnv();
  const report = {
    generatedAt,
    database: "postgresql",
    databaseUrlConfigured: env.databaseUrlConfigured,
    envFiles: env.files,
    docker: null,
    psql: null,
    installedPostgres: false,
    portablePostgres: false,
    databaseReady: false,
    prismaReady: false,
    steps: [],
  };

  const docker = detectDocker();
  report.docker = { available: docker.available };
  if (docker.available) {
    const start = startDockerPostgres();
    report.steps.push({ name: "docker_compose_postgres", status: start.status, detail: start.status === 0 ? "OK" : start.stderr || start.error });
  }

  if (!docker.available && hasArg("portable-postgres")) {
    const portable = ensurePortablePostgres();
    report.portablePostgres = portable.ok;
    report.steps.push(portable.step);
  } else if (!docker.available && hasArg("install-postgres")) {
    const install = installPostgresWithWinget();
    report.installedPostgres = install.status === 0;
    report.steps.push({ name: "winget_install_postgres", status: install.status, detail: install.status === 0 ? "OK" : install.stderr || install.error || install.stdout });
    startPostgresService();
  } else if (!docker.available) {
    startPostgresService();
  }

  const psqlPath = findPsql();
  report.psql = { available: Boolean(psqlPath), path: psqlPath };
  if (psqlPath) {
    const db = ensureDatabaseWithPsql(psqlPath);
    report.databaseReady = db.ok;
    report.steps.push(...db.steps);
  } else if (docker.available) {
    report.databaseReady = true;
  } else {
    report.steps.push({ name: "psql_detection", status: 1, detail: "psql is unavailable; run with --install-postgres or install PostgreSQL 16." });
  }

  if (report.databaseReady) {
    const prisma = runPrisma();
    report.prismaReady = prisma.ok;
    report.steps.push(...prisma.steps);
  }

  report.status = report.databaseReady && report.prismaReady ? "DB_LOCAL_READY" : "DB_LOCAL_BLOCKED";
  writeJson("runtime/reports/db-local-bootstrap-latest.json", report);
  writeText("runtime/reports/db-local-bootstrap-latest.md", [
    "# Local DB Bootstrap Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${report.status}`,
    "",
    `- Database: ${report.database}`,
    `- Env files: ${report.envFiles.join(", ")}`,
    `- Docker available: ${report.docker.available ? "YES" : "NO"}`,
    `- psql available: ${report.psql.available ? "YES" : "NO"}`,
    `- Portable Postgres: ${report.portablePostgres ? "YES" : "NO"}`,
    `- DB ready: ${report.databaseReady ? "YES" : "NO"}`,
    `- Prisma ready: ${report.prismaReady ? "YES" : "NO"}`,
    "",
    "## Steps",
    "",
    ...report.steps.map((step) => `- ${step.name}: ${step.status}`),
  ].join("\n") + "\n");

  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    status: report.status,
    databaseReady: report.databaseReady,
    prismaReady: report.prismaReady,
    psqlAvailable: report.psql.available,
    dockerAvailable: report.docker.available,
    portablePostgres: report.portablePostgres,
  }, null, 2));

  if (report.status !== "DB_LOCAL_READY") process.exit(1);
}

main();
