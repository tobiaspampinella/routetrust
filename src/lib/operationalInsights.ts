import type { DeliveryPackage, Driver, RoutePlan, SystemSettings } from "@/lib/types";
import {
  calculateAtRiskPackages,
  calculateAverageDropoffTime,
  calculateEtaConfidenceAverage,
  calculateOperationalCloseEstimate,
  calculateProjectedSLA,
  calculateSuggestedReassignments,
  getPackagesForRoute,
} from "@/lib/kpiCalculations";
import { minutesBetween, timeToMinutes } from "@/lib/etaCalculations";

export function generateOperationalInsights(
  routes: RoutePlan[],
  orders: DeliveryPackage[],
  drivers: Driver[],
  settings: SystemSettings,
) {
  const insights: string[] = [];
  const operationalClose = calculateOperationalCloseEstimate(routes, settings);
  const projectedSla =
    routes.reduce((sum, route) => {
      const routeOrders = getPackagesForRoute(route.id, orders);
      return sum + calculateProjectedSLA(route, routeOrders, settings);
    }, 0) / Math.max(routes.length, 1);
  const lowConfidenceCount = orders.filter((order) => order.etaConfidence === "low" && order.status !== "delivered").length;
  const atRiskPackages = calculateAtRiskPackages(orders);
  const avgDropoff = calculateAverageDropoffTime(orders);
  const reassignment = calculateSuggestedReassignments(routes, orders)[0];

  const highRiskRoute = routes.find((route) => route.riskLevel === "high");
  if (highRiskRoute) {
    const lateMinutes = Math.max(timeToMinutes(highRiskRoute.estimatedCloseTime) - timeToMinutes(settings.targetCloseTime), 0);
    insights.push(`${highRiskRoute.id} tiene riesgo alto: cierre estimado ${lateMinutes} min despues del objetivo.`);
  }

  const pausedRoute = routes.find((route) => route.pauseMinutes > 0);
  if (pausedRoute) {
    const impactedStops = orders.filter(
      (order) => order.routeId === pausedRoute.id && (order.status === "pending" || order.status === "in_progress"),
    ).length;
    const driver = drivers.find((item) => item.id === pausedRoute.driverId);
    insights.push(`${driver?.name ?? pausedRoute.driverId} acumula ${pausedRoute.pauseMinutes} min en pausa; ${impactedStops} entregas pendientes fueron impactadas.`);
  }

  const zones = Array.from(new Set(orders.map((order) => order.zone)));
  const slowZone = zones
    .map((zone) => {
      const zoneOrders = orders.filter((order) => order.zone === zone);
      return {
        zone,
        average: calculateAverageDropoffTime(zoneOrders),
      };
    })
    .sort((a, b) => b.average - a.average)[0];

  if (slowZone && slowZone.average > avgDropoff + 1) {
    insights.push(`${slowZone.zone} tiene drop-off promedio superior al resto de zonas.`);
  }

  if (lowConfidenceCount > 0) {
    insights.push(`Hay ${lowConfidenceCount} paquetes con ETA de baja confianza.`);
  }

  if (reassignment) {
    insights.push(`Se recomienda revisar reasignacion: ${reassignment}`);
  }

  const closeDrift = minutesBetween(settings.targetCloseTime, operationalClose);
  const closeText =
    timeToMinutes(operationalClose) > timeToMinutes(settings.targetCloseTime)
      ? `con ${closeDrift} min de desvio`
      : "dentro del objetivo";
  insights.push(`La operacion esta proyectada para cerrar a las ${operationalClose} ${closeText}, con SLA estimado de ${Math.round(projectedSla)}%.`);

  if (atRiskPackages > 0) {
    insights.push(`${atRiskPackages} paquetes pendientes ya tienen riesgo operativo por ETA, prioridad o zona.`);
  }

  if (calculateEtaConfidenceAverage(orders) < 75) {
    insights.push("La confianza promedio de ETA esta por debajo del umbral operativo; conviene revisar zonas con trafico alto.");
  }

  return insights.slice(0, 7);
}
