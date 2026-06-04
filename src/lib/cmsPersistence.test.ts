import assert from "node:assert/strict";
import test from "node:test";

import {
  mapDbApprovalToDomain,
  mapDbIncidentToDomain,
  mapDomainApprovalToDb,
  mapDomainIncidentToDb,
  normalizeApprovalAction,
  normalizeApprovalStatus,
  normalizeCmsRole,
  normalizeIncidentSeverity,
  normalizeIncidentStatus,
} from "../services/cms/cmsDbMapping";

test("CMS incident DB mapping normalizes unsafe enum values", () => {
  const incident = mapDbIncidentToDomain({
    id: "incident-001",
    tenantId: "tenant-demo-latam",
    title: "Blocked street",
    status: "invalid",
    severity: "critical",
    ownerRole: "root",
    routeId: null,
    detail: "Road closure near stop 3.",
    createdAt: new Date("2026-05-27T10:10:00.000Z"),
  });

  assert.equal(incident.status, "open");
  assert.equal(incident.severity, "medium");
  assert.equal(incident.ownerRole, "operations");
  assert.equal(incident.createdAt, "2026-05-27T10:10:00.000Z");
});

test("CMS approval DB mapping preserves human decision fields", () => {
  const approval = mapDbApprovalToDomain({
    id: "approval-001",
    tenantId: "tenant-demo-latam",
    action: "approve_suggested_routes",
    targetId: "route-002",
    title: "Approve route",
    detail: "SLA risk requires approval.",
    requestedBy: "RouteTrust AI",
    requestedAt: new Date("2026-05-27T09:28:00.000Z"),
    status: "approved",
    decidedBy: "Admin Demo",
    decidedAt: new Date("2026-05-27T09:40:00.000Z"),
    decisionReason: "Capacity confirmed.",
  });

  assert.equal(approval.action, "approve_suggested_routes");
  assert.equal(approval.status, "approved");
  assert.equal(approval.decidedBy, "Admin Demo");
  assert.equal(approval.decidedAt, "2026-05-27T09:40:00.000Z");
});

test("CMS domain mapping writes safe database payloads", () => {
  const incident = mapDomainIncidentToDb(
    {
      id: "incident-002",
      tenantId: "tenant-demo-latam",
      title: "Customer absent",
      status: "resolved",
      severity: "high",
      ownerRole: "customer_experience",
      routeId: "",
      createdAt: "invalid-date",
      detail: "Second visit scheduled.",
    },
    "tenant-demo-latam",
  );

  assert.equal(incident.routeId, null);
  assert.equal(incident.status, "resolved");
  assert.ok(incident.createdAt instanceof Date);
  assert.ok(incident.resolvedAt instanceof Date);

  const approval = mapDomainApprovalToDb(
    {
      id: "approval-002",
      tenantId: "tenant-demo-latam",
      action: "unknown" as never,
      targetId: "route-002",
      title: "Approve route",
      detail: "Needs human check.",
      requestedBy: "RouteTrust AI",
      requestedAt: "2026-05-27T09:28:00.000Z",
      status: "approved",
    },
    "tenant-demo-latam",
  );

  assert.equal(approval.action, "approve_suggested_routes");
  assert.equal(approval.status, "approved");
  assert.ok(approval.requestedAt instanceof Date);
});

test("CMS normalization helpers reject invalid UI and API values", () => {
  assert.equal(normalizeIncidentStatus("closed"), "open");
  assert.equal(normalizeIncidentSeverity("P0"), "medium");
  assert.equal(normalizeCmsRole("admin"), "operations");
  assert.equal(normalizeApprovalStatus("done"), "pending");
  assert.equal(normalizeApprovalAction("ship_it"), "approve_suggested_routes");
});
