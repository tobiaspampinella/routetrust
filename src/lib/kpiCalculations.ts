import type {
  DeliveryPackage,
  OperationalRisk,
  OperationsKpis,
  RiskLevel,
  RoutePlan,
  RoutePulseData,
  RouteStats,
  SystemSettings,
} from "@/lib/types";
import { clamp } from "@/lib/utils";
import {
  calculateRouteEstimatedCloseTime,
  estimateOperationalCloseTime,
  estimateRouteCloseTime,
  minutesBetween,
  riskToBadgeRisk,
  timeToMinutes,
} from "@/lib/etaCalculations";

export function getPackagesForRoute(routeId: string, packages: DeliveryPackage[]) {
  return packages.filter((item) => item.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
}

export function calculateRouteProgress(packages: DeliveryPackage[]) {
  if (!packages.length) return 0;
  const processed = packages.filter((item) => item.status === "delivered" || item.status === "failed").length;
  return (processed / packages.length) * 100;
}

export function calculateRouteRiskLevel(
  route: RoutePlan,
  routePackages: DeliveryPackage[],
  settings: SystemSettings,
): RiskLevel {
  if (route.manualRisk) return route.manualRisk;
  if (!settings.riskCalculationEnabled) return riskToBadgeRisk(route.riskLevel);

  const progress = calculateRouteProgress(routePackages);
  const estimatedClose = estimateRouteCloseTime(route, routePackages, settings);
  const closeIsLate = timeToMinutes(estimatedClose) > timeToMinutes(settings.targetCloseTime);
  const pending = routePackages.filter((item) => item.status === "pending" || item.status === "in_progress").length;
  const pausedMinutes = route.pauseMinutes + (route.status === "paused" ? settings.deliveryToleranceMinutes : 0);
  const atRiskStops = routePackages.filter((item) => item.riskLevel === "high" || item.etaConfidence === "low").length;

  if (route.riskLevel === "high" || closeIsLate || pausedMinutes > settings.deliveryToleranceMinutes * 3 || atRiskStops > 7 || (pending > 12 && progress < 25)) {
    return "risk_high";
  }

  if (route.riskLevel === "medium" || route.status === "paused" || pausedMinutes > settings.deliveryToleranceMinutes || atRiskStops > 3 || (pending > 8 && progress < 45)) {
    return "risk_medium";
  }

  return "risk_low";
}

export function calculateProjectedSLA(route: RoutePlan, routePackages: DeliveryPackage[], settings: SystemSettings) {
  const total = Math.max(routePackages.length, 1);
  const failedPenalty = (routePackages.filter((item) => item.status === "failed").length / total) * 100;
  const lowConfidencePenalty = routePackages.filter((item) => item.etaConfidence === "low" && item.status !== "delivered").length * 1.8;
  const latePenalty = timeToMinutes(route.estimatedCloseTime) > timeToMinutes(settings.targetCloseTime) ? 7 : 0;
  const pausePenalty = Math.max(route.pauseMinutes - settings.maxExpectedPauseMinutes, 0) * 0.45;

  return clamp(settings.targetSlaPercent - failedPenalty - lowConfidencePenalty - latePenalty - pausePenalty + 6, 0, 100);
}

export function calculateOperationalCloseEstimate(routes: RoutePlan[], settings: SystemSettings) {
  return estimateOperationalCloseTime(routes.map((route) => route.estimatedCloseTime), settings.targetCloseTime);
}

export function calculateAtRiskPackages(packages: DeliveryPackage[]) {
  return packages.filter(
    (item) =>
      item.status !== "delivered" &&
      item.status !== "failed" &&
      (item.riskLevel === "high" || item.etaConfidence === "low" || item.priority === "urgent"),
  ).length;
}

export function calculateRoutesAtRisk(routes: RoutePlan[]) {
  return routes.filter((route) => route.riskLevel === "medium" || route.riskLevel === "high").length;
}

export function calculateAverageDropoffTime(packages: DeliveryPackage[]) {
  if (!packages.length) return 0;
  return packages.reduce((sum, item) => sum + item.dropoffTimeMinutes, 0) / packages.length;
}

export function calculatePauseImpact(routes: RoutePlan[]) {
  return routes.reduce((sum, route) => sum + route.pauseMinutes, 0);
}

export function calculateEtaConfidenceAverage(packages: DeliveryPackage[]) {
  if (!packages.length) return 0;
  const score = packages.reduce((sum, item) => {
    if (item.etaConfidence === "high") return sum + 95;
    if (item.etaConfidence === "medium") return sum + 75;
    return sum + 52;
  }, 0);

  return score / packages.length;
}

export function calculateDriverProductivity(data: RoutePulseData) {
  return data.routes.map((route) => {
    const routePackages = getPackagesForRoute(route.id, data.packages);
    const delivered = routePackages.filter((item) => item.status === "delivered").length;
    const pending = routePackages.filter((item) => item.status === "pending" || item.status === "in_progress").length;
    const driver = data.drivers.find((item) => item.id === route.driverId);
    const productivityScore = clamp((delivered / Math.max(routePackages.length, 1)) * 100 - route.pauseMinutes * 0.7 + route.projectedSlaCompliance * 0.25, 0, 100);

    return {
      driverId: route.driverId,
      driverName: driver?.name ?? "Sin driver",
      routeId: route.id,
      delivered,
      pending,
      productivityScore,
      pauseMinutes: route.pauseMinutes,
    };
  });
}

export function calculateSuggestedReassignments(routes: RoutePlan[], packages: DeliveryPackage[]) {
  const routeSummaries = routes.map((route) => {
    const pending = packages.filter((item) => item.routeId === route.id && (item.status === "pending" || item.status === "in_progress")).length;
    return { route, pending };
  });
  const overloaded = routeSummaries.find((item) => item.route.riskLevel === "high" && item.pending > 8);
  const available = routeSummaries.find((item) => item.route.riskLevel === "low" && item.pending < (overloaded?.pending ?? 99));

  if (!overloaded || !available) {
    return routes.flatMap((route) => route.suggestedReassignments ?? []).slice(0, 3);
  }

  return [
    `Mover 3 paradas de ${overloaded.route.id} a ${available.route.id} podria reducir el atraso estimado.`,
    ...routes.flatMap((route) => route.suggestedReassignments ?? []),
  ].slice(0, 3);
}

function calculateOperationalRisk(route: RoutePlan, routePackages: DeliveryPackage[], settings: SystemSettings): OperationalRisk {
  const risk = calculateRouteRiskLevel(route, routePackages, settings);
  if (risk === "risk_high") return "high";
  if (risk === "risk_medium") return "medium";
  return "low";
}

export function calculateRouteStats(
  route: RoutePlan,
  packages: DeliveryPackage[],
  settings: SystemSettings,
): RouteStats {
  const routePackages = getPackagesForRoute(route.id, packages);
  const delivered = routePackages.filter((item) => item.status === "delivered").length;
  const failed = routePackages.filter((item) => item.status === "failed").length;
  const inProgress = routePackages.filter((item) => item.status === "in_progress").length;
  const pending = routePackages.filter((item) => item.status === "pending").length;
  const estimatedCloseTime = calculateRouteEstimatedCloseTime(route, settings, routePackages);
  const risk = calculateRouteRiskLevel({ ...route, estimatedCloseTime }, routePackages, settings);
  const operationalRisk = calculateOperationalRisk({ ...route, estimatedCloseTime }, routePackages, settings);
  const etaConfidenceAverage = calculateEtaConfidenceAverage(routePackages);
  const suggestedReassignments = (route.suggestedReassignments ?? []).length
    ? route.suggestedReassignments
    : operationalRisk === "high"
      ? [`Revisar apoyo para ${route.id}: ${pending + inProgress} paradas pendientes.`]
      : [];

  return {
    total: routePackages.length,
    delivered,
    failed,
    inProgress,
    pending,
    progress: calculateRouteProgress(routePackages),
    estimatedCloseTime,
    risk,
    operationalRisk,
    projectedSlaCompliance: calculateProjectedSLA({ ...route, estimatedCloseTime }, routePackages, settings),
    pauseMinutes: route.pauseMinutes,
    delayMinutes: route.delayMinutes,
    averageDropoffMinutes: calculateAverageDropoffTime(routePackages),
    atRiskPackages: calculateAtRiskPackages(routePackages),
    etaConfidenceAverage,
    currentStop: routePackages.find((item) => item.status === "in_progress") ?? routePackages.find((item) => item.status === "pending"),
    suggestedReassignments,
  };
}

export function calculateOperationsKpis(data: RoutePulseData): OperationsKpis {
  const totalPackages = data.packages.length;
  const deliveredPackages = data.packages.filter((item) => item.status === "delivered").length;
  const failedPackages = data.packages.filter((item) => item.status === "failed").length;
  const pendingPackages = data.packages.filter((item) => item.status === "pending" || item.status === "in_progress").length;
  const completionRate = totalPackages ? (deliveredPackages / totalPackages) * 100 : 0;
  const failureRate = totalPackages ? (failedPackages / totalPackages) * 100 : 0;
  const activeRoutes = data.routes.filter((route) => route.status === "in_progress" || route.status === "paused").length;
  const activeDrivers = data.drivers.filter((driver) => driver.status === "on_route" || driver.status === "paused").length;
  const routeStats = data.routes.map((route) => calculateRouteStats(route, data.packages, data.settings));
  const closeTimes = routeStats.map((stats) => stats.estimatedCloseTime);
  const routesInRisk = routeStats.filter((stats) => stats.risk !== "risk_low").length;
  const estimatedOperationalCloseTime = estimateOperationalCloseTime(closeTimes, data.settings.targetCloseTime);
  const plannedMinutes = Math.max(minutesBetween(data.settings.operationStartTime, estimatedOperationalCloseTime), 1);
  const deliveredPerHour = deliveredPackages / (plannedMinutes / 60);
  const highRiskPenalty = routeStats.filter((stats) => stats.risk === "risk_high").length * 8;
  const mediumRiskPenalty = routeStats.filter((stats) => stats.risk === "risk_medium").length * 4;
  const estimatedSLACompliance = clamp(100 - failureRate - highRiskPenalty - mediumRiskPenalty, 0, 100);
  const projectedSLA = routeStats.reduce((sum, stats) => sum + stats.projectedSlaCompliance, 0) / Math.max(routeStats.length, 1);
  const suggestedReassignments = calculateSuggestedReassignments(data.routes, data.packages);

  return {
    totalPackages,
    deliveredPackages,
    pendingPackages,
    failedPackages,
    completionRate,
    failureRate,
    activeRoutes,
    activeDrivers,
    averagePackagesPerDriver: totalPackages / Math.max(data.drivers.length, 1),
    estimatedOperationalCloseTime,
    routesInRisk,
    estimatedSLACompliance,
    deliveredPerHour,
    averageDropoffMinutes: data.settings.averageDropoffMinutes,
    projectedSLA,
    operationalCloseEstimate: calculateOperationalCloseEstimate(
      data.routes.map((route, index) => ({ ...route, estimatedCloseTime: routeStats[index]?.estimatedCloseTime ?? route.estimatedCloseTime })),
      data.settings,
    ),
    atRiskPackages: calculateAtRiskPackages(data.packages),
    routesAtRisk: routeStats.filter((stats) => stats.operationalRisk !== "low").length,
    averageDropoffTime: calculateAverageDropoffTime(data.packages),
    pauseImpactMinutes: calculatePauseImpact(data.routes),
    driverProductivity: calculateDriverProductivity(data),
    etaConfidenceAverage: calculateEtaConfidenceAverage(data.packages),
    suggestedReassignments,
  };
}
