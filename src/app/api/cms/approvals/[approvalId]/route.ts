import { NextRequest, NextResponse } from "next/server";
import type { CmsApprovalRequest } from "@/modules/cms/types";
import { normalizeApprovalStatus } from "@/services/cms/cmsDbMapping";
import { findApprovalRequest, updateApprovalRequest } from "@/services/cms/approvalsStore";
import { requireCmsPermission } from "@/services/cms/serverGuards";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ approvalId: string }> }) {
  const tenantId = request.nextUrl.searchParams.get("tenantId") || "tenant-demo-latam";
  const guard = await requireCmsPermission(request, "approve", tenantId);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { approvalId } = await params;
  const context = {
    tenantId: guard.tenantId,
    actor: {
      id: guard.user.id,
      name: guard.user.name,
      role: guard.user.role,
    },
  };
  const existing = await findApprovalRequest(approvalId, context);
  if (!existing) return NextResponse.json({ error: "Approval request not found." }, { status: 404 });

  const body = (await request.json().catch(() => null)) as Partial<CmsApprovalRequest> | null;
  const status = normalizeApprovalStatus(body?.status);
  if (status === "pending") {
    return NextResponse.json({ error: "Approval decision must be approved or rejected." }, { status: 400 });
  }

  const approvalRequest = await updateApprovalRequest(
    approvalId,
    {
      status,
      decidedBy: body?.decidedBy?.trim() || guard.user.name,
      decidedAt: body?.decidedAt || new Date().toISOString(),
      decisionReason: body?.decisionReason?.trim() || undefined,
    },
    context,
  );
  return NextResponse.json({ approvalRequest });
}
