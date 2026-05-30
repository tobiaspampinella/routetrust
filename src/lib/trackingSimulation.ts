import type {
  CustomerTrackingCms,
  DeliveryPackage,
  EtaConfidence,
  OperationalRisk,
  RoutePlan,
  SystemSettings,
  TrackingDemoStop,
  TrafficLevel,
} from "@/lib/types";
import { addMinutesToTime } from "@/lib/etaCalculations";

export interface TrackingProjectionStop {
  id: string;
  label: string;
  locality: string;
  etaWindow: string;
  minutesFromNow: number;
  kind: "current" | "before_customer" | "customer" | "after_customer";
  status: DeliveryPackage["status"];
  x: number;
  y: number;
}

export interface TrackingRoutePoint {
  x: number;
  y: number;
}

const stopCoordinates = [
  { x: 18, y: 78 },
  { x: 26, y: 64 },
  { x: 34, y: 53 },
  { x: 46, y: 45 },
  { x: 58, y: 37 },
  { x: 70, y: 29 },
  { x: 82, y: 20 },
];

const trafficMultipliers: Record<TrafficLevel, number> = {
  low: 0.85,
  medium: 1.15,
  high: 1.45,
};

const demoRouteId = "track-demo-route";
const demoDriverId = "driver-demo-tracking";
const demoVehicleId = "unit-demo-tracking";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function pointAtProgress(progress: number) {
  const safeProgress = clamp(progress, 0, 1);
  const coordinateIndex = Math.min(Math.floor(safeProgress * (stopCoordinates.length - 1)), stopCoordinates.length - 2);
  const nextCoordinate = stopCoordinates[coordinateIndex + 1];
  const currentCoordinate = stopCoordinates[coordinateIndex];
  const localProgress = safeProgress * (stopCoordinates.length - 1) - coordinateIndex;

  return {
    x: currentCoordinate.x + (nextCoordinate.x - currentCoordinate.x) * localProgress,
    y: currentCoordinate.y + (nextCoordinate.y - currentCoordinate.y) * localProgress,
  };
}

function coordinateForStop(index: number, totalStops: number) {
  if (totalStops <= 1) return stopCoordinates[stopCoordinates.length - 1];
  return pointAtProgress((index + 1) / totalStops);
}

export function getTrackingSimulationElapsedSeconds(
  trackingCms: Pick<CustomerTrackingCms, "simulationStarted" | "simulationStartedAt" | "simulationPausedElapsedSeconds">,
  now = Date.now(),
) {
  const pausedElapsed = Math.max(Math.floor(trackingCms.simulationPausedElapsedSeconds ?? 0), 0);
  if (!trackingCms.simulationStarted || !trackingCms.simulationStartedAt) return pausedElapsed;

  return pausedElapsed + Math.max(Math.floor((now - trackingCms.simulationStartedAt) / 1000), 0);
}

export function calculateDemoTrafficFactor(stops: TrackingDemoStop[], elapsedSeconds: number) {
  if (!stops.length) return 1;

  const averageTraffic =
    stops.reduce((sum, stop) => sum + trafficMultipliers[stop.trafficLevel], 0) / Math.max(stops.length, 1);
  const routeDensity = Math.min(stops.length * 0.03, 0.15);
  const livePulse = Math.sin(elapsedSeconds / 32) * 0.04;

  return Number(clamp(averageTraffic + routeDensity + livePulse, 0.8, 1.65).toFixed(2));
}

export function estimateDemoStopMinutes(stop: TrackingDemoStop, index: number) {
  const transit = Math.round((5 + index * 2.5) * trafficMultipliers[stop.trafficLevel]);
  const priorityAdjustment = stop.priority === "urgent" ? -2 : stop.priority === "high" ? -1 : 0;
  return Math.max(transit + stop.dropoffMinutes + priorityAdjustment, 4);
}

export function getPendingRouteStops(routeId: string, packages: DeliveryPackage[]) {
  return packages
    .filter((item) => item.routeId === routeId && item.status !== "delivered" && item.status !== "failed")
    .sort((a, b) => a.sequence - b.sequence);
}

export function calculateLiveEtaMinutes(order: DeliveryPackage, elapsedSeconds: number, speed = 1) {
  if (order.status === "delivered") return 0;

  const base = Math.max(order.stopsBeforeCustomer * 7 + order.dropoffTimeMinutes + 4, 3);
  return Math.max(base - Math.floor(elapsedSeconds * Math.max(speed, 0.25)), 1);
}

export function buildTrackingProjection(
  route: RoutePlan,
  packages: DeliveryPackage[],
  order: DeliveryPackage,
  settings: SystemSettings,
  elapsedSeconds: number,
  visibleStops = 4,
  speed = 1,
) {
  const pendingStops = getPendingRouteStops(route.id, packages);
  const orderIndex = pendingStops.findIndex((item) => item.id === order.id);
  const safeOrderIndex = orderIndex >= 0 ? orderIndex : Math.min(2, pendingStops.length - 1);
  const startIndex = Math.max(safeOrderIndex - 2, 0);
  const selectedStops = pendingStops.slice(startIndex, startIndex + visibleStops);
  const liveEtaMinutes = calculateLiveEtaMinutes(order, elapsedSeconds, speed);
  const clock = addMinutesToTime(
    route.startedAt ?? settings.operationStartTime,
    Math.max(route.currentStopSequence - 1, 0) * (settings.baseDropoffMinutes + 6) + Math.floor(elapsedSeconds * Math.max(speed, 0.25)),
  );
  const orderEta = addMinutesToTime(clock, liveEtaMinutes);
  const progressBase = selectedStops.length > 1 ? (elapsedSeconds * Math.max(speed, 0.25)) / Math.max(liveEtaMinutes + 12, 1) : 0.35;
  const progress = Math.min(Math.max(progressBase, 0.08), 0.88);
  const coordinateIndex = Math.min(Math.floor(progress * (stopCoordinates.length - 1)), stopCoordinates.length - 2);
  const nextCoordinate = stopCoordinates[coordinateIndex + 1];
  const currentCoordinate = stopCoordinates[coordinateIndex];
  const localProgress = progress * (stopCoordinates.length - 1) - coordinateIndex;
  const truckPosition = {
    x: currentCoordinate.x + (nextCoordinate.x - currentCoordinate.x) * localProgress,
    y: currentCoordinate.y + (nextCoordinate.y - currentCoordinate.y) * localProgress,
  };

  const stops: TrackingProjectionStop[] = selectedStops.map((stop, index) => {
    const coordinate = stopCoordinates[Math.min(index + 2, stopCoordinates.length - 1)];
    const minutesFromNow =
      stop.id === order.id
        ? liveEtaMinutes
        : Math.max(liveEtaMinutes + (stop.sequence - order.sequence) * Math.max(settings.baseDropoffMinutes, 5), 2 + index * 4);
    const kind =
      stop.id === order.id
        ? "customer"
        : stop.sequence < order.sequence
          ? index === 0
            ? "current"
            : "before_customer"
          : "after_customer";

    return {
      id: stop.id,
      label: stop.id === order.id ? "Tu entrega" : `Parada ${index + 1}`,
      locality: stop.id === order.id ? stop.locality : "Parada previa anonima",
      etaWindow:
        stop.id === order.id
          ? `${addMinutesToTime(orderEta, -4)} - ${addMinutesToTime(orderEta, 6)}`
          : `${addMinutesToTime(clock, minutesFromNow)} aprox.`,
      minutesFromNow,
      kind,
      status: stop.status,
      x: coordinate.x,
      y: coordinate.y,
    };
  });

  return {
    liveEtaMinutes,
    orderEtaWindow: `${addMinutesToTime(orderEta, -4)} - ${addMinutesToTime(orderEta, 6)}`,
    stops,
    truckPosition,
    routeStatus: route.status,
    trafficFactor: 1,
  };
}

export function buildDemoTrackingProjection(
  stops: TrackingDemoStop[],
  settings: SystemSettings,
  elapsedSeconds: number,
  visibleStops = 4,
  speed = 1,
  started = false,
) {
  const safeStops = stops.slice(0, 5);
  const routePoints = stopCoordinates;
  const trafficFactor = calculateDemoTrafficFactor(safeStops, elapsedSeconds);
  const segmentMinutes = safeStops.map((stop, index) => estimateDemoStopMinutes(stop, index));
  const totalMinutes = segmentMinutes.reduce((sum, item) => sum + item, 0);
  const elapsedMinutes = started ? Math.max(elapsedSeconds * Math.max(speed, 0.25), 0) : 0;
  const completed = started && totalMinutes > 0 && elapsedMinutes >= totalMinutes;
  const progress = started && totalMinutes ? clamp(elapsedMinutes / totalMinutes, 0, 0.98) : 0;
  let accumulated = 0;
  let currentStopIndex = 0;

  for (let index = 0; index < segmentMinutes.length; index += 1) {
    if (elapsedMinutes <= accumulated + segmentMinutes[index]) {
      currentStopIndex = index;
      break;
    }
    accumulated += segmentMinutes[index];
    currentStopIndex = Math.min(index + 1, safeStops.length - 1);
  }

  if (completed) {
    accumulated = totalMinutes;
    currentStopIndex = Math.max(safeStops.length - 1, 0);
  }

  const segmentProgress = segmentMinutes[currentStopIndex]
    ? Math.min(Math.max((elapsedMinutes - accumulated) / segmentMinutes[currentStopIndex], 0), 1)
    : 0;
  const from = pointAtProgress(safeStops.length ? currentStopIndex / safeStops.length : 0);
  const to = pointAtProgress(safeStops.length ? (currentStopIndex + 1) / safeStops.length : 0);
  const truckPosition = completed
    ? pointAtProgress(0.98)
    : {
        x: from.x + (to.x - from.x) * segmentProgress,
        y: from.y + (to.y - from.y) * segmentProgress,
      };
  const clock = addMinutesToTime(settings.operationStartTime, Math.floor(elapsedMinutes));
  const targetStop = safeStops[safeStops.length - 1];
  const minutesToTarget = completed ? 0 : Math.max(totalMinutes - elapsedMinutes, 1);
  const targetEta = addMinutesToTime(clock, minutesToTarget);
  const averageDropoffMinutes =
    safeStops.reduce((sum, stop) => sum + stop.dropoffMinutes, 0) / Math.max(safeStops.length, 1);
  const routeStatus: RoutePlan["status"] = !started ? "scheduled" : completed ? "completed" : "in_progress";
  const route: RoutePlan = {
    id: demoRouteId,
    driverId: demoDriverId,
    vehicleId: demoVehicleId,
    zone: targetStop?.locality ?? "Demo tracking",
    status: routeStatus,
    packageIds: safeStops.map((stop) => stop.id),
    startedAt: settings.operationStartTime,
    completedAt: completed ? clock : undefined,
    totalPausedMinutes: 0,
    pauseMinutes: 0,
    extraDelayMinutes: Math.max(Math.round((trafficFactor - 1) * 10), 0),
    delayMinutes: Math.max(Math.round((trafficFactor - 1) * 10), 0),
    riskLevel: trafficFactor >= 1.35 ? "high" : trafficFactor >= 1.15 ? "medium" : "low",
    estimatedCloseTime: addMinutesToTime(settings.operationStartTime, totalMinutes),
    projectedSlaCompliance: Math.round(clamp(100 - Math.max(trafficFactor - 1, 0) * 35, 82, 99)),
    suggestedReassignments: trafficFactor >= 1.35 ? ["Trafico alto: sugerir ventana flexible para las ultimas paradas demo."] : [],
    averageDropoffMinutes,
    currentStopSequence: completed ? safeStops.length + 1 : currentStopIndex + 1,
  };

  const packages: DeliveryPackage[] = safeStops.map((stop, index) => {
    const sequence = index + 1;
    const stopEtaMinutes = segmentMinutes.slice(0, index + 1).reduce((sum, item) => sum + item, 0);
    const estimatedArrival = addMinutesToTime(settings.operationStartTime, stopEtaMinutes);
    const status: DeliveryPackage["status"] = !started
      ? "pending"
      : completed || index < currentStopIndex
        ? "delivered"
        : index === currentStopIndex
          ? "in_progress"
          : "pending";
    const etaConfidence: EtaConfidence = stop.trafficLevel === "high" || trafficFactor >= 1.35 ? "low" : trafficFactor >= 1.15 ? "medium" : "high";
    const riskLevel: OperationalRisk = etaConfidence === "low" ? "high" : etaConfidence === "medium" ? "medium" : "low";
    const windowSize = etaConfidence === "low" ? 18 : etaConfidence === "medium" ? 12 : 8;

    return {
      id: stop.id,
      routeId: demoRouteId,
      trackingCode: `RPAI-DEMO-${String(sequence).padStart(2, "0")}`,
      customerName: stop.customerName || `Pedido demo ${sequence}`,
      address: `${stop.street} ${stop.streetNumber}, ${stop.locality}`,
      zone: stop.locality,
      locality: stop.locality,
      addressReference: stop.addressReference,
      sequence,
      status,
      estimatedArrival,
      estimatedArrivalWindowStart: addMinutesToTime(estimatedArrival, -Math.floor(windowSize / 2)),
      estimatedArrivalWindowEnd: addMinutesToTime(estimatedArrival, Math.ceil(windowSize / 2)),
      stopsBeforeCustomer: Math.max(index - currentStopIndex, 0),
      etaConfidence,
      riskLevel,
      dropoffTimeMinutes: stop.dropoffMinutes,
      priority: stop.priority,
      lastEvent:
        status === "delivered"
          ? `Entregado a las ${estimatedArrival}`
          : started
            ? `ETA recalculado con trafico x${trafficFactor.toFixed(2)}`
            : "Ruta demo lista para iniciar",
      deliveredAt: status === "delivered" ? estimatedArrival : undefined,
    };
  });

  const order = packages[packages.length - 1];
  const remainingPackages = completed
    ? packages.slice(Math.max(packages.length - visibleStops, 0))
    : packages.slice(currentStopIndex, currentStopIndex + visibleStops);

  const projectedStops: TrackingProjectionStop[] = remainingPackages.map((stop, index) => {
    const originalIndex = packages.findIndex((item) => item.id === stop.id);
    const remainingSegmentTime = segmentMinutes
      .slice(Math.min(currentStopIndex, originalIndex), originalIndex + 1)
      .reduce((sum, item) => sum + item, 0);
    const minutesFromNow =
      stop.status === "delivered" ? 0 : Math.max(remainingSegmentTime - Math.max(elapsedMinutes - accumulated, 0), 1 + index * 3);
    const coordinate = coordinateForStop(originalIndex, Math.max(packages.length, 1));
    const isTarget = stop.id === targetStop?.id;

    return {
      id: stop.id,
      label: isTarget ? "Tu entrega" : `Pedido ${originalIndex + 1}`,
      locality: isTarget ? stop.locality : "Parada previa anonima",
      etaWindow:
        stop.status === "delivered"
          ? "Entregado"
          : `${addMinutesToTime(clock, minutesFromNow - 3)} - ${addMinutesToTime(clock, minutesFromNow + 5)}`,
      minutesFromNow,
      kind: isTarget ? "customer" : index === 0 ? "current" : "before_customer",
      status: stop.status,
      x: coordinate.x,
      y: coordinate.y,
    };
  });

  return {
    liveEtaMinutes: Math.round(minutesToTarget),
    orderEtaWindow: order?.status === "delivered" ? "Entregado" : `${addMinutesToTime(targetEta, -4)} - ${addMinutesToTime(targetEta, 6)}`,
    stops: projectedStops,
    truckPosition,
    routeStatus,
    routePoints,
    progress,
    currentStopIndex,
    trafficFactor,
    totalMinutes,
    route,
    packages,
    order,
  };
}
