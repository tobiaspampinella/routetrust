import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { listDrivers, saveDriver } from "@/services/cms/driversStore";
import type { Driver } from "@/lib/types";

const VALID_STATUS: Driver["status"][] = ["available", "on_route", "paused", "offline"];

export async function GET(request: NextRequest) {
  const guard = await requireCmsPermission(request, "view");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { drivers, source } = await listDrivers({
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ drivers, source });
}

export async function POST(request: NextRequest) {
  const guard = await requireCmsPermission(request, "update");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = (await request.json().catch(() => null)) as { driver?: Partial<Driver> } | null;
  const input = body?.driver;
  if (!input?.name?.trim() || !input?.phone?.trim()) {
    return NextResponse.json({ error: "name and phone are required." }, { status: 400 });
  }

  const status = VALID_STATUS.includes(input.status as Driver["status"]) ? (input.status as Driver["status"]) : "available";
  const driver: Driver = {
    id: input.id?.trim() || `driver-${Date.now()}`,
    name: input.name.trim(),
    phone: input.phone.trim(),
    status,
    assignedRouteId: input.assignedRouteId ?? "",
  };

  const drivers = await saveDriver(driver, {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ driver, drivers }, { status: 201 });
}
