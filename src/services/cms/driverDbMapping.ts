import type { Driver } from "@/lib/types";

export const driverStatuses: Driver["status"][] = ["available", "on_route", "paused", "offline"];

export interface DbDriverRouteRef {
  id: string;
}

export interface DbDriverRecord {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  routes?: DbDriverRouteRef[];
}

export function normalizeDriverStatus(value: unknown): Driver["status"] {
  return driverStatuses.includes(value as Driver["status"]) ? (value as Driver["status"]) : "available";
}

export function mapDbDriverToDomain(record: DbDriverRecord): Driver {
  return {
    id: record.id,
    name: record.name,
    phone: record.phone ?? "",
    status: normalizeDriverStatus(record.status),
    assignedRouteId: record.routes?.[0]?.id ?? "",
  };
}

export function mapDomainDriverToDb(driver: Driver, tenantId: string) {
  return {
    id: driver.id,
    tenantId,
    name: driver.name,
    phone: driver.phone || null,
    status: normalizeDriverStatus(driver.status),
  };
}
