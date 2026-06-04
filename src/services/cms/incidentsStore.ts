import "server-only";

import type { CmsIncident } from "@/modules/cms/types";
import { getPrismaClient } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/status";
import { readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";
import { mapDbIncidentToDomain, mapDomainIncidentToDb } from "@/services/cms/cmsDbMapping";
import { ensureCmsFileFallbackAllowed, resolveCmsTenant } from "@/services/cms/cmsTenant";
import { seedCmsIncidents } from "@/services/cms/cmsService";
import { recordAuditEvent, type RuntimeAuditActor } from "@/services/audit/runtimeAuditStore";

interface StoredIncidentsState {
  incidents: CmsIncident[];
}

export type CmsPersistenceSource = "db" | "file";

interface CmsStoreContext {
  actor?: RuntimeAuditActor;
  tenantId?: string;
}

const INCIDENTS_FILE = runtimeDataPath("cms-incidents.json");

export async function listIncidents(context: CmsStoreContext = {}): Promise<{ incidents: CmsIncident[]; source: CmsPersistenceSource }> {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveCmsTenant(prisma, context.tenantId);
    const records = await prisma.cmsIncident.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { incidents: records.map(mapDbIncidentToDomain), source: "db" };
  }

  ensureCmsFileFallbackAllowed("CMS incidents", database.detail);
  const state = await readJson<StoredIncidentsState>(INCIDENTS_FILE, { incidents: seedCmsIncidents });
  return {
    incidents: state.incidents.filter((incident) => !context.tenantId || incident.tenantId === context.tenantId),
    source: "file",
  };
}

export async function findIncident(incidentId: string, context: CmsStoreContext = {}) {
  const { incidents } = await listIncidents(context);
  return incidents.find((incident) => incident.id === incidentId) ?? null;
}

export async function saveIncident(incident: CmsIncident, context: CmsStoreContext = {}) {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveCmsTenant(prisma, context.tenantId ?? incident.tenantId);
    const existing = await prisma.cmsIncident.findUnique({ where: { id: incident.id } });
    if (existing && existing.tenantId !== tenant.id) {
      throw new Error("Cross-tenant incident update blocked.");
    }

    const dbIncident = mapDomainIncidentToDb(incident, tenant.id);
    const routeId = await resolveRouteId(prisma, tenant.id, dbIncident.routeId);
    await prisma.cmsIncident.upsert({
      where: { id: incident.id },
      update: {
        tenantId: tenant.id,
        title: dbIncident.title,
        status: dbIncident.status,
        severity: dbIncident.severity,
        ownerRole: dbIncident.ownerRole,
        routeId,
        detail: dbIncident.detail,
        resolvedAt: dbIncident.resolvedAt,
      },
      create: {
        ...dbIncident,
        routeId,
      },
    });
    await auditIncidentChange("cms_incident_saved", incident, "db", context.actor, tenant.id);
    return listIncidents({ ...context, tenantId: tenant.id });
  }

  ensureCmsFileFallbackAllowed("CMS incidents", database.detail);
  const state = await readJson<StoredIncidentsState>(INCIDENTS_FILE, { incidents: seedCmsIncidents });
  const tenantId = context.tenantId ?? incident.tenantId;
  const nextIncident = { ...incident, tenantId };
  const next = state.incidents.some((item) => item.id === incident.id)
    ? state.incidents.map((item) => (item.id === incident.id ? nextIncident : item))
    : [nextIncident, ...state.incidents];
  await writeJsonAtomic(INCIDENTS_FILE, { incidents: next }, { backupBeforeWrite: true });
  await auditIncidentChange("cms_incident_saved", nextIncident, "file", context.actor, tenantId);
  return listIncidents({ ...context, tenantId });
}

export async function updateIncident(incidentId: string, patch: Partial<CmsIncident>, context: CmsStoreContext = {}) {
  const existing = await findIncident(incidentId, context);
  if (!existing) return null;

  const updated: CmsIncident = {
    ...existing,
    ...patch,
    id: existing.id,
    tenantId: existing.tenantId,
  };
  const result = await saveIncident(updated, context);
  return result.incidents.find((incident) => incident.id === incidentId) ?? null;
}

async function resolveRouteId(prisma: any, tenantId: string, routeId: string | null) {
  if (!routeId) return null;
  const route = await prisma.route.findFirst({
    where: { id: routeId, tenantId },
    select: { id: true },
  });
  return route?.id ?? null;
}

async function auditIncidentChange(
  action: string,
  incident: CmsIncident,
  persistence: CmsPersistenceSource,
  actor?: RuntimeAuditActor,
  dbTenantId?: string,
) {
  await recordAuditEvent({
    action,
    actor: actor ?? {
      name: "RouteTrust CMS",
      role: "system",
    },
    module: "incidents",
    result: "success",
    details: {
      incidentId: incident.id,
      severity: incident.severity,
      status: incident.status,
      routeId: incident.routeId ?? null,
      persistence,
      dbTenantId: dbTenantId ?? null,
    },
  });
}
