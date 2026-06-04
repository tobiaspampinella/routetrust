import { NextRequest, NextResponse } from "next/server";
import type { CmsIncident } from "@/modules/cms/types";
import { normalizeCmsRole, normalizeIncidentSeverity, normalizeIncidentStatus } from "@/services/cms/cmsDbMapping";
import { findIncident, updateIncident } from "@/services/cms/incidentsStore";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ incidentId: string }> }) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "update", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.cmsRole === "driver") return NextResponse.json({ error: "Driver role cannot update CMS incidents." }, { status: 403 });

  const { incidentId } = await params;
  const context = {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  };
  const existing = await findIncident(incidentId, context);
  if (!existing) return NextResponse.json({ error: "Incident not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<CmsIncident> | null;
  const patch: Partial<CmsIncident> = {};
  if (body?.title !== undefined) patch.title = body.title.trim();
  if (body?.detail !== undefined) patch.detail = body.detail.trim();
  if (body?.status !== undefined) patch.status = normalizeIncidentStatus(body.status);
  if (body?.severity !== undefined) patch.severity = normalizeIncidentSeverity(body.severity);
  if (body?.ownerRole !== undefined) patch.ownerRole = normalizeCmsRole(body.ownerRole);
  if (body?.routeId !== undefined) patch.routeId = body.routeId.trim() || undefined;

  if ((patch.title !== undefined && !patch.title) || (patch.detail !== undefined && !patch.detail)) {
    return NextResponse.json({ error: "title and detail cannot be empty." }, { status: 400 });
  }

  const incident = await updateIncident(incidentId, patch, context);
  return NextResponse.json({ incident });
}
