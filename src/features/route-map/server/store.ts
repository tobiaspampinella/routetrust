import "server-only";

import { randomUUID } from "node:crypto";
import { readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";
import type { CreateMapPointInput, CreateRoutePlanInput, UpdateMapPointInput, UpdateRoutePlanInput } from "../schemas";
import { enrichRouteMetrics } from "../route-utils";
import type { MapPoint, RouteMapSnapshot, RoutePlan } from "../types";

interface RouteMapState extends RouteMapSnapshot {
  version: 1;
  updatedAt: string;
}

export class RouteMapStoreError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

const routeMapFilePath = runtimeDataPath("route-map-system.json");

function now() {
  return new Date().toISOString();
}

function seedState(): RouteMapState {
  const createdAt = now();
  const points: MapPoint[] = [
    {
      id: "point-hub-belgrano",
      name: "Hub Belgrano",
      address: "Av. Cabildo 1200, CABA",
      lat: -34.5621,
      lng: -58.4567,
      type: "hub",
      status: "active",
      notes: "Cross-dock operativo para zona norte.",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "point-pickup-palermo",
      name: "Pickup Palermo",
      address: "Guatemala 4500, CABA",
      lat: -34.5864,
      lng: -58.4245,
      type: "pickup",
      status: "active",
      contactName: "Operacion e-commerce",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "point-delivery-recoleta",
      name: "Entrega Recoleta",
      address: "Av. Santa Fe 1900, CABA",
      lat: -34.5956,
      lng: -58.3941,
      type: "delivery",
      status: "active",
      contactName: "Cliente B2B",
      createdAt,
      updatedAt: createdAt,
    },
  ];
  const draftRoute: Omit<RoutePlan, "polyline" | "distanceKm" | "estimatedMinutes"> = {
    id: "route-plan-demo-norte",
    name: "Ruta Norte demo",
    status: "planned",
    originPointId: "point-hub-belgrano",
    destinationPointId: "point-delivery-recoleta",
    stopPointIds: ["point-pickup-palermo"],
    notes: "Ruta base para validar UX y contratos API.",
    createdAt,
    updatedAt: createdAt,
  };

  return {
    version: 1,
    updatedAt: createdAt,
    points,
    routes: [
      {
        ...draftRoute,
        ...enrichRouteMetrics(draftRoute, points),
      },
    ],
  };
}

async function readState() {
  return readJson<RouteMapState>(routeMapFilePath, seedState());
}

async function writeState(state: RouteMapState) {
  const next = { ...state, updatedAt: now() };
  await writeJsonAtomic(routeMapFilePath, next, { backupBeforeWrite: true });
  return next;
}

function uniquePointIds(route: Pick<RoutePlan, "originPointId" | "destinationPointId" | "stopPointIds">) {
  return [...new Set([route.originPointId, ...route.stopPointIds, route.destinationPointId])];
}

function validateRoutePointReferences(
  route: Pick<RoutePlan, "originPointId" | "destinationPointId" | "stopPointIds">,
  points: MapPoint[],
) {
  const pointIds = new Set(points.map((point) => point.id));
  const missing = uniquePointIds(route).filter((pointId) => !pointIds.has(pointId));
  if (missing.length) {
    throw new RouteMapStoreError(`Unknown point id: ${missing.join(", ")}.`, 422);
  }
}

function hydrateRoute(route: Omit<RoutePlan, "polyline" | "distanceKm" | "estimatedMinutes">, points: MapPoint[]): RoutePlan {
  validateRoutePointReferences(route, points);
  return {
    ...route,
    ...enrichRouteMetrics(route, points),
  };
}

function refreshRoutesForPointChange(routes: RoutePlan[], points: MapPoint[]) {
  return routes.map((route) => hydrateRoute(route, points));
}

export async function getRouteMapSnapshot(): Promise<RouteMapSnapshot> {
  const state = await readState();
  return {
    points: state.points,
    routes: state.routes,
  };
}

export async function listMapPoints() {
  const state = await readState();
  return state.points;
}

export async function findMapPoint(pointId: string) {
  const state = await readState();
  return state.points.find((point) => point.id === pointId) ?? null;
}

export async function createMapPoint(input: CreateMapPointInput) {
  const state = await readState();
  const timestamp = now();
  const point: MapPoint = {
    id: randomUUID(),
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const next = await writeState({
    ...state,
    points: [point, ...state.points],
  });
  return { point, points: next.points };
}

export async function updateMapPoint(pointId: string, input: UpdateMapPointInput) {
  const state = await readState();
  const existing = state.points.find((point) => point.id === pointId);
  if (!existing) throw new RouteMapStoreError("Map point not found.", 404);

  const point: MapPoint = {
    ...existing,
    ...input,
    updatedAt: now(),
  };
  const points = state.points.map((item) => (item.id === pointId ? point : item));
  const routes = refreshRoutesForPointChange(state.routes, points);
  const next = await writeState({ ...state, points, routes });
  return { point, points: next.points, routes: next.routes };
}

export async function deleteMapPoint(pointId: string) {
  const state = await readState();
  const existing = state.points.find((point) => point.id === pointId);
  if (!existing) throw new RouteMapStoreError("Map point not found.", 404);

  const usedByRoutes = state.routes.filter((route) => uniquePointIds(route).includes(pointId));
  if (usedByRoutes.length) {
    throw new RouteMapStoreError("Map point is used by one or more routes.", 409);
  }

  const next = await writeState({
    ...state,
    points: state.points.filter((point) => point.id !== pointId),
  });
  return { points: next.points };
}

export async function listRoutePlans() {
  const state = await readState();
  return state.routes;
}

export async function createRoutePlan(input: CreateRoutePlanInput) {
  const state = await readState();
  const timestamp = now();
  const route = hydrateRoute(
    {
      id: randomUUID(),
      ...input,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    state.points,
  );
  const next = await writeState({
    ...state,
    routes: [route, ...state.routes],
  });
  return { route, routes: next.routes };
}

export async function findRoutePlan(routeId: string) {
  const state = await readState();
  return state.routes.find((route) => route.id === routeId) ?? null;
}

export async function updateRoutePlan(routeId: string, input: UpdateRoutePlanInput) {
  const state = await readState();
  const existing = state.routes.find((route) => route.id === routeId);
  if (!existing) throw new RouteMapStoreError("Route plan not found.", 404);

  const route = hydrateRoute(
    {
      ...existing,
      ...input,
      updatedAt: now(),
    },
    state.points,
  );
  const next = await writeState({
    ...state,
    routes: state.routes.map((item) => (item.id === routeId ? route : item)),
  });
  return { route, routes: next.routes };
}

export async function deleteRoutePlan(routeId: string) {
  const state = await readState();
  const existing = state.routes.find((route) => route.id === routeId);
  if (!existing) throw new RouteMapStoreError("Route plan not found.", 404);

  const next = await writeState({
    ...state,
    routes: state.routes.filter((route) => route.id !== routeId),
  });
  return { routes: next.routes };
}
