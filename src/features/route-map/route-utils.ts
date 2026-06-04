import type { MapPoint, RouteCoordinate, RoutePlan } from "./types";

const EARTH_RADIUS_KM = 6371;
const AVERAGE_CITY_SPEED_KMH = 34;
const SERVICE_MINUTES_PER_STOP = 7;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(points: RouteCoordinate[]) {
  if (points.length < 2) return 0;

  return points.slice(1).reduce((sum, point, index) => {
    const previous = points[index];
    const dLat = toRadians(point.lat - previous.lat);
    const dLng = toRadians(point.lng - previous.lng);
    const lat1 = toRadians(previous.lat);
    const lat2 = toRadians(point.lat);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return sum + EARTH_RADIUS_KM * c;
  }, 0);
}

export function estimateRouteMinutes(distanceKm: number, stopCount: number) {
  const travelMinutes = (distanceKm / AVERAGE_CITY_SPEED_KMH) * 60;
  return Math.max(1, Math.round(travelMinutes + stopCount * SERVICE_MINUTES_PER_STOP));
}

export function pointSequenceForRoute(
  route: Pick<RoutePlan, "originPointId" | "destinationPointId" | "stopPointIds">,
  points: MapPoint[],
) {
  const byId = new Map(points.map((point) => [point.id, point]));
  return [route.originPointId, ...route.stopPointIds, route.destinationPointId]
    .map((id) => byId.get(id))
    .filter((point): point is MapPoint => Boolean(point));
}

export function buildPolylineForRoute(
  route: Pick<RoutePlan, "originPointId" | "destinationPointId" | "stopPointIds">,
  points: MapPoint[],
) {
  return pointSequenceForRoute(route, points).map(({ lat, lng }) => ({ lat, lng }));
}

export function enrichRouteMetrics<T extends Pick<RoutePlan, "originPointId" | "destinationPointId" | "stopPointIds">>(
  route: T,
  points: MapPoint[],
) {
  const polyline = buildPolylineForRoute(route, points);
  const distanceKm = Number(calculateDistanceKm(polyline).toFixed(2));
  return {
    polyline,
    distanceKm,
    estimatedMinutes: estimateRouteMinutes(distanceKm, Math.max(polyline.length - 2, 0)),
  };
}
