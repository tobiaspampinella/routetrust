export const MAP_POINT_TYPES = ["hub", "pickup", "delivery", "waypoint", "risk"] as const;
export const MAP_POINT_STATUSES = ["active", "inactive", "completed"] as const;
export const ROUTE_PLAN_STATUSES = ["draft", "planned", "active", "completed", "cancelled"] as const;

export type MapPointType = (typeof MAP_POINT_TYPES)[number];
export type MapPointStatus = (typeof MAP_POINT_STATUSES)[number];
export type RoutePlanStatus = (typeof ROUTE_PLAN_STATUSES)[number];

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface MapPoint extends RouteCoordinate {
  id: string;
  name: string;
  address: string;
  type: MapPointType;
  status: MapPointStatus;
  contactName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutePlan {
  id: string;
  name: string;
  status: RoutePlanStatus;
  originPointId: string;
  destinationPointId: string;
  stopPointIds: string[];
  polyline: RouteCoordinate[];
  distanceKm: number;
  estimatedMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteMapSnapshot {
  points: MapPoint[];
  routes: RoutePlan[];
}

export interface MapTileConfig {
  tileUrl?: string;
  attribution?: string;
  defaultCenter: RouteCoordinate;
  defaultZoom: number;
  hasTileProvider: boolean;
}
