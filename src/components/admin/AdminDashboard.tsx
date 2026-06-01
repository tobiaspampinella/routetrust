"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  Bug,
  CheckCircle2,
  Clock3,
  Map,
  Package,
  PackageCheck,
  PackageX,
  Radar,
  Sparkles,
  Route,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { RouteMapPlaceholder } from "@/components/shared/RouteMapPlaceholder";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateOperationsKpis, calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { generateOperationalInsights } from "@/lib/operationalInsights";
import { betaCoreModules, buildProjectIntelligenceReport } from "@/lib/projectIntelligence";
import { APP_VERSION } from "@/lib/version";
import { getDefaultEnterpriseCmsState } from "@/services/cms/cmsService";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";
import type { BugReport } from "@/lib/bugReporting";

export function AdminDashboard() {
  const [recentBugs, setRecentBugs] = useState<BugReport[]>([]);
  const data = useRoutePulseStore(
    useShallow((state) => ({
      company: state.company,
      settings: state.settings,
      routes: state.routes,
      packages: state.packages,
      drivers: state.drivers,
      vehicles: state.vehicles,
      warehouse: state.warehouse,
      users: state.users,
      zones: state.zones,
      trackingCms: state.trackingCms,
      incidents: state.incidents,
    })),
  );
  const cmsState = getDefaultEnterpriseCmsState();
  const kpis = calculateOperationsKpis(data);
  const insights = generateOperationalInsights(data.routes, data.packages, data.drivers, data.settings);
  const openIncidents = data.incidents.filter((incident) => incident.status !== "resolved");
  const pendingApprovals = cmsState.approvalRequests.filter((request) => request.status === "pending");
  const betaReport = buildProjectIntelligenceReport({
    appVersion: APP_VERSION,
    buildStatus: openIncidents.some((incident) => incident.severity === "high") ? "warning" : "ready",
    modules: betaCoreModules,
    risks: openIncidents.some((incident) => incident.severity === "high")
      ? ["High severity incident open in demo operations."]
      : ["No production database yet; beta uses local state."],
  });
  const routeStats = data.routes.map((route) => ({
    route,
    stats: calculateRouteStats(route, data.packages, data.settings),
    driver: data.drivers.find((driver) => driver.id === route.driverId),
  }));
  const routesOnTime = routeStats.filter((item) => item.stats.risk === "risk_low").length;
  const riskRoutes = routeStats.filter((item) => item.stats.risk !== "risk_low").length;
  const primaryRoute = routeStats[0]?.route;
  const primaryPackages = primaryRoute ? getPackagesForRoute(primaryRoute.id, data.packages) : [];

  useEffect(() => {
    let active = true;

    async function loadRecentBugs() {
      const response = await fetch("/api/bugs", { credentials: "include" }).catch(() => null);
      const payload = response?.ok ? ((await response.json().catch(() => null)) as { reports?: BugReport[] } | null) : null;
      if (!active || !payload?.reports) return;
      setRecentBugs(payload.reports.slice(0, 5));
    }

    loadRecentBugs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Control Tower Lite"
        title="Última milla LatAm"
        description={`ETA predictivo, riesgo operativo y KPIs vivos para operadores logísticos. ${data.settings.operatingZone} · cierre objetivo ${data.settings.targetCloseTime}`}
      />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Paquetes del día" value={kpis.totalPackages} icon={Package} tone="slate" />
          <StatCard label="Entregados" value={kpis.deliveredPackages} icon={PackageCheck} tone="green" />
          <StatCard label="Pendientes" value={kpis.pendingPackages} icon={Boxes} tone="blue" />
          <StatCard label="Fallidos" value={kpis.failedPackages} icon={PackageX} tone="red" />
          <StatCard label="Cumplimiento" value={formatPercent(kpis.completionRate)} icon={CheckCircle2} tone="green" />
          <StatCard label="Rutas activas" value={kpis.activeRoutes} icon={Route} tone="blue" />
          <StatCard label="Drivers activos" value={kpis.activeDrivers} icon={Users} tone="slate" />
          <StatCard label="SLA proyectado" value={formatPercent(kpis.projectedSLA)} icon={Radar} tone="green" />
          <StatCard label="Cierre operativo estimado" value={kpis.operationalCloseEstimate} icon={Clock3} tone="amber" />
          <StatCard label="Rutas en riesgo" value={kpis.routesAtRisk} icon={AlertTriangle} tone={riskRoutes ? "amber" : "green"} />
          <StatCard label="Paquetes en riesgo" value={kpis.atRiskPackages} icon={PackageX} tone={kpis.atRiskPackages ? "red" : "green"} />
          <StatCard label="Drop-off promedio" value={`${kpis.averageDropoffTime.toFixed(1)} min`} icon={Truck} tone="slate" />
          <StatCard label="Tiempo perdido por pausas" value={`${kpis.pauseImpactMinutes} min`} icon={Clock3} tone={kpis.pauseImpactMinutes ? "amber" : "green"} />
          <StatCard label="Confianza ETA promedio" value={formatPercent(kpis.etaConfidenceAverage)} icon={Sparkles} tone="blue" />
          <StatCard label="Reasignaciones sugeridas" value={kpis.suggestedReassignments.length} icon={Route} tone={kpis.suggestedReassignments.length ? "amber" : "green"} />
          <StatCard
            label="Paquetes por unidad"
            value={kpis.averagePackagesPerDriver.toFixed(1)}
            detail={`Capacidad promedio ${data.settings.averageUnitCapacity}`}
            icon={Truck}
            tone="slate"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CEO beta overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <BetaReadinessTile
                icon={ShieldCheck}
                label="Core beta"
                value={`${betaReport.implementedModules}/${betaReport.modules.filter((module) => module.status !== "excluded").length}`}
                detail={`${betaReport.partialModules} partial`}
                tone="green"
              />
              <BetaReadinessTile
                icon={Clock3}
                label="Human approval"
                value={pendingApprovals.length}
                detail="pending decisions"
                tone={pendingApprovals.length ? "amber" : "green"}
              />
              <BetaReadinessTile
                icon={AlertTriangle}
                label="Incidents"
                value={openIncidents.length}
                detail="open operational"
                tone={openIncidents.length ? "amber" : "green"}
              />
              <BetaReadinessTile
                icon={Radar}
                label="Audit logs"
                value={cmsState.auditLogs.length}
                detail="local events"
                tone="blue"
              />
              <BetaReadinessTile
                icon={Bell}
                label="Telegram bot"
                value="Basic"
                detail="project intelligence"
                tone="blue"
              />
              <BetaReadinessTile
                icon={Map}
                label="Maps"
                value="Fallback"
                detail="mock ready"
                tone="green"
              />
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <Bug className="h-4 w-4" />
                  Bug assistant
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Assistant intake now persists locally, captures page context, classifies severity, and routes to real agent owners.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
                  <Route className="h-4 w-4" />
                  Route simulation engine
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Contrato puro activo para snapshot demo, eventos auditables y fallback map-ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent triage queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBugs.length === 0 ? (
                <div className="rounded-lg border border-border bg-slate-50 p-4 text-sm text-slate-500">
                  No persisted tickets yet. The queue will populate after the assistant creates durable reports.
                </div>
              ) : (
                recentBugs.map((bug) => (
                  <div key={bug.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{bug.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {bug.id} · {bug.pageContext?.pageLabel || bug.routePath || "Unknown page"}
                        </p>
                      </div>
                      <StatusBadge type="risk" status={bug.severity === "P0" || bug.severity === "P1" ? "risk_high" : bug.severity === "P2" ? "risk_medium" : "risk_low"} />
                    </div>
                    <p className="mt-3 text-xs text-slate-600">
                      {bug.category} · {bug.status} · {bug.assignedAgents.join(", ")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <CardHeader>
              <CardTitle>Resumen operativo del día</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-slate-50 p-4">
                <p className="text-base font-semibold text-slate-950">Control Tower Lite: la operación lleva {formatPercent(kpis.completionRate)} de avance.</p>
                <p className="mt-2 text-sm text-slate-600">
                  {routesOnTime} rutas están dentro del tiempo estimado. {riskRoutes} ruta(s) presentan riesgo operativo. El cierre operativo
                  estimado es {kpis.operationalCloseEstimate} y el cumplimiento proyectado es {formatPercent(kpis.projectedSLA)}.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {routeStats.map(({ route, stats, driver }) => (
                  <div key={route.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">{route.id}</p>
                      <StatusBadge type="risk" status={stats.risk} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{driver?.name}</p>
                    <Progress className="mt-4" value={stats.progress} tone={stats.risk === "risk_high" ? "red" : stats.risk === "risk_medium" ? "amber" : "green"} />
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{formatPercent(stats.progress)}</span>
                      <span>ETA cierre {stats.estimatedCloseTime}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Pausas {stats.pauseMinutes} min · Drop-off {stats.averageDropoffMinutes.toFixed(1)} min
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vista operativa de ruta</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteMapPlaceholder packages={primaryPackages} compact />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
          <CardTitle>Insights operativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.map((insight) => (
                <div key={insight} className="rounded-lg border border-sky-100 bg-sky-50/70 p-4 text-sm font-medium text-slate-800">
                  {insight}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function BetaReadinessTile({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
  tone: "green" | "amber" | "blue";
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
    </div>
  );
}
