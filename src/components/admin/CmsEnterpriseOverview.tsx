"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  CirclePlay,
  GitBranch,
  LockKeyhole,
  MapPinned,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Workflow,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  cmsModuleKeys,
  cmsModuleLabels,
  cmsPermissionLabels,
  cmsRoleLabels,
  type CmsDriver,
  type CmsIncident,
  type CmsModuleKey,
  type CmsRole,
  type CmsSuggestedRoute,
  type CmsUser,
  type CmsDemoSandboxEvent,
  type ApprovalActionKey,
  type TenantStatus,
} from "@/modules/cms/types";
import { createAuditLogEntry, prependAuditLog } from "@/services/audit/auditLog";
import { getDefaultEnterpriseCmsState } from "@/services/cms/cmsService";
import { canPerform } from "@/services/permissions/rbac";
import { getTenantSummary, toggleTenantModule, updateTenantStatus } from "@/services/tenant/tenantService";
import { useRoutePulseStore } from "@/store/routePulseStore";

type CmsSection = "overview" | "tenants" | "users" | "routes" | "drivers" | "incidents" | "approvals" | "audit" | "telegram" | "sandbox";

const sections: Array<{ id: CmsSection; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Resumen", icon: Activity },
  { id: "tenants", label: "Tenants", icon: Building2 },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "routes", label: "Rutas", icon: Route },
  { id: "drivers", label: "Drivers", icon: Truck },
  { id: "incidents", label: "Incidencias", icon: AlertTriangle },
  { id: "approvals", label: "Aprobaciones", icon: LockKeyhole },
  { id: "audit", label: "Audit logs", icon: ShieldCheck },
  { id: "telegram", label: "Telegram", icon: Bell },
  { id: "sandbox", label: "Demo sandbox", icon: CirclePlay },
];

const defaultTenantForm = {
  name: "",
  plan: "starter",
};

const defaultUserForm = {
  name: "",
  email: "",
  role: "viewer" as CmsRole,
  tenantId: "tenant-demo-latam",
  department: "Operaciones",
};

const defaultDriverForm = {
  name: "",
  phone: "",
  tenantId: "tenant-demo-latam",
  vehicle: "",
};

export function CmsEnterpriseOverview() {
  const currentUser = useRoutePulseStore((state) => state.currentUser);
  const resetDemo = useRoutePulseStore((state) => state.resetDemo);
  const trackingCms = useRoutePulseStore((state) => state.trackingCms);
  const routes = useRoutePulseStore((state) => state.routes);
  const packages = useRoutePulseStore((state) => state.packages);
  const pauseTrackingSimulation = useRoutePulseStore((state) => state.pauseTrackingSimulation);
  const restartTrackingSimulation = useRoutePulseStore((state) => state.restartTrackingSimulation);
  const updateTrackingCms = useRoutePulseStore((state) => state.updateTrackingCms);
  const startRoute = useRoutePulseStore((state) => state.startRoute);
  const pauseRoute = useRoutePulseStore((state) => state.pauseRoute);
  const markDelivered = useRoutePulseStore((state) => state.markDelivered);
  const markFailed = useRoutePulseStore((state) => state.markFailed);
  const recalculateRouteEta = useRoutePulseStore((state) => state.recalculateRouteEta);
  const [section, setSection] = useState<CmsSection>("overview");
  const [cmsState, setCmsState] = useState(() => getDefaultEnterpriseCmsState());
  const [tenantForm, setTenantForm] = useState(defaultTenantForm);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [driverForm, setDriverForm] = useState(defaultDriverForm);
  const [telegramStatus, setTelegramStatus] = useState("Pendiente de validar");
  const [telegramBusy, setTelegramBusy] = useState(false);
  const summary = useMemo(() => getTenantSummary(cmsState.tenants), [cmsState.tenants]);
  const actor = currentUser?.name ?? "Admin Demo";
  const actorRole = "super_admin" as const;
  const activeTenantIds = cmsState.tenants.map((tenant) => tenant.id);
  const visibleUsers = cmsState.users.filter((user) => activeTenantIds.includes(user.tenantId));

  function appendAudit(input: {
    tenantId: string;
    action: string;
    module: string;
    previousValue: string;
    newValue: string;
    result?: "success" | "blocked" | "pending_approval" | "failed";
  }) {
    setCmsState((state) => ({
      ...state,
      auditLogs: prependAuditLog(
        state.auditLogs,
        createAuditLogEntry({
          actor,
          role: actorRole,
          tenantId: input.tenantId,
          action: input.action,
          module: input.module,
          previousValue: input.previousValue,
          newValue: input.newValue,
          result: input.result ?? "success",
          userAgent: "browser-local-demo",
        }),
      ),
    }));
  }

  function createSandboxEvent(input: Omit<CmsDemoSandboxEvent, "id" | "timestamp">): CmsDemoSandboxEvent {
    return {
      id: `sandbox-event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...input,
    };
  }

  function pushSandboxEvent(event: Omit<CmsDemoSandboxEvent, "id" | "timestamp">) {
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        events: [createSandboxEvent(event), ...state.demoSandbox.events].slice(0, 10),
      },
    }));
  }

  function requestApproval(input: { action: ApprovalActionKey; targetId: string; title: string; detail: string }) {
    const approvalId = `approval-${Date.now()}`;
    setCmsState((state) => ({
      ...state,
      approvalRequests: [
        {
          id: approvalId,
          tenantId: "tenant-demo-latam",
          action: input.action,
          targetId: input.targetId,
          title: input.title,
          detail: input.detail,
          requestedBy: "RoutePulse AI rules engine",
          requestedAt: new Date().toISOString(),
          status: "pending",
        },
        ...state.approvalRequests,
      ],
      demoSandbox: {
        ...state.demoSandbox,
        pendingApprovals: state.approvalRequests.filter((item) => item.status === "pending").length + 1,
        events: [
          createSandboxEvent({
            type: "route_approval_requested",
            label: "Aprobacion humana requerida",
            detail: input.detail,
            tone: "warning",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: input.action,
      module: "human_approval",
      previousValue: "none",
      newValue: input.targetId,
      result: "pending_approval",
    });
  }

  function resolveApproval(approvalId: string, approved: boolean) {
    const approval = cmsState.approvalRequests.find((item) => item.id === approvalId);
    if (!approval) return;

    setCmsState((state) => {
      const nextRequests = state.approvalRequests.map((item) =>
        item.id === approvalId
          ? {
              ...item,
              status: approved ? ("approved" as const) : ("rejected" as const),
              decidedBy: actor,
              decidedAt: new Date().toISOString(),
              decisionReason: approved ? "Aprobado por operador humano." : "Rechazado por operador humano.",
            }
          : item,
      );

      return {
        ...state,
        approvalRequests: nextRequests,
        suggestedRoutes: state.suggestedRoutes.map((route) =>
          route.id === approval.targetId && approval.action === "approve_suggested_routes"
            ? { ...route, status: approved ? ("approved" as const) : ("rejected" as const) }
            : route,
        ),
        demoSandbox: {
          ...state.demoSandbox,
          pendingApprovals: nextRequests.filter((item) => item.status === "pending").length,
          events: [
            createSandboxEvent({
              type: approved ? "route_approved_by_human" : "route_rejected_by_human",
              label: approved ? "Ruta aprobada por humano" : "Ruta rechazada por humano",
              detail: approval.title,
              tone: approved ? "success" : "danger",
            }),
            ...state.demoSandbox.events,
          ].slice(0, 10),
        },
      };
    });
    appendAudit({
      tenantId: approval.tenantId,
      action: approved ? "approval_approved" : "approval_rejected",
      module: "human_approval",
      previousValue: approval.status,
      newValue: approved ? "approved" : "rejected",
      result: "success",
    });
  }

  function setTenantStatus(tenantId: string, status: TenantStatus) {
    const tenant = cmsState.tenants.find((item) => item.id === tenantId);
    if (!tenant) return;

    setCmsState((state) => ({
      ...state,
      tenants: updateTenantStatus(state.tenants, tenantId, status),
    }));
    appendAudit({
      tenantId,
      action: "change_tenant_status",
      module: "tenants",
      previousValue: tenant.status,
      newValue: status,
      result: "pending_approval",
    });
  }

  function toggleModule(tenantId: string, moduleKey: CmsModuleKey) {
    const tenant = cmsState.tenants.find((item) => item.id === tenantId);
    if (!tenant) return;
    const enabled = tenant.enabledModules.includes(moduleKey);

    setCmsState((state) => ({
      ...state,
      tenants: toggleTenantModule(state.tenants, tenantId, moduleKey),
    }));
    appendAudit({
      tenantId,
      action: enabled ? "disable_module" : "enable_module",
      module: moduleKey,
      previousValue: enabled ? "enabled" : "disabled",
      newValue: enabled ? "disabled" : "enabled",
      result: moduleKey === "audit_logs" || moduleKey === "telegram_notifications" ? "pending_approval" : "success",
    });
  }

  function createTenant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = tenantForm.name.trim();
    if (!name) return;
    const now = Date.now();
    const tenantId = `tenant-${now}`;

    setCmsState((state) => ({
      ...state,
      tenants: [
        ...state.tenants,
        {
          id: tenantId,
          name,
          status: "active",
          plan: tenantForm.plan as "starter",
          enabledModules: ["operational_dashboard", "routes", "reports", "demo_sandbox"],
          usersCount: 0,
          operationalStatus: "healthy",
          metrics: { activeRoutes: 0, delayedDeliveries: 0, slaAtRisk: 0, incidentsOpen: 0 },
          branding: {
            companyName: name,
            primaryColor: "#0071e3",
            secondaryColor: "#1d1d1f",
            language: "es-AR",
          },
        },
      ],
    }));
    appendAudit({
      tenantId,
      action: "create_tenant",
      module: "tenants",
      previousValue: "none",
      newValue: name,
      result: "pending_approval",
    });
    setTenantForm(defaultTenantForm);
  }

  function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim() || !activeTenantIds.includes(userForm.tenantId)) return;
    const user: CmsUser = {
      id: `cms-user-${Date.now()}`,
      tenantId: userForm.tenantId,
      name: userForm.name.trim(),
      email: userForm.email.trim().toLowerCase(),
      role: userForm.role,
      department: userForm.department.trim() || "Operaciones",
      status: "active",
      lastActivityAt: new Date().toISOString(),
    };

    setCmsState((state) => ({
      ...state,
      users: [...state.users, user],
      tenants: state.tenants.map((tenant) => (tenant.id === user.tenantId ? { ...tenant, usersCount: tenant.usersCount + 1 } : tenant)),
    }));
    appendAudit({
      tenantId: user.tenantId,
      action: "create_user",
      module: "users",
      previousValue: "none",
      newValue: `${user.email}:${user.role}`,
    });
    setUserForm(defaultUserForm);
  }

  function updateUser(userId: string, patch: Partial<CmsUser>) {
    const user = cmsState.users.find((item) => item.id === userId);
    if (!user) return;
    if (patch.tenantId && !activeTenantIds.includes(patch.tenantId)) {
      appendAudit({
        tenantId: user.tenantId,
        action: "blocked_cross_tenant_user_update",
        module: "users",
        previousValue: user.tenantId,
        newValue: patch.tenantId,
        result: "blocked",
      });
      return;
    }

    setCmsState((state) => ({
      ...state,
      users: state.users.map((item) => (item.id === userId ? { ...item, ...patch } : item)),
    }));
    appendAudit({
      tenantId: patch.tenantId ?? user.tenantId,
      action: "update_user",
      module: "users",
      previousValue: `${user.role}:${user.status}:${user.tenantId}`,
      newValue: `${patch.role ?? user.role}:${patch.status ?? user.status}:${patch.tenantId ?? user.tenantId}`,
      result: patch.role ? "pending_approval" : "success",
    });
  }

  function updateSuggestedRoute(routeId: string, patch: Partial<CmsSuggestedRoute>, action = "update_suggested_route") {
    const route = cmsState.suggestedRoutes.find((item) => item.id === routeId);
    if (!route) return;
    if (patch.tenantId && !activeTenantIds.includes(patch.tenantId)) return;

    setCmsState((state) => ({
      ...state,
      suggestedRoutes: state.suggestedRoutes.map((item) => (item.id === routeId ? { ...item, ...patch } : item)),
    }));
    appendAudit({
      tenantId: route.tenantId,
      action,
      module: "routes",
      previousValue: `${route.status}:${route.driverId ?? "none"}:${route.estimatedCloseTime}`,
      newValue: `${patch.status ?? route.status}:${patch.driverId ?? route.driverId ?? "none"}:${patch.estimatedCloseTime ?? route.estimatedCloseTime}`,
      result: "success",
    });
  }

  function createDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!driverForm.name.trim() || !activeTenantIds.includes(driverForm.tenantId)) return;
    const driver: CmsDriver = {
      id: `cms-driver-${Date.now()}`,
      tenantId: driverForm.tenantId,
      name: driverForm.name.trim(),
      phone: driverForm.phone.trim() || "+54 11 demo",
      vehicle: driverForm.vehicle.trim() || "Unidad demo",
      status: "available",
    };

    setCmsState((state) => ({
      ...state,
      drivers: [...state.drivers, driver],
    }));
    appendAudit({
      tenantId: driver.tenantId,
      action: "create_driver",
      module: "drivers",
      previousValue: "none",
      newValue: driver.name,
    });
    setDriverForm(defaultDriverForm);
  }

  function updateIncident(incidentId: string, patch: Partial<CmsIncident>) {
    const incident = cmsState.incidents.find((item) => item.id === incidentId);
    if (!incident) return;

    setCmsState((state) => ({
      ...state,
      incidents: state.incidents.map((item) => (item.id === incidentId ? { ...item, ...patch } : item)),
    }));
    appendAudit({
      tenantId: incident.tenantId,
      action: "update_incident",
      module: "incidents",
      previousValue: `${incident.status}:${incident.ownerRole}`,
      newValue: `${patch.status ?? incident.status}:${patch.ownerRole ?? incident.ownerRole}`,
    });
  }

  async function refreshTelegramStatus() {
    setTelegramBusy(true);
    const response = await fetch("/api/cms/telegram/status", { credentials: "include" }).catch(() => null);
    const payload = response?.ok ? ((await response.json().catch(() => null)) as { enabled?: boolean } | null) : null;
    setTelegramStatus(payload?.enabled ? "Configurado" : "Faltan variables env");
    setTelegramBusy(false);
  }

  async function sendTelegramTest() {
    setTelegramBusy(true);
    const response = await fetch("/api/cms/telegram/test", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as { status?: "sent" | "skipped" | "failed"; detail?: string; timestamp?: string } | null;
    const event = {
      id: `telegram-event-${Date.now()}`,
      event: "manual_test",
      status: payload?.status ?? "failed",
      timestamp: payload?.timestamp ?? new Date().toISOString(),
      detail: payload?.detail ?? "No se pudo ejecutar el test.",
    };
    setCmsState((state) => ({
      ...state,
      telegram: {
        ...state.telegram,
        sentEvents: [event, ...state.telegram.sentEvents].slice(0, 8),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "telegram_test",
      module: "telegram_notifications",
      previousValue: "requested",
      newValue: event.status,
      result: event.status === "sent" ? "success" : event.status === "skipped" ? "blocked" : "failed",
    });
    setTelegramBusy(false);
  }

  function generateSandbox() {
    const now = new Date().toISOString();
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        enabled: true,
        lastGeneratedAt: now,
        routes: 5,
        drivers: 5,
        customers: 50,
        status: "ready",
        truckSimulation: "idle",
        speedMultiplier: state.demoSandbox.speedMultiplier,
        trafficScenario: "normal",
        activeIncident: undefined,
        delayMinutes: 0,
        completedDeliveries: 0,
        failedDeliveries: 0,
        pendingApprovals: state.approvalRequests.filter((item) => item.status === "pending").length,
        events: [
          createSandboxEvent({
            type: "sandbox_generated",
            label: "Datos demo generados",
            detail: "5 rutas, 5 drivers y 50 clientes ficticios cargados en sandbox.",
            tone: "success",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "generate_demo_sandbox",
      module: "demo_sandbox",
      previousValue: "current demo",
      newValue: "5 routes / 5 drivers / 50 customers",
    });
  }

  function resetSandbox() {
    resetDemo();
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        enabled: true,
        lastGeneratedAt: new Date().toISOString(),
        routes: 3,
        drivers: 3,
        customers: 20,
        status: "ready",
        truckSimulation: "idle",
        speedMultiplier: 1,
        trafficScenario: "normal",
        activeIncident: undefined,
        delayMinutes: 0,
        completedDeliveries: 0,
        failedDeliveries: 0,
        pendingApprovals: state.approvalRequests.filter((item) => item.status === "pending").length,
        events: [
          createSandboxEvent({
            type: "sandbox_generated",
            label: "Sandbox reiniciado",
            detail: "Datos mock restaurados y simulacion detenida.",
            tone: "info",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "reset_demo_sandbox",
      module: "demo_sandbox",
      previousValue: "custom demo",
      newValue: "default demo",
    });
  }

  function toggleSandboxEnabled() {
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        enabled: !state.demoSandbox.enabled,
        status: state.demoSandbox.enabled ? "paused" : "ready",
        truckSimulation: state.demoSandbox.enabled ? "paused" : "idle",
        events: [
          createSandboxEvent({
            type: state.demoSandbox.enabled ? "simulation_paused" : "sandbox_generated",
            label: state.demoSandbox.enabled ? "Sandbox desactivado" : "Sandbox activado",
            detail: state.demoSandbox.enabled ? "Las simulaciones comerciales quedaron pausadas." : "El entorno demo queda listo para operar.",
            tone: state.demoSandbox.enabled ? "warning" : "success",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "toggle_demo_sandbox",
      module: "demo_sandbox",
      previousValue: cmsState.demoSandbox.enabled ? "enabled" : "disabled",
      newValue: cmsState.demoSandbox.enabled ? "disabled" : "enabled",
    });
  }

  function startSandboxTruck() {
    restartTrackingSimulation();
    startRoute(routes[0]?.id ?? "route-001");
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        enabled: true,
        status: "running",
        truckSimulation: "running",
        events: [
          createSandboxEvent({
            type: "simulation_started",
            label: "Camion demo iniciado",
            detail: "El tracking cliente y el panel operador muestran movimiento en vivo.",
            tone: "success",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "start_demo_truck",
      module: "demo_sandbox",
      previousValue: "idle",
      newValue: "running",
    });
  }

  function pauseSandboxTruck() {
    pauseTrackingSimulation();
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        status: "paused",
        truckSimulation: "paused",
        events: [
          createSandboxEvent({
            type: "simulation_paused",
            label: "Camion demo pausado",
            detail: "La pausa impacta el ETA de las proximas entregas del tracking demo.",
            tone: "warning",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "pause_demo_truck",
      module: "demo_sandbox",
      previousValue: "running",
      newValue: "paused",
    });
  }

  function setSandboxSpeed(speedMultiplier: number) {
    updateTrackingCms({ liveSimulationSpeed: speedMultiplier });
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        speedMultiplier,
        events: [
          createSandboxEvent({
            type: "speed_changed",
            label: "Velocidad simulada ajustada",
            detail: `Nueva velocidad x${speedMultiplier.toFixed(2)}.`,
            tone: "info",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "change_demo_speed",
      module: "demo_sandbox",
      previousValue: `x${trackingCms.liveSimulationSpeed}`,
      newValue: `x${speedMultiplier}`,
    });
  }

  function simulateTraffic() {
    updateTrackingCms({
      demoStops: trackingCms.demoStops.map((stop, index) => ({
        ...stop,
        trafficLevel: index >= 2 ? "high" : "medium",
        dropoffMinutes: Math.min(stop.dropoffMinutes + 1, 18),
      })),
      mapProviderStatus: "Trafico simulado alto: el ETA y la confianza se recalculan para las proximas paradas.",
    });
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        trafficScenario: "rush_hour",
        delayMinutes: state.demoSandbox.delayMinutes + 8,
        events: [
          createSandboxEvent({
            type: "traffic_simulated",
            label: "Trafico alto simulado",
            detail: "Se incrementa drop-off y trafico en las ultimas paradas.",
            tone: "warning",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    recalculateRouteEta(routes[0]?.id ?? "route-001");
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "simulate_traffic",
      module: "demo_sandbox",
      previousValue: "normal",
      newValue: "rush_hour",
    });
  }

  function simulateBlockedStreet() {
    updateTrackingCms({
      demoStops: trackingCms.demoStops.map((stop, index) => ({
        ...stop,
        trafficLevel: index >= 1 ? "high" : stop.trafficLevel,
      })),
      mapProviderStatus: "Calle bloqueada simulada en Belgrano: se crea incidente y se mueve el ETA hacia adelante.",
    });
    pauseRoute(routes[1]?.id ?? "route-002", "calle bloqueada");
    setCmsState((state) => ({
      ...state,
      incidents: [
        {
          id: `incident-${Date.now()}`,
          tenantId: "tenant-demo-latam",
          title: "Calle bloqueada en ruta demo",
          status: "open",
          severity: "high",
          ownerRole: "operations",
          routeId: "suggested-route-002",
          createdAt: new Date().toISOString(),
          detail: "Bloqueo simulado para demostrar replanificacion supervisada.",
        },
        ...state.incidents,
      ],
      demoSandbox: {
        ...state.demoSandbox,
        trafficScenario: "blocked_street",
        activeIncident: "Calle bloqueada en Belgrano",
        delayMinutes: state.demoSandbox.delayMinutes + 18,
        events: [
          createSandboxEvent({
            type: "street_blocked",
            label: "Calle bloqueada",
            detail: "Se genero incidencia y riesgo operativo alto para la ruta demo.",
            tone: "danger",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    requestApproval({
      action: "critical_reassignment",
      targetId: "suggested-route-002",
      title: "Reasignacion critica sugerida",
      detail: "Calle bloqueada: mover 3 paradas a una ruta de menor riesgo requiere aprobacion humana.",
    });
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "simulate_blocked_street",
      module: "demo_sandbox",
      previousValue: "clear",
      newValue: "blocked_street",
      result: "pending_approval",
    });
  }

  function simulateDelay() {
    pauseRoute(routes[0]?.id ?? "route-001", "incidente");
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        trafficScenario: "incident_delay",
        delayMinutes: state.demoSandbox.delayMinutes + 12,
        events: [
          createSandboxEvent({
            type: "delay_simulated",
            label: "Retraso operacional",
            detail: "Se agregaron 12 minutos mock de atraso y se recalculo ETA.",
            tone: "warning",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "simulate_delay",
      module: "demo_sandbox",
      previousValue: `${cmsState.demoSandbox.delayMinutes} min`,
      newValue: `${cmsState.demoSandbox.delayMinutes + 12} min`,
    });
  }

  function simulateDeliveryCompleted() {
    const routeId = routes[0]?.id ?? "route-001";
    markDelivered(routeId);
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        completedDeliveries: state.demoSandbox.completedDeliveries + 1,
        events: [
          createSandboxEvent({
            type: "delivery_completed",
            label: "Entrega completada",
            detail: "El driver demo marco una entrega completada y KPIs/ETA se actualizaron.",
            tone: "success",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "simulate_delivery_completed",
      module: "demo_sandbox",
      previousValue: "pending",
      newValue: routeId,
    });
  }

  function simulateDeliveryFailed() {
    const routeId = routes[0]?.id ?? "route-001";
    markFailed(routeId, "cliente ausente sandbox");
    setCmsState((state) => ({
      ...state,
      demoSandbox: {
        ...state.demoSandbox,
        failedDeliveries: state.demoSandbox.failedDeliveries + 1,
        events: [
          createSandboxEvent({
            type: "delivery_failed",
            label: "Entrega fallida",
            detail: "Se registro cliente ausente y el cumplimiento proyectado baja.",
            tone: "danger",
          }),
          ...state.demoSandbox.events,
        ].slice(0, 10),
      },
    }));
    appendAudit({
      tenantId: "tenant-demo-latam",
      action: "simulate_delivery_failed",
      module: "demo_sandbox",
      previousValue: "pending",
      newValue: routeId,
    });
  }

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="flex flex-wrap gap-2">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                section === item.id ? "bg-[#1d1d1f] text-white" : "bg-white text-[#424245] hover:bg-black/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {section === "overview" ? (
        <OverviewSection
          summary={summary}
          cmsState={cmsState}
          visibleUsers={visibleUsers}
          setSection={setSection}
          telegramStatus={telegramStatus}
        />
      ) : null}
      {section === "tenants" ? (
        <TenantsSection
          tenantForm={tenantForm}
          setTenantForm={setTenantForm}
          createTenant={createTenant}
          tenants={cmsState.tenants}
          toggleModule={toggleModule}
          setTenantStatus={setTenantStatus}
        />
      ) : null}
      {section === "users" ? (
        <UsersSection
          users={visibleUsers}
          tenants={cmsState.tenants}
          userForm={userForm}
          setUserForm={setUserForm}
          createUser={createUser}
          updateUser={updateUser}
        />
      ) : null}
      {section === "routes" ? (
        <RoutesSection routes={cmsState.suggestedRoutes} drivers={cmsState.drivers} updateSuggestedRoute={updateSuggestedRoute} />
      ) : null}
      {section === "drivers" ? (
        <DriversSection
          drivers={cmsState.drivers}
          tenants={cmsState.tenants}
          driverForm={driverForm}
          setDriverForm={setDriverForm}
          createDriver={createDriver}
        />
      ) : null}
      {section === "incidents" ? <IncidentsSection incidents={cmsState.incidents} updateIncident={updateIncident} /> : null}
      {section === "approvals" ? (
        <ApprovalsSection
          approvalPolicies={cmsState.approvalPolicies}
          approvalRequests={cmsState.approvalRequests}
          resolveApproval={resolveApproval}
          requestApproval={() =>
            requestApproval({
              action: "approve_suggested_routes",
              targetId: "suggested-route-001",
              title: "Aprobar Ruta Norte optimizada",
              detail: "Ruta sugerida por reglas predictivas. Requiere cierre humano antes de publicarse al driver.",
            })
          }
        />
      ) : null}
      {section === "audit" ? <AuditSection logs={cmsState.auditLogs} /> : null}
      {section === "telegram" ? (
        <TelegramSection
          telegram={cmsState.telegram}
          telegramStatus={telegramStatus}
          telegramBusy={telegramBusy}
          refreshTelegramStatus={refreshTelegramStatus}
          sendTelegramTest={sendTelegramTest}
        />
      ) : null}
      {section === "sandbox" ? (
        <SandboxSection
          sandbox={cmsState.demoSandbox}
          packagesCount={packages.length}
          toggleSandboxEnabled={toggleSandboxEnabled}
          generateSandbox={generateSandbox}
          resetSandbox={resetSandbox}
          startSandboxTruck={startSandboxTruck}
          pauseSandboxTruck={pauseSandboxTruck}
          setSandboxSpeed={setSandboxSpeed}
          simulateTraffic={simulateTraffic}
          simulateBlockedStreet={simulateBlockedStreet}
          simulateDelay={simulateDelay}
          simulateDeliveryCompleted={simulateDeliveryCompleted}
          simulateDeliveryFailed={simulateDeliveryFailed}
        />
      ) : null}

      <Card>
        <CardContent className="grid gap-3 p-4 text-sm font-semibold text-slate-600 md:grid-cols-3">
          <p>Frontend protegido: `/admin/*` requiere sesión admin.</p>
          <p>Backend protegido: `/api/cms/*` valida permiso `configure`.</p>
          <p>Cross-tenant guard: tenants fuera del scope quedan bloqueados.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function OverviewSection({
  summary,
  cmsState,
  visibleUsers,
  telegramStatus,
  setSection,
}: {
  summary: ReturnType<typeof getTenantSummary>;
  cmsState: ReturnType<typeof getDefaultEnterpriseCmsState>;
  visibleUsers: CmsUser[];
  telegramStatus: string;
  setSection: (section: CmsSection) => void;
}) {
  const activeRoutes = cmsState.suggestedRoutes.filter((route) => route.status !== "rejected").length;
  const openIncidents = cmsState.incidents.filter((incident) => incident.status !== "resolved").length;
  const activeDrivers = cmsState.drivers.filter((driver) => driver.status !== "offline").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Building2} label="Tenants" value={summary.total} detail={`${summary.active} activos`} />
        <MetricCard icon={Users} label="Usuarios" value={visibleUsers.length} detail="en scope permitido" />
        <MetricCard icon={Route} label="Rutas" value={activeRoutes} detail="sugeridas/activas" />
        <MetricCard icon={AlertTriangle} label="Incidencias" value={openIncidents} detail="abiertas o en revision" tone={openIncidents ? "amber" : "green"} />
        <MetricCard icon={Truck} label="Drivers" value={activeDrivers} detail="activos o pausados" />
        <MetricCard icon={GitBranch} label="Build" value={cmsState.buildStatus.status} detail={cmsState.buildStatus.detail} tone={cmsState.buildStatus.status === "passing" ? "green" : "amber"} />
        <MetricCard icon={Bell} label="Telegram" value={telegramStatus} detail="estado de env/server" tone={telegramStatus === "Configurado" ? "green" : "amber"} />
        <MetricCard icon={ShieldCheck} label="Audit logs" value={cmsState.auditLogs.length} detail="eventos recientes" tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Accesos de beta</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {sections.filter((item) => item.id !== "overview").map((item) => (
              <Button key={item.id} variant="outline" className="justify-start" onClick={() => setSection(item.id)}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas acciones auditadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cmsState.auditLogs.slice(0, 5).map((log) => (
              <AuditRow key={log.id} log={log} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TenantsSection({
  tenants,
  tenantForm,
  setTenantForm,
  createTenant,
  toggleModule,
  setTenantStatus,
}: {
  tenants: ReturnType<typeof getDefaultEnterpriseCmsState>["tenants"];
  tenantForm: typeof defaultTenantForm;
  setTenantForm: (form: typeof defaultTenantForm) => void;
  createTenant: (event: FormEvent<HTMLFormElement>) => void;
  toggleModule: (tenantId: string, moduleKey: CmsModuleKey) => void;
  setTenantStatus: (tenantId: string, status: TenantStatus) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Crear tenant demo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTenant} className="space-y-3">
            <Input value={tenantForm.name} placeholder="Nombre empresa" onChange={(event) => setTenantForm({ ...tenantForm, name: event.target.value })} />
            <select
              value={tenantForm.plan}
              onChange={(event) => setTenantForm({ ...tenantForm, plan: event.target.value })}
              className="h-12 w-full rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm font-semibold"
            >
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <Button className="w-full">Crear tenant</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Administración de tenants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="rounded-3xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-black text-[#1d1d1f]">{tenant.name}</p>
                    <Badge variant={tenant.status === "active" ? "delivered" : tenant.status === "suspended" ? "failed" : "pending"}>{tenant.status}</Badge>
                    <Badge variant="outline">{tenant.plan}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#6e6e73]">
                    {tenant.usersCount} usuarios · {tenant.metrics.activeRoutes} rutas · {tenant.metrics.slaAtRisk} SLA en riesgo
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setTenantStatus(tenant.id, tenant.status === "active" ? "inactive" : "active")}>
                    {tenant.status === "active" ? "Desactivar" : "Activar"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setTenantStatus(tenant.id, "suspended")}>
                    Suspender
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {cmsModuleKeys.map((moduleKey) => {
                  const enabled = tenant.enabledModules.includes(moduleKey);
                  return (
                    <button
                      key={moduleKey}
                      onClick={() => toggleModule(tenant.id, moduleKey)}
                      className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-left text-xs font-bold ${
                        enabled ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      <span>{cmsModuleLabels[moduleKey]}</span>
                      <Boxes className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function UsersSection({
  users,
  tenants,
  userForm,
  setUserForm,
  createUser,
  updateUser,
}: {
  users: CmsUser[];
  tenants: ReturnType<typeof getDefaultEnterpriseCmsState>["tenants"];
  userForm: typeof defaultUserForm;
  setUserForm: (form: typeof defaultUserForm) => void;
  createUser: (event: FormEvent<HTMLFormElement>) => void;
  updateUser: (userId: string, patch: Partial<CmsUser>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Crear usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="space-y-3">
            <Input value={userForm.name} placeholder="Nombre" onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} />
            <Input value={userForm.email} placeholder="email@empresa.com" onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
            <Input value={userForm.department} placeholder="Departamento" onChange={(event) => setUserForm({ ...userForm, department: event.target.value })} />
            <Select value={userForm.role} onChange={(role) => setUserForm({ ...userForm, role: role as CmsRole })} options={Object.entries(cmsRoleLabels)} />
            <Select value={userForm.tenantId} onChange={(tenantId) => setUserForm({ ...userForm, tenantId })} options={tenants.map((tenant) => [tenant.id, tenant.name])} />
            <Button className="w-full">Crear usuario</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#1d1d1f]">{user.name}</p>
                  <p className="text-sm font-semibold text-[#6e6e73]">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.tenantId} · {user.department}</p>
                </div>
                <Badge variant={user.status === "active" ? "delivered" : "failed"}>{user.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <Select value={user.role} onChange={(role) => updateUser(user.id, { role: role as CmsRole })} options={Object.entries(cmsRoleLabels)} />
                <Select value={user.tenantId} onChange={(tenantId) => updateUser(user.id, { tenantId })} options={tenants.map((tenant) => [tenant.id, tenant.name])} />
                <Button size="sm" variant="outline" onClick={() => updateUser(user.id, { status: user.status === "active" ? "suspended" : "active" })}>
                  {user.status === "active" ? "Suspender" : "Reactivar"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function RoutesSection({
  routes,
  drivers,
  updateSuggestedRoute,
}: {
  routes: CmsSuggestedRoute[];
  drivers: CmsDriver[];
  updateSuggestedRoute: (routeId: string, patch: Partial<CmsSuggestedRoute>, action?: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de rutas sugeridas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.map((route) => (
          <div key={route.id} className="rounded-3xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-black text-[#1d1d1f]">{route.name}</p>
                <p className="text-sm font-semibold text-[#6e6e73]">{route.zone} · {route.stops} paradas · cierre {route.estimatedCloseTime}</p>
                <p className="mt-1 text-xs text-slate-500">{route.notes}</p>
              </div>
              <Badge variant={route.status === "approved" ? "delivered" : route.status === "rejected" ? "failed" : "paused"}>{route.status}</Badge>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-5">
              <Input value={route.estimatedCloseTime} onChange={(event) => updateSuggestedRoute(route.id, { estimatedCloseTime: event.target.value, status: "modified" }, "modify_route")} />
              <Input type="number" value={route.stops} onChange={(event) => updateSuggestedRoute(route.id, { stops: Number(event.target.value), status: "modified" }, "modify_route")} />
              <Select value={route.driverId ?? ""} onChange={(driverId) => updateSuggestedRoute(route.id, { driverId, status: "modified" }, "assign_driver")} options={drivers.map((driver) => [driver.id, driver.name])} />
              <Button variant="success" onClick={() => updateSuggestedRoute(route.id, { status: "approved" }, "approve_route")}>Aprobar</Button>
              <Button variant="destructive" onClick={() => updateSuggestedRoute(route.id, { status: "rejected" }, "reject_route")}>Rechazar</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DriversSection({
  drivers,
  tenants,
  driverForm,
  setDriverForm,
  createDriver,
}: {
  drivers: CmsDriver[];
  tenants: ReturnType<typeof getDefaultEnterpriseCmsState>["tenants"];
  driverForm: typeof defaultDriverForm;
  setDriverForm: (form: typeof defaultDriverForm) => void;
  createDriver: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Crear driver</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createDriver} className="space-y-3">
            <Input value={driverForm.name} placeholder="Nombre" onChange={(event) => setDriverForm({ ...driverForm, name: event.target.value })} />
            <Input value={driverForm.phone} placeholder="Teléfono" onChange={(event) => setDriverForm({ ...driverForm, phone: event.target.value })} />
            <Input value={driverForm.vehicle} placeholder="Vehículo" onChange={(event) => setDriverForm({ ...driverForm, vehicle: event.target.value })} />
            <Select value={driverForm.tenantId} onChange={(tenantId) => setDriverForm({ ...driverForm, tenantId })} options={tenants.map((tenant) => [tenant.id, tenant.name])} />
            <Button className="w-full">Crear driver</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drivers.map((driver) => (
            <div key={driver.id} className="rounded-2xl border border-border p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-black text-[#1d1d1f]">{driver.name}</p>
                  <p className="text-sm font-semibold text-[#6e6e73]">{driver.phone} · {driver.vehicle}</p>
                  <p className="mt-1 text-xs text-slate-500">{driver.tenantId} · ruta {driver.assignedRouteId ?? "sin asignar"}</p>
                </div>
                <Badge variant={driver.status === "on_route" ? "in_progress" : driver.status === "paused" ? "paused" : "pending"}>{driver.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function IncidentsSection({ incidents, updateIncident }: { incidents: CmsIncident[]; updateIncident: (incidentId: string, patch: Partial<CmsIncident>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incidencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-[#1d1d1f]">{incident.title}</p>
                <p className="mt-1 text-sm text-[#6e6e73]">{incident.detail}</p>
                <p className="mt-1 text-xs text-slate-500">{incident.tenantId} · {incident.routeId ?? "sin ruta"} · {incident.createdAt}</p>
              </div>
              <Badge variant={incident.severity === "high" ? "failed" : incident.severity === "medium" ? "paused" : "pending"}>{incident.severity}</Badge>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Select value={incident.status} onChange={(status) => updateIncident(incident.id, { status: status as CmsIncident["status"] })} options={[["open", "Open"], ["in_review", "In review"], ["resolved", "Resolved"]]} />
              <Select value={incident.ownerRole} onChange={(ownerRole) => updateIncident(incident.id, { ownerRole: ownerRole as CmsRole })} options={Object.entries(cmsRoleLabels)} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ApprovalsSection({
  approvalPolicies,
  approvalRequests,
  resolveApproval,
  requestApproval,
}: {
  approvalPolicies: ReturnType<typeof getDefaultEnterpriseCmsState>["approvalPolicies"];
  approvalRequests: ReturnType<typeof getDefaultEnterpriseCmsState>["approvalRequests"];
  resolveApproval: (approvalId: string, approved: boolean) => void;
  requestApproval: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Human Approval Layer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="rounded-2xl bg-sky-50 p-4 text-sm font-semibold leading-6 text-sky-900">
            RoutePulse AI sugiere, estima y detecta riesgo. El operador humano aprueba o rechaza decisiones criticas antes de afectar la operacion.
          </p>
          <Button onClick={requestApproval}>
            <LockKeyhole className="h-4 w-4" />
            Crear solicitud demo
          </Button>
          <div className="space-y-3">
            {approvalPolicies.map((policy) => (
              <div key={policy.action} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#1d1d1f]">{policy.label}</p>
                    <p className="mt-1 text-sm font-medium text-[#6e6e73]">{policy.automationLimit}</p>
                  </div>
                  <Badge variant={policy.required ? "paused" : "pending"}>{policy.required ? "requerida" : "opcional"}</Badge>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Aprobadores: {policy.approverRoles.map((role) => cmsRoleLabels[role]).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue de aprobaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {approvalRequests.map((request) => (
            <div key={request.id} className="rounded-3xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[#1d1d1f]">{request.title}</p>
                  <p className="mt-1 text-sm font-medium text-[#6e6e73]">{request.detail}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {request.requestedBy} · {request.tenantId} · {request.requestedAt}
                  </p>
                </div>
                <Badge variant={request.status === "approved" ? "delivered" : request.status === "rejected" ? "failed" : "paused"}>
                  {request.status}
                </Badge>
              </div>
              {request.status === "pending" ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button variant="success" onClick={() => resolveApproval(request.id, true)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Aprobar humano
                  </Button>
                  <Button variant="destructive" onClick={() => resolveApproval(request.id, false)}>
                    <XCircle className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              ) : (
                <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">
                  {request.decisionReason} {request.decidedBy ? `Decision: ${request.decidedBy}.` : ""}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AuditSection({ logs }: { logs: ReturnType<typeof getDefaultEnterpriseCmsState>["auditLogs"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit logs recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {logs.map((log) => <AuditRow key={log.id} log={log} />)}
      </CardContent>
    </Card>
  );
}

function TelegramSection({
  telegram,
  telegramStatus,
  telegramBusy,
  refreshTelegramStatus,
  sendTelegramTest,
}: {
  telegram: ReturnType<typeof getDefaultEnterpriseCmsState>["telegram"];
  telegramStatus: string;
  telegramBusy: boolean;
  refreshTelegramStatus: () => void;
  sendTelegramTest: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Telegram Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricCard icon={Bell} label="Estado" value={telegramStatus} detail="TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID" tone={telegramStatus === "Configurado" ? "green" : "amber"} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Button disabled={telegramBusy} onClick={refreshTelegramStatus}><RefreshCw className="h-4 w-4" /> Validar env</Button>
            <Button disabled={telegramBusy} variant="outline" onClick={sendTelegramTest}>Test notification</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {telegram.events.map((event) => <Badge key={event} variant="outline">{event}</Badge>)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Últimos eventos enviados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {telegram.sentEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-border p-4">
              <div className="flex justify-between gap-3">
                <p className="font-black text-[#1d1d1f]">{event.event}</p>
                <Badge variant={event.status === "sent" ? "delivered" : event.status === "skipped" ? "paused" : "failed"}>{event.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-[#6e6e73]">{event.detail}</p>
              <p className="mt-1 text-xs text-slate-500">{event.timestamp}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SandboxSection({
  sandbox,
  packagesCount,
  toggleSandboxEnabled,
  generateSandbox,
  resetSandbox,
  startSandboxTruck,
  pauseSandboxTruck,
  setSandboxSpeed,
  simulateTraffic,
  simulateBlockedStreet,
  simulateDelay,
  simulateDeliveryCompleted,
  simulateDeliveryFailed,
}: {
  sandbox: ReturnType<typeof getDefaultEnterpriseCmsState>["demoSandbox"];
  packagesCount: number;
  toggleSandboxEnabled: () => void;
  generateSandbox: () => void;
  resetSandbox: () => void;
  startSandboxTruck: () => void;
  pauseSandboxTruck: () => void;
  setSandboxSpeed: (speedMultiplier: number) => void;
  simulateTraffic: () => void;
  simulateBlockedStreet: () => void;
  simulateDelay: () => void;
  simulateDeliveryCompleted: () => void;
  simulateDeliveryFailed: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-6">
        <MetricCard icon={CirclePlay} label="Estado demo" value={sandbox.status} detail={sandbox.enabled ? "activo" : "apagado"} tone={sandbox.enabled ? "green" : "amber"} />
        <MetricCard icon={Truck} label="Camion" value={sandbox.truckSimulation} detail={`velocidad x${sandbox.speedMultiplier}`} tone={sandbox.truckSimulation === "running" ? "green" : "amber"} />
        <MetricCard icon={AlertTriangle} label="Trafico" value={sandbox.trafficScenario} detail={`${sandbox.delayMinutes} min delay`} tone={sandbox.trafficScenario === "normal" ? "green" : "amber"} />
        <MetricCard icon={Route} label="Rutas ficticias" value={sandbox.routes} detail="sandbox" />
        <MetricCard icon={Truck} label="Drivers ficticios" value={sandbox.drivers} detail="sandbox" />
        <MetricCard icon={Users} label="Clientes demo" value={sandbox.customers} detail="sandbox" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard demo separado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl bg-sky-50 p-4 text-sm font-semibold leading-6 text-sky-900">
              Sandbox aislado: estas acciones modifican solo estado mock/local para demo comercial, no datos productivos.
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <SandboxMiniStat label="Paquetes mock" value={packagesCount} />
              <SandboxMiniStat label="Entregas demo OK" value={sandbox.completedDeliveries} />
              <SandboxMiniStat label="Fallidas demo" value={sandbox.failedDeliveries} />
            </div>
            <p className="text-sm font-semibold text-[#6e6e73]">Última generación: {sandbox.lastGeneratedAt ?? "sin datos"}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant={sandbox.enabled ? "warning" : "success"} onClick={toggleSandboxEnabled}>
                <CirclePlay className="h-4 w-4" />
                {sandbox.enabled ? "Desactivar demo" : "Activar demo"}
              </Button>
              <Button onClick={generateSandbox}>
                <CirclePlay className="h-4 w-4" />
                Generar datos demo
              </Button>
              <Button variant="outline" onClick={resetSandbox}>
                <RefreshCw className="h-4 w-4" />
                Reiniciar demo
              </Button>
              <Button variant="outline" onClick={() => setSandboxSpeed(sandbox.speedMultiplier >= 2 ? 1 : sandbox.speedMultiplier + 0.5)}>
                <Activity className="h-4 w-4" />
                Velocidad x{sandbox.speedMultiplier >= 2 ? "1.0" : (sandbox.speedMultiplier + 0.5).toFixed(1)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulación operador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={startSandboxTruck}>
                <CirclePlay className="h-4 w-4" />
                Iniciar camión
              </Button>
              <Button variant="warning" onClick={pauseSandboxTruck}>
                <RefreshCw className="h-4 w-4" />
                Pausar simulación
              </Button>
              <Button variant="outline" onClick={simulateTraffic}>
                <MapPinned className="h-4 w-4" />
                Simular tráfico
              </Button>
              <Button variant="destructive" onClick={simulateBlockedStreet}>
                <AlertTriangle className="h-4 w-4" />
                Calle bloqueada
              </Button>
              <Button variant="outline" onClick={simulateDelay}>
                <ClockIcon />
                Simular retraso
              </Button>
              <Button variant="success" onClick={simulateDeliveryCompleted}>
                <CheckCircle2 className="h-4 w-4" />
                Entrega completada
              </Button>
              <Button variant="destructive" onClick={simulateDeliveryFailed}>
                <XCircle className="h-4 w-4" />
                Entrega fallida
              </Button>
              <Button variant="outline" disabled>
                <Workflow className="h-4 w-4" />
                ORS/MapLibre next
              </Button>
            </div>
            {sandbox.activeIncident ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                Incidente activo: {sandbox.activeIncident}
              </div>
            ) : null}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
              Guardrail: sugerencias de reasignación, cancelaciones y cambios críticos quedan en aprobación humana.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline de eventos sandbox</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sandbox.events.map((event) => (
            <div key={event.id} className="grid gap-3 rounded-2xl border border-border p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div className={`h-3 w-3 rounded-full ${event.tone === "success" ? "bg-emerald-500" : event.tone === "danger" ? "bg-red-500" : event.tone === "warning" ? "bg-amber-500" : "bg-sky-500"}`} />
              <div>
                <p className="font-black text-[#1d1d1f]">{event.label}</p>
                <p className="mt-1 text-sm font-medium text-[#6e6e73]">{event.detail}</p>
              </div>
              <p className="text-xs font-semibold text-slate-500">{event.timestamp}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SandboxMiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <p className="text-xs font-bold uppercase text-[#6e6e73]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#1d1d1f]">{value}</p>
    </div>
  );
}

function ClockIcon() {
  return <Activity className="h-4 w-4" />;
}

function AuditRow({ log }: { log: ReturnType<typeof getDefaultEnterpriseCmsState>["auditLogs"][number] }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-[#1d1d1f]">{log.action}</p>
        <Badge variant={log.result === "success" ? "delivered" : log.result === "pending_approval" ? "paused" : log.result === "blocked" ? "pending" : "failed"}>{log.result}</Badge>
      </div>
      <p className="mt-1 text-xs font-semibold text-[#6e6e73]">{log.actor} · {cmsRoleLabels[log.role]} · {log.module} · {log.tenantId}</p>
      <p className="mt-2 text-xs text-slate-500">{log.previousValue} -&gt; {log.newValue}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "slate" }: { icon: LucideIcon; label: string; value: string | number; detail: string; tone?: "slate" | "green" | "amber" | "blue" }) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
  }[tone];

  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-[#6e6e73]">{label}</p>
        <p className="mt-1 text-2xl font-black text-[#1d1d1f]">{value}</p>
        <p className="mt-1 text-xs font-semibold text-[#86868b]">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] px-3 text-sm font-semibold text-[#1d1d1f]"
    >
      <option value="" disabled>Seleccionar</option>
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>{label}</option>
      ))}
    </select>
  );
}
