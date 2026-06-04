import "server-only";

import type { Driver } from "@/lib/types";
import { initialRoutePulseData } from "@/data/mockData";
import { getPrismaClient } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/status";
import { readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";
import { mapDbDriverToDomain, mapDomainDriverToDb } from "@/services/cms/driverDbMapping";
import { recordAuditEvent, type RuntimeAuditActor } from "@/services/audit/runtimeAuditStore";

interface StoredDriversState {
  drivers: Driver[];
}

export type DriversSource = "db" | "file";

interface DriverStoreContext {
  actor?: RuntimeAuditActor;
  tenantId?: string;
}

const DRIVERS_FILE = runtimeDataPath("cms-drivers.json");
const DEFAULT_TENANT_SLUG = process.env.ROUTETRUST_DEFAULT_TENANT_SLUG || "demo";
const DEFAULT_TENANT_ID = "tenant-demo-latam";

export async function listDrivers(context: DriverStoreContext = {}): Promise<{ drivers: Driver[]; source: DriversSource }> {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveTenant(prisma, context.tenantId);
    const records = await prisma.driver.findMany({
      where: { tenantId: tenant.id },
      include: {
        routes: {
          orderBy: { updatedAt: "desc" },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });
    return { drivers: records.map(mapDbDriverToDomain), source: "db" };
  }

  ensureFileFallbackAllowed(database.detail);
  const state = await readJson<StoredDriversState>(DRIVERS_FILE, { drivers: initialRoutePulseData.drivers });
  const drivers = Array.isArray(state.drivers) ? state.drivers : [];
  return { drivers, source: "file" };
}

export async function saveDriver(driver: Driver, context: DriverStoreContext = {}): Promise<Driver[]> {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveTenant(prisma, context.tenantId);
    const dbDriver = mapDomainDriverToDb(driver, tenant.id);
    await prisma.driver.upsert({
      where: { id: driver.id },
      update: {
        tenantId: dbDriver.tenantId,
        name: dbDriver.name,
        phone: dbDriver.phone,
        status: dbDriver.status,
      },
      create: dbDriver,
    });
    await syncAssignedRoute(prisma, tenant.id, driver);
    await auditDriverChange("cms_driver_saved", driver, "db", context.actor, tenant.id);
    const { drivers } = await listDrivers(context);
    return drivers;
  }

  ensureFileFallbackAllowed(database.detail);
  const { drivers } = await listDrivers(context);
  const exists = drivers.some((item) => item.id === driver.id);
  const next = exists ? drivers.map((item) => (item.id === driver.id ? driver : item)) : [...drivers, driver];
  await writeJsonAtomic(DRIVERS_FILE, { drivers: next }, { backupBeforeWrite: true });
  await auditDriverChange("cms_driver_saved", driver, "file", context.actor);
  return next;
}

export async function deleteDriver(driverId: string, context: DriverStoreContext = {}): Promise<Driver[]> {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveTenant(prisma, context.tenantId);
    const existing = await findDriver(driverId, context);
    await prisma.route.updateMany({
      where: { tenantId: tenant.id, driverId },
      data: { driverId: null },
    });
    await prisma.driver.deleteMany({
      where: { id: driverId, tenantId: tenant.id },
    });
    await auditDriverChange("cms_driver_deleted", existing ?? createDeletedDriver(driverId), "db", context.actor, tenant.id);
    const { drivers } = await listDrivers(context);
    return drivers;
  }

  ensureFileFallbackAllowed(database.detail);
  const { drivers } = await listDrivers(context);
  const existing = drivers.find((item) => item.id === driverId);
  const next = drivers.filter((item) => item.id !== driverId);
  await writeJsonAtomic(DRIVERS_FILE, { drivers: next }, { backupBeforeWrite: true });
  await auditDriverChange("cms_driver_deleted", existing ?? createDeletedDriver(driverId), "file", context.actor);
  return next;
}

export async function findDriver(driverId: string, context: DriverStoreContext = {}): Promise<Driver | undefined> {
  const { drivers } = await listDrivers(context);
  return drivers.find((item) => item.id === driverId);
}

async function resolveTenant(prisma: any, tenantId?: string) {
  if (tenantId) {
    const explicitTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (explicitTenant) return explicitTenant;
  }

  const tenantBySlug = await prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT_SLUG } });
  if (tenantBySlug) return tenantBySlug;

  return prisma.tenant.create({
    data: {
      id: tenantId || DEFAULT_TENANT_ID,
      name: "Demo Company",
      slug: DEFAULT_TENANT_SLUG,
      status: "active",
    },
  });
}

async function syncAssignedRoute(prisma: any, tenantId: string, driver: Driver) {
  if (!driver.assignedRouteId) {
    await prisma.route.updateMany({
      where: { tenantId, driverId: driver.id },
      data: { driverId: null },
    });
    return;
  }

  await prisma.route.updateMany({
    where: { tenantId, driverId: driver.id, id: { not: driver.assignedRouteId } },
    data: { driverId: null },
  });
  await prisma.route.updateMany({
    where: { tenantId, id: driver.assignedRouteId },
    data: { driverId: driver.id },
  });
}

async function auditDriverChange(action: string, driver: Driver, persistence: DriversSource, actor?: RuntimeAuditActor, dbTenantId?: string) {
  await recordAuditEvent({
    action,
    actor: actor ?? {
      name: "RouteTrust CMS",
      role: "system",
    },
    module: "drivers",
    result: "success",
    details: {
      driverId: driver.id,
      driverName: driver.name,
      status: driver.status,
      assignedRouteId: driver.assignedRouteId || null,
      persistence,
      dbTenantId: dbTenantId ?? null,
    },
  });
}

function ensureFileFallbackAllowed(databaseDetail: string) {
  const explicitDemoMode = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (process.env.NODE_ENV === "production" && !explicitDemoMode) {
    throw new Error(`Driver file fallback is disabled outside demo mode. Database status: ${databaseDetail}`);
  }
}

function createDeletedDriver(driverId: string): Driver {
  return {
    id: driverId,
    name: "Unknown driver",
    phone: "",
    status: "offline",
    assignedRouteId: "",
  };
}
