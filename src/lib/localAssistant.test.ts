import test from "node:test";
import assert from "node:assert/strict";
import { buildPageContext, classifyAssistantRequest } from "@/lib/localAssistant";

test("buildPageContext detects driver route pages", () => {
  const context = buildPageContext("/driver/route");

  assert.equal(context.pageKey, "driver-route");
  assert.equal(context.module, "driver");
  assert.equal(context.source, "driver");
});

test("classifyAssistantRequest routes security issues to security validation", () => {
  const decision = classifyAssistantRequest({
    message: "Security bug: token exposed on login page",
    pathname: "/login",
    userRole: "admin",
  });

  assert.equal(decision.category, "security");
  assert.equal(decision.intent, "security_review");
  assert.equal(decision.severity, "P0");
  assert.ok(decision.assignedAgents.includes("Cybersecurity Validation Agent"));
  assert.equal(decision.primaryAgent, "Bug Triage Agent");
  assert.equal(decision.shouldCreateTicket, true);
});

test("classifyAssistantRequest keeps public support contextual without forced ticketing", () => {
  const decision = classifyAssistantRequest({
    message: "Como funciona esta pagina",
    pathname: "/",
    userRole: null,
  });

  assert.equal(decision.pageContext.pageKey, "landing");
  assert.equal(decision.intent, "support_request");
  assert.equal(decision.shouldCreateTicket, false);
});

test("classifyAssistantRequest routes driver UX blockers to UX and engineering", () => {
  const decision = classifyAssistantRequest({
    message: "El boton de entregar en driver route esta confuso y a veces queda bloqueado",
    pathname: "/driver/route",
    userRole: "driver",
  });

  assert.equal(decision.pageContext.pageKey, "driver-route");
  assert.equal(decision.category, "ux");
  assert.equal(decision.severity, "P1");
  assert.ok(decision.assignedAgents.includes("UX Agent"));
  assert.ok(decision.assignedAgents.includes("Full Stack Bug Fix Agent"));
  assert.equal(decision.shouldCreateTicket, true);
});
