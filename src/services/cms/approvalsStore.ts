import "server-only";

import type { CmsApprovalRequest } from "@/modules/cms/types";
import { getPrismaClient } from "@/lib/db/prisma";
import { getDatabaseHealth } from "@/lib/db/status";
import { readJson, runtimeDataPath, writeJsonAtomic } from "@/lib/storage/fileStore";
import { mapDbApprovalToDomain, mapDomainApprovalToDb } from "@/services/cms/cmsDbMapping";
import { ensureCmsFileFallbackAllowed, resolveCmsTenant } from "@/services/cms/cmsTenant";
import { seedApprovalRequests } from "@/services/cms/cmsService";
import { recordAuditEvent, type RuntimeAuditActor } from "@/services/audit/runtimeAuditStore";

interface StoredApprovalsState {
  approvalRequests: CmsApprovalRequest[];
}

export type CmsPersistenceSource = "db" | "file";

interface CmsStoreContext {
  actor?: RuntimeAuditActor;
  tenantId?: string;
}

const APPROVALS_FILE = runtimeDataPath("cms-approvals.json");

export async function listApprovalRequests(context: CmsStoreContext = {}): Promise<{ approvalRequests: CmsApprovalRequest[]; source: CmsPersistenceSource }> {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveCmsTenant(prisma, context.tenantId);
    const records = await prisma.cmsApprovalRequest.findMany({
      where: { tenantId: tenant.id },
      orderBy: { requestedAt: "desc" },
      take: 200,
    });
    return { approvalRequests: records.map(mapDbApprovalToDomain), source: "db" };
  }

  ensureCmsFileFallbackAllowed("CMS approvals", database.detail);
  const state = await readJson<StoredApprovalsState>(APPROVALS_FILE, { approvalRequests: seedApprovalRequests });
  return {
    approvalRequests: state.approvalRequests.filter((request) => !context.tenantId || request.tenantId === context.tenantId),
    source: "file",
  };
}

export async function findApprovalRequest(approvalId: string, context: CmsStoreContext = {}) {
  const { approvalRequests } = await listApprovalRequests(context);
  return approvalRequests.find((approval) => approval.id === approvalId) ?? null;
}

export async function saveApprovalRequest(approval: CmsApprovalRequest, context: CmsStoreContext = {}) {
  const database = await getDatabaseHealth();
  if (database.status === "ok") {
    const prisma = (await getPrismaClient()) as any;
    const tenant = await resolveCmsTenant(prisma, context.tenantId ?? approval.tenantId);
    const existing = await prisma.cmsApprovalRequest.findUnique({ where: { id: approval.id } });
    if (existing && existing.tenantId !== tenant.id) {
      throw new Error("Cross-tenant approval update blocked.");
    }

    const dbApproval = mapDomainApprovalToDb(approval, tenant.id);
    await prisma.cmsApprovalRequest.upsert({
      where: { id: approval.id },
      update: {
        tenantId: tenant.id,
        action: dbApproval.action,
        targetId: dbApproval.targetId,
        title: dbApproval.title,
        detail: dbApproval.detail,
        requestedBy: dbApproval.requestedBy,
        requestedAt: dbApproval.requestedAt,
        status: dbApproval.status,
        decidedBy: dbApproval.decidedBy,
        decidedAt: dbApproval.decidedAt,
        decisionReason: dbApproval.decisionReason,
      },
      create: dbApproval,
    });
    await auditApprovalChange("cms_approval_saved", approval, "db", context.actor, tenant.id);
    return listApprovalRequests({ ...context, tenantId: tenant.id });
  }

  ensureCmsFileFallbackAllowed("CMS approvals", database.detail);
  const state = await readJson<StoredApprovalsState>(APPROVALS_FILE, { approvalRequests: seedApprovalRequests });
  const tenantId = context.tenantId ?? approval.tenantId;
  const nextApproval = { ...approval, tenantId };
  const next = state.approvalRequests.some((item) => item.id === approval.id)
    ? state.approvalRequests.map((item) => (item.id === approval.id ? nextApproval : item))
    : [nextApproval, ...state.approvalRequests];
  await writeJsonAtomic(APPROVALS_FILE, { approvalRequests: next }, { backupBeforeWrite: true });
  await auditApprovalChange("cms_approval_saved", nextApproval, "file", context.actor, tenantId);
  return listApprovalRequests({ ...context, tenantId });
}

export async function updateApprovalRequest(approvalId: string, patch: Partial<CmsApprovalRequest>, context: CmsStoreContext = {}) {
  const existing = await findApprovalRequest(approvalId, context);
  if (!existing) return null;

  const status = patch.status ?? existing.status;
  const decided =
    status === "approved" || status === "rejected"
      ? {
          decidedBy: patch.decidedBy ?? context.actor?.name ?? existing.decidedBy ?? "RouteTrust CMS",
          decidedAt: patch.decidedAt ?? existing.decidedAt ?? new Date().toISOString(),
          decisionReason: patch.decisionReason ?? existing.decisionReason,
        }
      : {
          decidedBy: patch.decidedBy,
          decidedAt: patch.decidedAt,
          decisionReason: patch.decisionReason,
        };

  const updated: CmsApprovalRequest = {
    ...existing,
    ...patch,
    ...decided,
    id: existing.id,
    tenantId: existing.tenantId,
    status,
  };
  const result = await saveApprovalRequest(updated, context);
  return result.approvalRequests.find((approval) => approval.id === approvalId) ?? null;
}

async function auditApprovalChange(
  action: string,
  approval: CmsApprovalRequest,
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
    module: "approvals",
    result: "success",
    details: {
      approvalId: approval.id,
      approvalAction: approval.action,
      targetId: approval.targetId,
      status: approval.status,
      persistence,
      dbTenantId: dbTenantId ?? null,
    },
  });
}
