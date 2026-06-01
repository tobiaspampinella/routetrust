import test from "node:test";
import assert from "node:assert/strict";
import { createBugReport, routeBugReport } from "@/lib/bugReporting";

test("createBugReport builds a durable ticket shape with category and agents", () => {
  const report = createBugReport({
    source: "admin",
    module: "driver",
    category: "ux",
    intent: "ux_review",
    description: "Driver route button is blocked after pause and the flow is confusing.",
    routePath: "/driver/route",
    assignedAgents: ["Bug Triage Agent", "UX Agent", "QA Validation Agent"],
  });

  assert.equal(report.severity, "P2");
  assert.equal(report.status, "new");
  assert.equal(report.module, "driver");
  assert.equal(report.category, "ux");
  assert.ok(report.assignedAgents.includes("UX Agent"));
  assert.ok(report.title.includes("[UX]"));
  assert.ok(report.id.startsWith("bug-"));
});

test("routeBugReport escalates security tickets correctly", () => {
  const report = createBugReport({
    source: "admin",
    module: "auth",
    category: "security",
    intent: "security_review",
    description: "Auth page leaks token and secret in client HTML.",
  });

  const routing = routeBugReport(report);

  assert.equal(report.severity, "P0");
  assert.equal(routing.primaryAgent, "Bug Triage Agent");
  assert.equal(routing.escalationLane, "security");
  assert.ok(routing.collaboratingAgents.includes("Cybersecurity Validation Agent"));
  assert.equal(routing.notifyTelegram, true);
});
