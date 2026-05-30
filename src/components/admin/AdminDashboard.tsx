"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  PackageX,
  Radar,
  Sparkles,
  Route,
  Truck,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { RouteMapPlaceholder } from "@/components/shared/RouteMapPlaceholder";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateOperationsKpis, calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { generateOperationalInsights } from "@/lib/operationalInsights";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";

export function AdminDashboard() {
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
    })),
  );
  const kpis = calculateOperationsKpis(data);
  const insights = generateOperationalInsights(data.routes, data.packages, data.drivers, data.settings);
  const routeStats = data.routes.map((route) => ({
    route,
    stats: calculateRouteStats(route, data.packages, data.settings),
    driver: data.drivers.find((driver) => driver.id === route.driverId),
  }));
  const routesOnTime = routeStats.filter((item) => item.stats.risk === "risk_low").length;
  const riskRoutes = routeStats.filter((item) => item.stats.risk !== "risk_low").length;
  const primaryRoute = routeStats[0]?.route;
  const primaryPackages = primaryRoute ? getPackagesForRoute(primaryRoute.id, data.packages) : [];

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
