import type { CmsModuleKey, CmsTenant, TenantStatus } from "@/modules/cms/types";

export const seedTenants: CmsTenant[] = [
  {
    id: "tenant-demo-latam",
    name: "RoutePulse AI LatAm Demo",
    status: "active",
    plan: "pro",
    enabledModules: [
      "operational_dashboard",
      "tracking",
      "driver_portal",
      "routes",
      "customer_tracking",
      "reports",
      "audit_logs",
      "demo_sandbox",
    ],
    usersCount: 4,
    operationalStatus: "watch",
    metrics: {
      activeRoutes: 2,
      delayedDeliveries: 9,
      slaAtRisk: 3,
      incidentsOpen: 2,
    },
    branding: {
      companyName: "RoutePulse AI LatAm Demo",
      primaryColor: "#0071e3",
      secondaryColor: "#1d1d1f",
      futureDomain: "tracking.routepulse.ai",
      language: "es-AR",
    },
  },
  {
    id: "tenant-amba-fast",
    name: "AMBA Fast Logistics",
    status: "inactive",
    plan: "growth",
    enabledModules: ["operational_dashboard", "routes", "reports", "demo_sandbox"],
    usersCount: 11,
    operationalStatus: "healthy",
    metrics: {
      activeRoutes: 0,
      delayedDeliveries: 0,
      slaAtRisk: 0,
      incidentsOpen: 0,
    },
    branding: {
      companyName: "AMBA Fast Logistics",
      primaryColor: "#0f766e",
      secondaryColor: "#111827",
      language: "es-AR",
    },
  },
];

export function updateTenantStatus(tenants: CmsTenant[], tenantId: string, status: TenantStatus) {
  return tenants.map((tenant) => (tenant.id === tenantId ? { ...tenant, status } : tenant));
}

export function toggleTenantModule(tenants: CmsTenant[], tenantId: string, moduleKey: CmsModuleKey) {
  return tenants.map((tenant) => {
    if (tenant.id !== tenantId) return tenant;
    const enabled = tenant.enabledModules.includes(moduleKey);

    return {
      ...tenant,
      enabledModules: enabled
        ? tenant.enabledModules.filter((item) => item !== moduleKey)
        : [...tenant.enabledModules, moduleKey],
    };
  });
}

export function getTenantSummary(tenants: CmsTenant[]) {
  return {
    total: tenants.length,
    active: tenants.filter((tenant) => tenant.status === "active").length,
    atRisk: tenants.filter((tenant) => tenant.operationalStatus === "risk" || tenant.operationalStatus === "watch").length,
    enabledDemoSandboxes: tenants.filter((tenant) => tenant.enabledModules.includes("demo_sandbox")).length,
  };
}
