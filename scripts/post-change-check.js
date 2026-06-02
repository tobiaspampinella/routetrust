#!/usr/bin/env node
const { spawn, spawnSync } = require("node:child_process");
const {
  ensureOpsDirs,
  nowIso,
  runPackageScript,
  writeJson,
  writeText,
} = require("./autonomous-ops-lib.js");

const VALIDATION_CHECKS = ["typecheck", "lint", "test", "build", "qa:smoke"];
const CHECKS = [...VALIDATION_CHECKS, "beta-check"];

async function httpCheck(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, { redirect: "manual", signal: controller.signal });
    const body = await response.text().catch(() => "");
    clearTimeout(timeout);
    return { ok: true, status: response.status, body };
  } catch (error) {
    clearTimeout(timeout);
    return { ok: false, status: 0, body: String(error.message || error) };
  }
}

async function isRouteTrustServer(baseUrl) {
  const health = await httpCheck(`${baseUrl}/api/health`);
  if (!health.ok || health.status !== 200) return false;
  try {
    return JSON.parse(health.body || "{}").app === "RouteTrust";
  } catch {
    return false;
  }
}

async function startBetaRuntime() {
  for (const port of [3000, 3001, 3002]) {
    const baseUrl = `http://127.0.0.1:${port}`;
    if (await isRouteTrustServer(baseUrl)) return { baseUrl, port, child: null, reused: true };
  }

  const port = 3000;
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.platform === "win32" ? "npm.cmd run dev" : "npm run dev", {
    cwd: process.cwd(),
    shell: true,
    stdio: "ignore",
    windowsHide: true,
    env: {
      ...process.env,
      PORT: String(port),
    },
  });

  const startedAt = Date.now();
  while (Date.now() - startedAt < 120000) {
    if (await isRouteTrustServer(baseUrl)) return { baseUrl, port, child, reused: false };
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  stopBetaRuntime(child);
  throw new Error(`Could not start RouteTrust runtime for beta-check at ${baseUrl}`);
}

function stopBetaRuntime(child) {
  if (!child || !child.pid || child.killed) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

async function runChecks() {
  const validationResults = VALIDATION_CHECKS.map((script) => ({
    script,
    result: runPackageScript(script, { timeoutMs: script === "build" || script === "beta-check" ? 600000 : 300000 }),
  }));

  writeJson("runtime/reports/post-change-current-validation.json", {
    generatedAt: nowIso(),
    source: "post-change-check",
    results: validationResults.map((entry) => ({
      script: entry.script,
      result: entry.result,
    })),
  });

  let runtime = null;
  try {
    runtime = await startBetaRuntime();
    process.env.APP_URL = runtime.baseUrl;
    process.env.NEXT_PUBLIC_APP_URL = runtime.baseUrl;
    return validationResults.concat({
      script: "beta-check",
      result: runPackageScript("beta-check", { args: ["--reuse-current-validation"], timeoutMs: 600000 }),
    });
  } catch (error) {
    return validationResults.concat({
      script: "beta-check",
      result: {
        command: "npm run beta-check -- --reuse-current-validation",
        status: 1,
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.message : String(error),
      },
    });
  } finally {
    if (runtime && !runtime.reused) stopBetaRuntime(runtime.child);
  }
}

function writeReport(report) {
  const lines = [
    "# Post-change Check Report",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: ${report.passed ? "PASSED" : "FAILED"}`,
    "",
    ...report.results.map((entry) => `- npm run ${entry.script}: ${entry.result.status}`),
  ];
  writeText("runtime/reports/post-change-latest.md", `${lines.join("\n")}\n`);
}

async function main() {
  ensureOpsDirs();
  const results = await runChecks();
  const report = {
    generatedAt: nowIso(),
    checks: CHECKS,
    results,
    passed: results.every((entry) => entry.result.status === 0),
  };
  writeJson("runtime/reports/post-change-latest.json", report);
  writeReport(report);
  console.log(JSON.stringify({
    generatedAt: report.generatedAt,
    passed: report.passed,
    results: report.results.map((entry) => ({ script: entry.script, status: entry.result.status })),
  }, null, 2));
  if (!report.passed) process.exit(1);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
