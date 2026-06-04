import { test } from "node:test";
import assert from "node:assert/strict";
import { getMapTileConfig } from "../features/route-map/config";
import { createMapPointSchema, createRoutePlanSchema } from "../features/route-map/schemas";
import { calculateDistanceKm, enrichRouteMetrics } from "../features/route-map/route-utils";
import type { MapPoint } from "../features/route-map/types";

function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) {
    previous[key] = process.env[key];
    if (vars[key] === undefined) delete process.env[key];
    else process.env[key] = vars[key];
  }
  try {
    fn();
  } finally {
    for (const key of Object.keys(previous)) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test("route map point schema validates coordinates and defaults", () => {
  const point = createMapPointSchema.parse({
    name: "Hub Norte",
    address: "Av. Cabildo 1200",
    lat: "-34.5621",
    lng: "-58.4567",
  });

  assert.equal(point.type, "delivery");
  assert.equal(point.status, "active");
  assert.equal(point.lat, -34.5621);
  assert.equal(point.lng, -58.4567);
});

test("route plan schema rejects equal origin and destination", () => {
  const result = createRoutePlanSchema.safeParse({
    name: "Ruta invalida",
    originPointId: "point-a",
    destinationPointId: "point-a",
  });

  assert.equal(result.success, false);
});

test("route metrics build polyline and positive ETA", () => {
  const points: MapPoint[] = [
    {
      id: "a",
      name: "A",
      address: "A",
      lat: -34.56,
      lng: -58.45,
      type: "hub",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "b",
      name: "B",
      address: "B",
      lat: -34.58,
      lng: -58.42,
      type: "pickup",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "c",
      name: "C",
      address: "C",
      lat: -34.6,
      lng: -58.39,
      type: "delivery",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  const metrics = enrichRouteMetrics(
    {
      originPointId: "a",
      stopPointIds: ["b"],
      destinationPointId: "c",
    },
    points,
  );

  assert.equal(metrics.polyline.length, 3);
  assert.ok(metrics.distanceKm > 0);
  assert.ok(metrics.estimatedMinutes > 0);
  assert.equal(Number(calculateDistanceKm(metrics.polyline).toFixed(2)), metrics.distanceKm);
});

test("route map tile config uses new public env names", () => {
  withEnv(
    {
      NEXT_PUBLIC_MAP_TILE_URL: "https://tiles.example/{z}/{x}/{y}.png",
      NEXT_PUBLIC_MAP_TILE_ATTRIBUTION: "Example tiles",
      NEXT_PUBLIC_MAP_DEFAULT_LAT: "-12.04",
      NEXT_PUBLIC_MAP_DEFAULT_LNG: "-77.03",
      NEXT_PUBLIC_MAP_DEFAULT_ZOOM: "11",
    },
    () => {
      const config = getMapTileConfig();

      assert.equal(config.tileUrl, "https://tiles.example/{z}/{x}/{y}.png");
      assert.equal(config.attribution, "Example tiles");
      assert.equal(config.defaultCenter.lat, -12.04);
      assert.equal(config.defaultCenter.lng, -77.03);
      assert.equal(config.defaultZoom, 11);
      assert.equal(config.hasTileProvider, true);
    },
  );
});
