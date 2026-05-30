import type {
  ApprovalPolicy,
  CmsApprovalRequest,
  CmsBuildStatus,
  CmsDemoSandbox,
  CmsDriver,
  CmsEnterpriseState,
  CmsIncident,
  CmsSuggestedRoute,
  CmsUser,
  TelegramNotificationConfig,
} from "@/modules/cms/types";
import { defaultRbacMatrix } from "@/services/permissions/rbac";
import { seedAuditLogs } from "@/services/audit/auditLog";
import { seedTenants } from "@/services/tenant/tenantService";

export const defaultApprovalPolicies: ApprovalPolicy[] = [
  {
    action: "approve_suggested_routes",
    label: "Aprobacion final de rutas sugeridas",
    required: true,
    approverRoles: ["super_admin", "company_admin", "operations"],
    automationLimit: "La IA puede sugerir rutas, pero no publicarlas sin aprobacion.",
  },
  {
    action: "critical_reassignment",
    label: "Reasignacion critica",
    required: true,
    approverRoles: ["super_admin", "company_admin", "operations", "dispatcher"],
    automationLimit: "Requiere aprobacion si afecta SLA, cliente VIP o mas de 3 paradas.",
  },
  {
    action: "cancel_route",
    label: "Cancelacion de ruta",
    required: true,
    approverRoles: ["super_admin", "company_admin", "operations"],
    automationLimit: "Bloqueada para agentes automaticos.",
  },
  {
    action: "change_sla",
    label: "Cambios de SLA",
    required: true,
    approverRoles: ["super_admin", "company_admin", "customer_success"],
    automationLimit: "Debe quedar auditado y versionado por tenant.",
  },
  {
    action: "change_permissions",
    label: "Cambios de permisos",
    required: true,
    approverRoles: ["super_admin"],
    automationLimit: "Solo Super Admin puede aprobar cambios RBAC.",
  },
  {
    action: "change_tenant",
    label: "Cambios de tenant",
    required: true,
    approverRoles: ["super_admin", "customer_success"],
    automationLimit: "No se permite cambio automatico de plan, estado o modulos criticos.",
  },
  {
    action: "change_critical_operations_config",
    label: "Configuracion operacional critica",
    required: true,
    approverRoles: ["super_admin", "company_admin", "operations"],
    automationLimit: "Reglas de asignacion, prioridades y estados requieren aprobacion humana.",
  },
];

export const seedCmsUsers: CmsUser[] = [
  {
    id: "cms-user-001",
    tenantId: "tenant-demo-latam",
    name: "Admin Demo",
    email: "admin@demo.com",
    role: "super_admin",
    department: "Platform",
    status: "active",
    lastActivityAt: "2026-05-27T09:31:00.000Z",
  },
  {
    id: "cms-user-002",
    tenantId: "tenant-demo-latam",
    name: "Miguel Alvarez",
    email: "driver1@demo.com",
    role: "driver",
    department: "Drivers tercerizados",
    status: "active",
    lastActivityAt: "2026-05-27T09:20:00.000Z",
  },
  {
    id: "cms-user-003",
    tenantId: "tenant-demo-latam",
    name: "Laura Jimenez",
    email: "driver2@demo.com",
    role: "driver",
    department: "Drivers tercerizados",
    status: "active",
    lastActivityAt: "2026-05-27T09:12:00.000Z",
  },
];

export const defaultTelegramConfig: TelegramNotificationConfig = {
  enabled: false,
  botTokenConfigured: false,
  chatIdConfigured: false,
  events: ["route_risk_high", "sla_change_pending", "critical_reassignment_pending", "build_failed"],
  owners: ["operations", "customer_success"],
  criticalAlerts: true,
  buildNotifications: true,
  operationalNotifications: true,
  sentEvents: [
    {
      id: "telegram-event-001",
      event: "route_risk_high",
      status: "skipped",
      timestamp: "2026-05-27T09:30:00.000Z",
      detail: "Telegram env no configurado en demo local.",
    },
  ],
};

export const defaultBuildStatus: CmsBuildStatus = {
  status: "passing",
  branch: "local-beta",
  lastBuildAt: "2026-05-27T14:36:00.000Z",
  lastCommit: "local",
  detail: "Lint y build limpios en la ultima verificacion local.",
};

export const seedSuggestedRoutes: CmsSuggestedRoute[] = [
  {
    id: "suggested-route-001",
    tenantId: "tenant-demo-latam",
    name: "Ruta Norte optimizada",
    zone: "CABA Norte",
    status: "suggested",
    driverId: "cms-driver-001",
    stops: 18,
    estimatedCloseTime: "17:42",
    slaProjection: 94,
    notes: "IA sugiere mantener driver actual y adelantar 2 paradas de prioridad alta.",
  },
  {
    id: "suggested-route-002",
    tenantId: "tenant-demo-latam",
    name: "Ruta Oeste con riesgo",
    zone: "GBA Oeste",
    status: "modified",
    driverId: "cms-driver-002",
    stops: 21,
    estimatedCloseTime: "18:28",
    slaProjection: 88,
    notes: "Requiere aprobacion humana por cierre posterior al objetivo.",
  },
];

export const seedCmsDrivers: CmsDriver[] = [
  {
    id: "cms-driver-001",
    tenantId: "tenant-demo-latam",
    name: "Miguel Alvarez",
    phone: "+54 11 1000 001",
    status: "on_route",
    assignedRouteId: "suggested-route-001",
    vehicle: "RP-210-A",
  },
  {
    id: "cms-driver-002",
    tenantId: "tenant-demo-latam",
    name: "Laura Jimenez",
    phone: "+54 11 1000 002",
    status: "paused",
    assignedRouteId: "suggested-route-002",
    vehicle: "RP-318-B",
  },
];

export const seedCmsIncidents: CmsIncident[] = [
  {
    id: "incident-001",
    tenantId: "tenant-demo-latam",
    title: "Cliente ausente en parada prioritaria",
    status: "open",
    severity: "medium",
    ownerRole: "customer_experience",
    routeId: "suggested-route-002",
    createdAt: "2026-05-27T10:10:00.000Z",
    detail: "Requiere contacto proactivo y posible segunda visita.",
  },
  {
    id: "incident-002",
    tenantId: "tenant-demo-latam",
    title: "Pausa extendida por incidente vial",
    status: "in_review",
    severity: "high",
    ownerRole: "operations",
    routeId: "suggested-route-002",
    createdAt: "2026-05-27T10:24:00.000Z",
    detail: "Impacta ETA de 7 entregas pendientes.",
  },
];

export const defaultDemoSandbox: CmsDemoSandbox = {
  enabled: true,
  lastGeneratedAt: "2026-05-27T09:25:00.000Z",
  routes: 3,
  drivers: 3,
  customers: 20,
  status: "ready",
  truckSimulation: "idle",
  speedMultiplier: 1,
  trafficScenario: "normal",
  delayMinutes: 0,
  completedDeliveries: 0,
  failedDeliveries: 0,
  pendingApprovals: 1,
  events: [
    {
      id: "sandbox-event-001",
      type: "sandbox_generated",
      label: "Sandbox listo",
      detail: "Datos demo cargados para ruta comercial segura.",
      timestamp: "2026-05-27T09:25:00.000Z",
      tone: "success",
    },
    {
      id: "sandbox-event-002",
      type: "route_approval_requested",
      label: "Aprobacion pendiente",
      detail: "Ruta Oeste con riesgo requiere decision humana antes de publicarse.",
      timestamp: "2026-05-27T09:28:00.000Z",
      tone: "warning",
    },
  ],
};

export const seedApprovalRequests: CmsApprovalRequest[] = [
  {
    id: "approval-001",
    tenantId: "tenant-demo-latam",
    action: "approve_suggested_routes",
    targetId: "suggested-route-002",
    title: "Aprobar Ruta Oeste con riesgo",
    detail: "Cierre estimado 18:28. Requiere aprobacion humana por SLA proyectado 88%.",
    requestedBy: "RoutePulse AI rules engine",
    requestedAt: "2026-05-27T09:28:00.000Z",
    status: "pending",
  },
];

export function getDefaultEnterpriseCmsState(): CmsEnterpriseState {
  return {
    tenants: structuredClone(seedTenants),
    users: structuredClone(seedCmsUsers),
    rbac: structuredClone(defaultRbacMatrix),
    approvalPolicies: structuredClone(defaultApprovalPolicies),
    auditLogs: structuredClone(seedAuditLogs),
    telegram: structuredClone(defaultTelegramConfig),
    buildStatus: structuredClone(defaultBuildStatus),
    suggestedRoutes: structuredClone(seedSuggestedRoutes),
    drivers: structuredClone(seedCmsDrivers),
    incidents: structuredClone(seedCmsIncidents),
    demoSandbox: structuredClone(defaultDemoSandbox),
    approvalRequests: structuredClone(seedApprovalRequests),
  };
}

export function getApisNeededForEnterpriseCms() {
  return [
    "GET /api/cms/tenants",
    "POST /api/cms/tenants",
    "PATCH /api/cms/tenants/:tenantId",
    "GET /api/cms/users",
    "POST /api/cms/users",
    "PATCH /api/cms/users/:userId",
    "GET /api/cms/rbac",
    "PATCH /api/cms/rbac",
    "GET /api/cms/audit-logs",
    "POST /api/cms/approvals",
    "PATCH /api/cms/approvals/:approvalId",
    "GET /api/cms/notifications/telegram",
    "PATCH /api/cms/notifications/telegram",
    "POST /api/cms/demo/reset",
  ];
}
