export const cmsRoles = [
  "super_admin",
  "company_admin",
  "operations",
  "dispatcher",
  "driver",
  "customer_experience",
  "customer_success",
  "finance",
  "commercial",
  "external_customer",
  "viewer",
] as const;

export type CmsRole = (typeof cmsRoles)[number];

export const cmsPermissions = ["view", "create", "update", "delete", "approve", "assign", "export", "configure"] as const;

export type CmsPermission = (typeof cmsPermissions)[number];

export const cmsModuleKeys = [
  "operational_dashboard",
  "tracking",
  "driver_portal",
  "routes",
  "incidents",
  "customer_tracking",
  "reports",
  "telegram_notifications",
  "audit_logs",
  "demo_sandbox",
] as const;

export type CmsModuleKey = (typeof cmsModuleKeys)[number];

export type TenantStatus = "active" | "inactive" | "suspended";

export type TenantPlan = "starter" | "growth" | "pro" | "enterprise";

export type CmsAuditResult = "success" | "blocked" | "pending_approval" | "failed";

export type ApprovalActionKey =
  | "approve_suggested_routes"
  | "critical_reassignment"
  | "cancel_route"
  | "change_sla"
  | "change_permissions"
  | "change_tenant"
  | "change_critical_operations_config";

export interface TenantBrandingConfig {
  logoUrl?: string;
  companyName: string;
  primaryColor: string;
  secondaryColor: string;
  futureDomain?: string;
  language: string;
}

export interface CmsTenant {
  id: string;
  name: string;
  status: TenantStatus;
  plan: TenantPlan;
  enabledModules: CmsModuleKey[];
  usersCount: number;
  operationalStatus: "healthy" | "watch" | "risk";
  metrics: {
    activeRoutes: number;
    delayedDeliveries: number;
    slaAtRisk: number;
    incidentsOpen: number;
  };
  branding: TenantBrandingConfig;
}

export interface CmsUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: CmsRole;
  department: string;
  status: "active" | "suspended";
  lastActivityAt: string;
}

export interface RbacRule {
  role: CmsRole;
  permissions: Record<CmsPermission, boolean>;
}

export interface ApprovalPolicy {
  action: ApprovalActionKey;
  label: string;
  required: boolean;
  approverRoles: CmsRole[];
  automationLimit: string;
}

export type ApprovalRequestStatus = "pending" | "approved" | "rejected";

export interface CmsApprovalRequest {
  id: string;
  tenantId: string;
  action: ApprovalActionKey;
  targetId: string;
  title: string;
  detail: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalRequestStatus;
  decidedBy?: string;
  decidedAt?: string;
  decisionReason?: string;
}

export interface CmsAuditLogEntry {
  id: string;
  actor: string;
  role: CmsRole;
  tenantId: string;
  action: string;
  module: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  result: CmsAuditResult;
}

export interface TelegramNotificationConfig {
  enabled: boolean;
  botTokenConfigured: boolean;
  chatIdConfigured: boolean;
  events: string[];
  owners: string[];
  criticalAlerts: boolean;
  buildNotifications: boolean;
  operationalNotifications: boolean;
  sentEvents: TelegramSentEvent[];
}

export interface TelegramSentEvent {
  id: string;
  event: string;
  status: "sent" | "skipped" | "failed";
  timestamp: string;
  detail: string;
}

export interface CmsBuildStatus {
  status: "passing" | "warning" | "failed";
  branch: string;
  lastBuildAt: string;
  lastCommit: string;
  detail: string;
}

export interface CmsSuggestedRoute {
  id: string;
  tenantId: string;
  name: string;
  zone: string;
  status: "suggested" | "modified" | "approved" | "rejected";
  driverId?: string;
  stops: number;
  estimatedCloseTime: string;
  slaProjection: number;
  notes: string;
}

export interface CmsDriver {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  status: "available" | "on_route" | "paused" | "offline";
  assignedRouteId?: string;
  vehicle: string;
}

export interface CmsIncident {
  id: string;
  tenantId: string;
  title: string;
  status: "open" | "in_review" | "resolved";
  severity: "low" | "medium" | "high";
  ownerRole: CmsRole;
  routeId?: string;
  createdAt: string;
  detail: string;
}

export interface CmsDemoSandbox {
  enabled: boolean;
  lastGeneratedAt?: string;
  routes: number;
  drivers: number;
  customers: number;
  status: "empty" | "ready" | "running" | "paused";
  truckSimulation: "idle" | "running" | "paused";
  speedMultiplier: number;
  trafficScenario: "normal" | "rush_hour" | "blocked_street" | "incident_delay";
  activeIncident?: string;
  delayMinutes: number;
  completedDeliveries: number;
  failedDeliveries: number;
  pendingApprovals: number;
  events: CmsDemoSandboxEvent[];
}

export interface CmsDemoSandboxEvent {
  id: string;
  type:
    | "sandbox_generated"
    | "simulation_started"
    | "simulation_paused"
    | "speed_changed"
    | "traffic_simulated"
    | "street_blocked"
    | "delay_simulated"
    | "delivery_completed"
    | "delivery_failed"
    | "incident_created"
    | "route_approval_requested"
    | "route_approved_by_human"
    | "route_rejected_by_human";
  label: string;
  detail: string;
  timestamp: string;
  tone: "info" | "success" | "warning" | "danger";
}

export interface CmsEnterpriseState {
  tenants: CmsTenant[];
  users: CmsUser[];
  rbac: RbacRule[];
  approvalPolicies: ApprovalPolicy[];
  auditLogs: CmsAuditLogEntry[];
  telegram: TelegramNotificationConfig;
  buildStatus: CmsBuildStatus;
  suggestedRoutes: CmsSuggestedRoute[];
  drivers: CmsDriver[];
  incidents: CmsIncident[];
  demoSandbox: CmsDemoSandbox;
  approvalRequests: CmsApprovalRequest[];
}

export const cmsRoleLabels: Record<CmsRole, string> = {
  super_admin: "Super Admin",
  company_admin: "Admin Empresa",
  operations: "Operaciones",
  dispatcher: "Dispatcher",
  driver: "Driver",
  customer_experience: "Customer Experience",
  customer_success: "Customer Success",
  finance: "CFO / Finanzas",
  commercial: "Comercial",
  external_customer: "Cliente Externo",
  viewer: "Viewer",
};

export const cmsPermissionLabels: Record<CmsPermission, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  approve: "Approve",
  assign: "Assign",
  export: "Export",
  configure: "Configure",
};

export const cmsModuleLabels: Record<CmsModuleKey, string> = {
  operational_dashboard: "Dashboard operacional",
  tracking: "Tracking",
  driver_portal: "Portal driver",
  routes: "Rutas",
  incidents: "Incidencias",
  customer_tracking: "Customer tracking",
  reports: "Reportes",
  telegram_notifications: "Telegram notifications",
  audit_logs: "Audit logs",
  demo_sandbox: "Demo sandbox",
};
