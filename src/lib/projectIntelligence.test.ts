import test from "node:test";
import assert from "node:assert/strict";
import { buildProjectIntelligenceReport, renderProjectIntelligenceMessage } from "@/lib/projectIntelligence";

test("buildProjectIntelligenceReport exposes beta core status without secrets", () => {
  const report = buildProjectIntelligenceReport({
    appVersion: "v0.14",
    buildStatus: "ready",
    modules: [
      { name: "CMS/Admin CEO overview", status: "implemented" },
      { name: "Telegram Project Intelligence Bot", status: "implemented" },
      { name: "Billing", status: "excluded" },
    ],
    risks: ["No production DB"],
  });

  assert.equal(report.buildStatus, "ready");
  assert.equal(report.implementedModules, 2);
  assert.equal(report.excludedModules, 1);
  assert.deepEqual(report.risks, ["No production DB"]);
  assert.equal(JSON.stringify(report).includes("TELEGRAM_BOT_TOKEN"), false);
});

test("renderProjectIntelligenceMessage is compact and operational", () => {
  const report = buildProjectIntelligenceReport({
    appVersion: "v0.14",
    buildStatus: "ready",
    modules: [{ name: "Demo Sandbox", status: "implemented" }],
    risks: [],
  });

  const message = renderProjectIntelligenceMessage(report);

  assert.match(message, /RoutePulse AI/);
  assert.match(message, /Demo Sandbox/);
  assert.ok(message.length < 900);
});
