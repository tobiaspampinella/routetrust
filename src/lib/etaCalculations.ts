import type { DeliveryPackage, EtaConfidence, OperationalRisk, RoutePlan, SystemSettings, ZoneProfile } from "@/lib/types";

export function timeToMinutes(time: string) {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function minutesToTime(totalMinutes: number) {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, minutes: number) {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function minutesBetween(start: string, end: string) {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return endMinutes >= startMinutes ? endMinutes - startMinutes : endMinutes + 1440 - startMinutes;
}

export function getClockTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function estimateStopDuration(settings: SystemSettings) {
  return (settings.baseDropoffMinutes ?? settings.averageDropoffMinutes) + settings.deliveryToleranceMinutes;
}

export function estimateRouteCloseTime(
  route: RoutePlan,
  packages: DeliveryPackage[],
  settings: SystemSettings,
) {
  return calculateRouteEstimatedCloseTime(route, settings, packages);
}

export function riskToBadgeRisk(risk: OperationalRisk) {
  if (risk === "high") return "risk_high" as const;
  if (risk === "medium") return "risk_medium" as const;
  return "risk_low" as const;
}

export function calculateStopsBeforeCustomer(route: RoutePlan, stopId: string) {
  const stopIndex = route.packageIds.indexOf(stopId);
  if (stopIndex < 0) return 0;

  const currentIndex = Math.max(route.currentStopSequence - 1, 0);
  return Math.max(stopIndex - currentIndex, 0);
}

export function calculateDropoffByZone(zone: string, settings: SystemSettings, zones: ZoneProfile[] = []) {
  const profile = zones.find((item) => item.name === zone);
  const base = profile?.averageDropoffMinutes ?? settings.baseDropoffMinutes ?? settings.averageDropoffMinutes;
  const parkingPenalty = profile?.parkingDifficulty === "high" ? 4 : profile?.parkingDifficulty === "medium" ? 2 : 0;
  return Math.round(base + parkingPenalty);
}

function calculateTransitMinutes(stop: DeliveryPackage, zones: ZoneProfile[]) {
  const profile = zones.find((item) => item.name === stop.zone);
  const trafficFactor = profile?.trafficFactor ?? 1;
  const priorityReduction = stop.priority === "urgent" ? -2 : stop.priority === "high" ? -1 : 0;
  return Math.max(Math.round(6 * trafficFactor + (stop.sequence % 4) * 3 + priorityReduction), 4);
}

export function calculateEtaConfidence(route: RoutePlan, stop: DeliveryPackage): EtaConfidence {
  if (route.status === "paused" || route.riskLevel === "high" || stop.riskLevel === "high") return "low";
  if (route.pauseMinutes > 15 || route.delayMinutes > 20 || stop.riskLevel === "medium") return "medium";
  if (stop.priority === "urgent" && route.currentStopSequence < stop.sequence - 8) return "medium";
  return "high";
}

export function calculateStopEtaWindow(
  route: RoutePlan,
  stop: DeliveryPackage,
  settings: SystemSettings,
  zones: ZoneProfile[] = [],
  routeStops: DeliveryPackage[] = [],
) {
  const orderedStops = routeStops.length ? routeStops.slice().sort((a, b) => a.sequence - b.sequence) : [stop];
  const start = route.startedAt ?? settings.operationStartTime;
  const currentSequence = Math.max(route.currentStopSequence, 1);
  const pauseAndDelay = route.pauseMinutes + route.delayMinutes;
  let elapsed = pauseAndDelay;

  for (const item of orderedStops) {
    if (item.sequence < currentSequence) {
      elapsed += Math.max(item.dropoffTimeMinutes || calculateDropoffByZone(item.zone, settings, zones), 4) * 0.55;
      continue;
    }

    elapsed += calculateTransitMinutes(item, zones);

    if (item.id === stop.id) {
      const confidence = calculateEtaConfidence(route, { ...stop, riskLevel: stop.riskLevel });
      const width = confidence === "low" ? 22 : confidence === "medium" ? 14 : 8;
      const center = timeToMinutes(start) + elapsed;
      return {
        estimatedArrival: minutesToTime(center),
        estimatedArrivalWindowStart: minutesToTime(center - Math.floor(width / 2)),
        estimatedArrivalWindowEnd: minutesToTime(center + Math.ceil(width / 2)),
        etaConfidence: confidence,
      };
    }

    elapsed += item.dropoffTimeMinutes || calculateDropoffByZone(item.zone, settings, zones);
  }

  const fallback = timeToMinutes(start) + elapsed;
  return {
    estimatedArrival: minutesToTime(fallback),
    estimatedArrivalWindowStart: minutesToTime(fallback - 10),
    estimatedArrivalWindowEnd: minutesToTime(fallback + 10),
    etaConfidence: "medium" as EtaConfidence,
  };
}

export function calculateRouteEstimatedCloseTime(
  route: RoutePlan,
  settings: SystemSettings,
  packages: DeliveryPackage[] = [],
  zones: ZoneProfile[] = [],
) {
  if (route.completedAt) return route.completedAt;

  const orderedStops = packages.slice().sort((a, b) => a.sequence - b.sequence);
  const start = route.startedAt ?? settings.operationStartTime;
  const currentSequence = Math.max(route.currentStopSequence, 1);
  let elapsed = route.pauseMinutes + route.delayMinutes;

  for (const stop of orderedStops) {
    const processed = stop.status === "delivered" || stop.status === "failed";
    const dropoff = stop.dropoffTimeMinutes || calculateDropoffByZone(stop.zone, settings, zones);
    const transit = calculateTransitMinutes(stop, zones);

    if (processed || stop.sequence < currentSequence) {
      elapsed += Math.max(dropoff * 0.55 + transit * 0.45, 5);
    } else {
      elapsed += transit + dropoff;
    }
  }

  return addMinutesToTime(start, elapsed);
}

export function calculateRouteRiskFromCloseTime(estimatedCloseTime: string, route: RoutePlan, settings: SystemSettings): OperationalRisk {
  const lateMinutes = timeToMinutes(estimatedCloseTime) - timeToMinutes(settings.targetCloseTime);
  if (!settings.riskCalculationEnabled) return route.riskLevel ?? "low";
  if (lateMinutes > 0 || route.pauseMinutes > settings.maxExpectedPauseMinutes + 15 || route.delayMinutes > 35) return "high";
  if (route.pauseMinutes > settings.maxExpectedPauseMinutes || route.delayMinutes > 18) return "medium";
  return "low";
}

export function applyPauseImpactToRoute(route: RoutePlan, pauseMinutes: number) {
  const nextPauseMinutes = route.pauseMinutes + pauseMinutes;
  return {
    ...route,
    pauseMinutes: nextPauseMinutes,
    totalPausedMinutes: nextPauseMinutes,
    delayMinutes: route.delayMinutes + Math.ceil(pauseMinutes * 0.35),
    extraDelayMinutes: route.extraDelayMinutes + Math.ceil(pauseMinutes * 0.35),
  };
}

export function calculateDelayReason(route: RoutePlan, stop?: DeliveryPackage) {
  if (route.status === "paused" && route.pauseReason) return `Pausa activa por ${route.pauseReason}`;
  if (route.pauseMinutes > 20) return `${route.pauseMinutes} min acumulados en pausa`;
  if (route.delayMinutes > 20) return `${route.delayMinutes} min de delay acumulado`;
  if (stop?.riskLevel === "high") return "ETA de baja confianza por zona o prioridad";
  return "Ruta dentro de tolerancia";
}

export function recalculatePackageEtas(
  route: RoutePlan,
  packages: DeliveryPackage[],
  settings: SystemSettings,
  zones: ZoneProfile[] = [],
) {
  const orderedStops = packages
    .slice()
    .sort((a, b) => a.sequence - b.sequence);

  return orderedStops.map((item) => {
    const dropoffTimeMinutes = calculateDropoffByZone(item.zone, settings, zones);
    const stopsBeforeCustomer = calculateStopsBeforeCustomer(route, item.id);
    const riskLevel: OperationalRisk =
      route.riskLevel === "high" || item.priority === "urgent"
        ? "high"
        : route.riskLevel === "medium" || stopsBeforeCustomer > 10
          ? "medium"
          : "low";
    const eta = calculateStopEtaWindow(
      route,
      {
        ...item,
        dropoffTimeMinutes,
        riskLevel,
      },
      settings,
      zones,
      orderedStops,
    );

    return {
      ...item,
      ...eta,
      stopsBeforeCustomer,
      riskLevel,
      dropoffTimeMinutes,
      lastEvent:
        item.status === "delivered"
          ? `Entregado a las ${item.deliveredAt ?? item.estimatedArrival}`
          : item.status === "failed"
            ? `Entrega fallida: ${item.failedReason ?? "sin motivo"}`
            : calculateDelayReason(route, item),
    };
  });
}

export function estimateOperationalCloseTime(closeTimes: string[], fallback: string) {
  if (!closeTimes.length) return fallback;
  const latest = closeTimes.reduce((max, item) => Math.max(max, timeToMinutes(item)), 0);
  return minutesToTime(latest);
}
