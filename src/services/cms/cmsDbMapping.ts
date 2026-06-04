import {
  cmsRoles,
  type ApprovalActionKey,
  type ApprovalRequestStatus,
  type CmsApprovalRequest,
  type CmsIncident,
  type CmsRole,
} from "@/modules/cms/types";

export const cmsIncidentStatuses: CmsIncident["status"][] = ["open", "in_review", "resolved"];
export const cmsIncidentSeverities: CmsIncident["severity"][] = ["low", "medium", "high"];
export const approvalRequestStatuses: ApprovalRequestStatus[] = ["pending", "approved", "rejected"];
export const approvalActions: ApprovalActionKey[] = [
  "approve_suggested_routes",
  "critical_reassignment",
  "cancel_route",
  "change_sla",
  "change_permissions",
  "change_tenant",
  "change_critical_operations_config",
];

export function mapDbIncidentToDomain(record: {
  id: string;
  tenantId: string;
  title: string;
  status: string;
  severity: string;
  ownerRole: string;
  routeId: string | null;
  detail: string;
  createdAt: Date;
}): CmsIncident {
  return {
    id: record.id,
    tenantId: record.tenantId,
    title: record.title,
    status: normalizeIncidentStatus(record.status),
    severity: normalizeIncidentSeverity(record.severity),
    ownerRole: normalizeCmsRole(record.ownerRole),
    routeId: record.routeId ?? undefined,
    createdAt: record.createdAt.toISOString(),
    detail: record.detail,
  };
}

export function mapDomainIncidentToDb(incident: CmsIncident, tenantId: string) {
  return {
    id: incident.id,
    tenantId,
    title: incident.title,
    status: normalizeIncidentStatus(incident.status),
    severity: normalizeIncidentSeverity(incident.severity),
    ownerRole: normalizeCmsRole(incident.ownerRole),
    routeId: incident.routeId || null,
    detail: incident.detail,
    createdAt: parseDate(incident.createdAt),
    resolvedAt: incident.status === "resolved" ? new Date() : null,
  };
}

export function mapDbApprovalToDomain(record: {
  id: string;
  tenantId: string;
  action: string;
  targetId: string;
  title: string;
  detail: string;
  requestedBy: string;
  requestedAt: Date;
  status: string;
  decidedBy: string | null;
  decidedAt: Date | null;
  decisionReason: string | null;
}): CmsApprovalRequest {
  return {
    id: record.id,
    tenantId: record.tenantId,
    action: normalizeApprovalAction(record.action),
    targetId: record.targetId,
    title: record.title,
    detail: record.detail,
    requestedBy: record.requestedBy,
    requestedAt: record.requestedAt.toISOString(),
    status: normalizeApprovalStatus(record.status),
    decidedBy: record.decidedBy ?? undefined,
    decidedAt: record.decidedAt?.toISOString(),
    decisionReason: record.decisionReason ?? undefined,
  };
}

export function mapDomainApprovalToDb(approval: CmsApprovalRequest, tenantId: string) {
  return {
    id: approval.id,
    tenantId,
    action: normalizeApprovalAction(approval.action),
    targetId: approval.targetId,
    title: approval.title,
    detail: approval.detail,
    requestedBy: approval.requestedBy,
    requestedAt: parseDate(approval.requestedAt),
    status: normalizeApprovalStatus(approval.status),
    decidedBy: approval.decidedBy ?? null,
    decidedAt: approval.decidedAt ? parseDate(approval.decidedAt) : null,
    decisionReason: approval.decisionReason ?? null,
  };
}

export function normalizeIncidentStatus(value: unknown): CmsIncident["status"] {
  return cmsIncidentStatuses.includes(value as CmsIncident["status"]) ? (value as CmsIncident["status"]) : "open";
}

export function normalizeIncidentSeverity(value: unknown): CmsIncident["severity"] {
  return cmsIncidentSeverities.includes(value as CmsIncident["severity"]) ? (value as CmsIncident["severity"]) : "medium";
}

export function normalizeCmsRole(value: unknown): CmsRole {
  return cmsRoles.includes(value as CmsRole) ? (value as CmsRole) : "operations";
}

export function normalizeApprovalStatus(value: unknown): ApprovalRequestStatus {
  return approvalRequestStatuses.includes(value as ApprovalRequestStatus) ? (value as ApprovalRequestStatus) : "pending";
}

export function normalizeApprovalAction(value: unknown): ApprovalActionKey {
  return approvalActions.includes(value as ApprovalActionKey) ? (value as ApprovalActionKey) : "approve_suggested_routes";
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}
