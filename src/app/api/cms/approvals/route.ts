import { NextRequest, NextResponse } from "next/server";
import type { CmsApprovalRequest } from "@/modules/cms/types";
import { normalizeApprovalAction, normalizeApprovalStatus } from "@/services/cms/cmsDbMapping";
import { listApprovalRequests, saveApprovalRequest } from "@/services/cms/approvalsStore";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function GET(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "view", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.cmsRole === "driver") return NextResponse.json({ error: "Driver role cannot access CMS approvals." }, { status: 403 });

  const { approvalRequests, source } = await listApprovalRequests({
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ approvalRequests, source });
}

export async function POST(request: NextRequest) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "create", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.cmsRole === "driver") return NextResponse.json({ error: "Driver role cannot create CMS approvals." }, { status: 403 });

  const input = extractApprovalInput(await request.json().catch(() => null));
  if (!input?.title?.trim() || !input?.detail?.trim() || !input?.targetId?.trim()) {
    return NextResponse.json({ error: "title, detail, and targetId are required." }, { status: 400 });
  }

  const approvalRequest: CmsApprovalRequest = {
    id: input.id?.trim() || `approval-${Date.now()}`,
    tenantId: guard.tenantId,
    action: normalizeApprovalAction(input.action),
    targetId: input.targetId.trim(),
    title: input.title.trim(),
    detail: input.detail.trim(),
    requestedBy: input.requestedBy?.trim() || guard.user.name,
    requestedAt: input.requestedAt || new Date().toISOString(),
    status: normalizeApprovalStatus(input.status),
    decidedBy: input.decidedBy?.trim() || undefined,
    decidedAt: input.decidedAt,
    decisionReason: input.decisionReason?.trim() || undefined,
  };

  const { approvalRequests, source } = await saveApprovalRequest(approvalRequest, {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  });
  return NextResponse.json({ approvalRequest, approvalRequests, source }, { status: 201 });
}

function extractApprovalInput(body: unknown): Partial<CmsApprovalRequest> | null {
  if (!isRecord(body)) return null;
  return isRecord(body.approvalRequest) ? (body.approvalRequest as Partial<CmsApprovalRequest>) : (body as Partial<CmsApprovalRequest>);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
