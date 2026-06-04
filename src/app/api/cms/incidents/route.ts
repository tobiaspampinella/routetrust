import { NextRequest, NextResponse } from "next/server";
import type { CmsIncident } from "@/modules/cms/types";
import { normalizeCmsRole, normalizeIncidentSeverity, normalizeIncidentStatus } from "@/services/cms/cmsDbMapping";
import { listIncidents, saveIncident } from "@/services/cms/incidentsStore";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "view", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.cmsRole === "driver") return NextResponse.json({ error: "Driver role cannot access CMS incidents." }, { status: 403 });

  const { incidents, source } = await listIncidents({
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ incidents, source });
}

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "create", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.cmsRole === "driver") return NextResponse.json({ error: "Driver role cannot create CMS incidents." }, { status: 403 });

  const input = extractIncidentInput(await request.json().catch(() => null));
  if (!input?.title?.trim() || !input?.detail?.trim()) {
    return NextResponse.json({ error: "title and detail are required." }, { status: 400 });
  }

  const incident: CmsIncident = {
    id: input.id?.trim() || `incident-${Date.now()}`,
    tenantId: guard.tenantId,
    title: input.title.trim(),
    status: normalizeIncidentStatus(input.status),
    severity: normalizeIncidentSeverity(input.severity),
    ownerRole: normalizeCmsRole(input.ownerRole),
    routeId: input.routeId?.trim() || undefined,
    createdAt: input.createdAt || new Date().toISOString(),
    detail: input.detail.trim(),
  };

  const { incidents, source } = await saveIncident(incident, {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ incident, incidents, source }, { status: 201 });
}

function extractIncidentInput(body: unknown): Partial<CmsIncident> | null {
  if (!isRecord(body)) return null;
  return isRecord(body.incident) ? (body.incident as Partial<CmsIncident>) : (body as Partial<CmsIncident>);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
