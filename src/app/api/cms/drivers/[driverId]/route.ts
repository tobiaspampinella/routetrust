import { NextRequest, NextResponse } from "next/server";
import { requireCmsPermission } from "@/services/cms/serverGuards";
import { deleteDriver, findDriver, saveDriver } from "@/services/cms/driversStore";
import type { Driver } from "@/lib/types";

const VALID_STATUS: Driver["status"][] = ["available", "on_route", "paused", "offline"];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  const guard = await requireCmsPermission(request, "update");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { driverId } = await params;
  const context = {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  };
  const existing = await findDriver(driverId, context);
  if (!existing) return NextResponse.json({ error: "Driver not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<Pick<Driver, "name" | "phone" | "status">> | null;
  const updated: Driver = {
    ...existing,
    ...(body?.name !== undefined ? { name: body.name.trim() } : {}),
    ...(body?.phone !== undefined ? { phone: body.phone.trim() } : {}),
    ...(body?.status !== undefined && VALID_STATUS.includes(body.status) ? { status: body.status } : {}),
  };

  const drivers = await saveDriver(updated, context);
  return NextResponse.json({ driver: updated, drivers });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ driverId: string }> }) {
  const guard = await requireCmsPermission(request, "update");
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { driverId } = await params;
  const drivers = await deleteDriver(driverId, {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ drivers });
}
