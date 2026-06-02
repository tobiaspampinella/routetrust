#!/usr/bin/env node
const { spawn, spawnSync } = require("node:child_process");

const DEFAULT_PORTS = [3000, 3001, 3002];

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
    const payload = JSON.parse(health.body || "{}");
    return payload.app === "RouteTrust";
  } catch {
    return false;
  }
}

async function chooseRuntime() {
  const envBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
  if (envBaseUrl && (await isRouteTrustServer(envBaseUrl))) {
    return {
      port: new URL(envBaseUrl).port || "80",
      baseUrl: envBaseUrl.replace(/\/$/, ""),
      reuseExistingServer: true,
    };
  }

  for (const port of DEFAULT_PORTS) {
    const baseUrl = `http://127.0.0.1:${port}`;
    if (await isRouteTrustServer(baseUrl)) {
      return {
        port: String(port),
        baseUrl,
        reuseExistingServer: true,
      };
    }
  }

  const preferred = await httpCheck("http://127.0.0.1:3000/login");
  const port = !preferred.ok || preferred.status >= 500 ? "3000" : "3001";
  return {
    port,
    baseUrl: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  };
}

function startManagedServer(runtime) {
  const npmCommand = process.platform === "win32" ? "npm.cmd run dev" : "npm run dev";
  const child = spawn(npmCommand, {
    shell: true,
    stdio: "ignore",
    windowsHide: true,
    env: {
      ...process.env,
      PORT: String(runtime.port),
    },
  });

  return child;
}

function stopManagedServer(child) {
  if (!child || !child.pid || child.killed) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }

  child.kill("SIGTERM");
}

async function waitForServer(baseUrl, timeoutMs = 120000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isRouteTrustServer(baseUrl)) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function runPlaywright(runtime, managedServer) {
  const cliEntry = require.resolve("@playwright/test/cli");
  const child = spawn(
    process.execPath,
    [cliEntry, "test", "tests/e2e/smoke.spec.ts", "--workers=1"],
    {
      stdio: "inherit",
      shell: false,
      env: {
        ...process.env,
        PLAYWRIGHT_PORT: String(runtime.port),
        PLAYWRIGHT_BASE_URL: runtime.baseUrl,
        PLAYWRIGHT_NO_WEB_SERVER: "1",
      },
    },
  );

  child.on("exit", (code, signal) => {
    stopManagedServer(managedServer);
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });

  child.on("error", (error) => {
    stopManagedServer(managedServer);
    console.error(`qa:smoke runtime wrapper failed: ${error.message}`);
    process.exit(1);
  });
}

(async function main() {
  const runtime = await chooseRuntime();
  let managedServer = null;

  if (!runtime.reuseExistingServer) {
    managedServer = startManagedServer(runtime);
    const ready = await waitForServer(runtime.baseUrl);
    if (!ready) {
      stopManagedServer(managedServer);
      console.error(`QA smoke runtime could not start RouteTrust at ${runtime.baseUrl}`);
      process.exit(1);
    }
  }

  console.log(`QA smoke runtime using port ${runtime.port}${runtime.reuseExistingServer ? " (existing server)" : " (managed server)"}`);
  runPlaywright(runtime, managedServer);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
