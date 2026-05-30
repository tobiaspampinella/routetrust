import type { CmsAuditLogEntry, CmsAuditResult, CmsRole } from "@/modules/cms/types";

interface AuditInput {
  actor: string;
  role: CmsRole;
  tenantId: string;
  action: string;
  module: string;
  previousValue: string;
  newValue: string;
  result: CmsAuditResult;
  ip?: string;
  userAgent?: string;
}

export function createAuditLogEntry(input: AuditInput, now = new Date()) {
  return {
    id: `audit-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now.toISOString(),
    ...input,
  } satisfies CmsAuditLogEntry;
}

export function prependAuditLog(logs: CmsAuditLogEntry[], entry: CmsAuditLogEntry, maxEntries = 50) {
  return [entry, ...logs].slice(0, maxEntries);
}

export const seedAuditLogs: CmsAuditLogEntry[] = [
  {
    id: "audit-seed-001",
    actor: "Admin Demo",
    role: "super_admin",
    tenantId: "tenant-demo-latam",
    action: "enable_module",
    module: "customer_tracking",
    previousValue: "disabled",
    newValue: "enabled",
    timestamp: "2026-05-27T09:10:00.000Z",
    result: "success",
  },
  {
    id: "audit-seed-002",
    actor: "Admin Demo",
    role: "super_admin",
    tenantId: "tenant-demo-latam",
    action: "change_permissions",
    module: "rbac",
    previousValue: "dispatcher.assign=false",
    newValue: "dispatcher.assign=true",
    timestamp: "2026-05-27T09:18:00.000Z",
    result: "pending_approval",
  },
  {
    id: "audit-seed-003",
    actor: "System",
    role: "super_admin",
    tenantId: "tenant-demo-latam",
    action: "demo_reset",
    module: "demo_sandbox",
    previousValue: "stale demo data",
    newValue: "fresh demo data",
    timestamp: "2026-05-27T09:25:00.000Z",
    result: "success",
  },
];
