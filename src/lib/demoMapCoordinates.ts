import type { TrackingDemoStop } from "@/lib/types";

export interface LatLng {
  lat: number;
  lng: number;
}

export const demoRouteOrigin: LatLng = {
  lat: -34.5792,
  lng: -58.4554,
};

const fallbackStopCoordinates: LatLng[] = [
  { lat: -34.574, lng: -58.4538 },
  { lat: -34.5624, lng: -58.4566 },
  { lat: -34.5602, lng: -58.4579 },
  { lat: -34.5607, lng: -58.4446 },
  { lat: -34.5501, lng: -58.4556 },
];

const localityCenters: Record<string, LatLng> = {
  belgrano: { lat: -34.562, lng: -58.456 },
  colegiales: { lat: -34.574, lng: -58.452 },
  nunez: { lat: -34.5506, lng: -58.4561 },
  "nuñez": { lat: -34.5506, lng: -58.4561 },
  palermo: { lat: -34.5889, lng: -58.4306 },
  chacarita: { lat: -34.5896, lng: -58.4543 },
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getDemoStopCoordinate(stop: TrackingDemoStop, index: number): LatLng {
  if (typeof stop.lat === "number" && typeof stop.lng === "number") {
    return { lat: stop.lat, lng: stop.lng };
  }

  const fallback = fallbackStopCoordinates[index % fallbackStopCoordinates.length];
  const center = localityCenters[normalize(stop.locality)] ?? fallback;
  const offset = (index % 5) * 0.0017;

  return {
    lat: center.lat + (index % 2 === 0 ? offset : -offset / 2),
    lng: center.lng + (index % 2 === 0 ? -offset / 2 : offset),
  };
}

export function getDemoRouteCoordinates(stops: TrackingDemoStop[]) {
  return [demoRouteOrigin, ...stops.slice(0, 5).map((stop, index) => getDemoStopCoordinate(stop, index))];
}

export function coordinateAtProgress(coordinates: LatLng[], progress: number): LatLng {
  if (coordinates.length === 0) return demoRouteOrigin;
  if (coordinates.length === 1) return coordinates[0];

  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const segmentCount = coordinates.length - 1;
  const segmentIndex = Math.min(Math.floor(safeProgress * segmentCount), segmentCount - 1);
  const segmentProgress = safeProgress * segmentCount - segmentIndex;
  const from = coordinates[segmentIndex];
  const to = coordinates[segmentIndex + 1];

  return {
    lat: from.lat + (to.lat - from.lat) * segmentProgress,
    lng: from.lng + (to.lng - from.lng) * segmentProgress,
  };
}

export function addressForGoogle(stop: TrackingDemoStop) {
  return `${stop.street} ${stop.streetNumber}, ${stop.locality}, Ciudad Autonoma de Buenos Aires, Argentina`;
}

export function formatLatLng(value: LatLng) {
  return `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`;
}
