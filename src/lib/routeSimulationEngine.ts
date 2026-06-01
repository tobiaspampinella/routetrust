import { buildDemoTrackingProjection, getTrackingSimulationElapsedSeconds } from "@/lib/trackingSimulation";
import type { CustomerTrackingCms, RouteStatus, SystemSettings } from "@/lib/types";

export type RouteSimulationEventType =
  | "sandbox_generated"
  | "simulation_started"
  | "simulation_paused"
  | "speed_changed"
  | "traffic_simulated"
  | "street_blocked"
  | "delay_simulated"
  | "delivery_completed"
  | "delivery_failed"
  | "incident_created"
  | "route_approval_requested"
  | "route_approved_by_human"
  | "route_rejected_by_human";

export type RouteSimulationSeverity = "low" | "medium" | "high";

export interface RouteSimulationEventInput {
  type: RouteSimulationEventType;
  actor: string;
  detail: string;
  tenantId: string;
  routeId?: string;
  severity?: RouteSimulationSeverity;
}

export interface RouteSimulationEvent extends RouteSimulationEventInput {
  id: string;
  createdAt: string;
}

export interface DemoRouteSimulationInput {
  trackingCms: CustomerTrackingCms;
  settings: SystemSettings;
  now?: number;
}

export function createRouteSimulationEvent(input: RouteSimulationEventInput, now = new Date()): RouteSimulationEvent {
  return {
    id: `sim-event-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now.toISOString(),
    severity: input.severity ?? "medium",
    ...input,
  };
}

export function buildDemoRouteSimulation({ trackingCms, settings, now = Date.now() }: DemoRouteSimulationInput) {
  const elapsedSeconds = getTrackingSimulationElapsedSeconds(trackingCms, now);
  const projection = buildDemoTrackingProjection(
    trackingCms.demoStops,
    settings,
    elapsedSeconds,
    trackingCms.showNextStopsCount,
    trackingCms.liveSimulationSpeed,
    trackingCms.simulationStarted || elapsedSeconds > 0,
  );

  return {
    mode: "demo" as const,
    elapsedSeconds,
    projection,
    route: projection.route,
    routeStatus: projection.routeStatus as RouteStatus,
    packages: projection.packages,
    order: projection.order,
    truckPosition: projection.truckPosition,
    trafficFactor: projection.trafficFactor,
    customerEtaWindow: projection.orderEtaWindow,
    mapFallbackReady: true,
    humanApprovalRequired: projection.trafficFactor >= 1.35 || projection.route.riskLevel === "high",
  };
}
