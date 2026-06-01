import test from "node:test";
import assert from "node:assert/strict";
import { buildDemoRouteSimulation, createRouteSimulationEvent } from "@/lib/routeSimulationEngine";
import { initialRoutePulseData } from "@/data/mockData";

test("buildDemoRouteSimulation returns a stable beta snapshot", () => {
  const snapshot = buildDemoRouteSimulation({
    trackingCms: initialRoutePulseData.trackingCms,
    settings: initialRoutePulseData.settings,
    now: initialRoutePulseData.trackingCms.simulationStartedAt ?? Date.now(),
  });

  assert.equal(snapshot.mode, "demo");
  assert.ok(snapshot.order);
  assert.equal(snapshot.packages.length, initialRoutePulseData.trackingCms.demoStops.length);
  assert.ok(snapshot.mapFallbackReady);
  assert.match(snapshot.customerEtaWindow, /:|Entregado/);
});

test("createRouteSimulationEvent creates auditable event payloads", () => {
  const event = createRouteSimulationEvent({
    type: "incident_created",
    actor: "Driver Demo",
    detail: "Blocked street near stop 3",
    tenantId: "tenant-demo-latam",
    routeId: "route-001",
    severity: "high",
  });

  assert.equal(event.type, "incident_created");
  assert.equal(event.tenantId, "tenant-demo-latam");
  assert.equal(event.routeId, "route-001");
  assert.equal(event.severity, "high");
  assert.ok(event.id.startsWith("sim-event-"));
  assert.ok(Date.parse(event.createdAt));
});
