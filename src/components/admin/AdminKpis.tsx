"use client";

import { Activity, AlertCircle, BarChart3, Clock, Gauge, PackageCheck, Percent, Timer, TrendingUp, Truck, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateAtRiskPackages, calculateOperationsKpis, calculateRouteStats } from "@/lib/kpiCalculations";
import { riskToBadgeRisk } from "@/lib/etaCalculations";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";

export function AdminKpis() {
  const data = useRoutePulseStore(
    useShallow((state) => ({
      company: state.company,
      warehouse: state.warehouse,
      settings: state.settings,
      routes: state.routes,
      packages: state.packages,
      drivers: state.drivers,
      vehicles: state.vehicles,
      users: state.users,
      zones: state.zones,
      trackingCms: state.trackingCms,
      incidents: state.incidents,
    })),
  );
  const kpis = calculateOperationsKpis(data);
  const routeRows = data.routes.map((route) => ({
    route,
    stats: calculateRouteStats(route, data.packages, data.settings),
    driver: data.drivers.find((driver) => driver.id === route.driverId),
  }));
  const maxDelivered = Math.max(...routeRows.map((item) => item.stats.delivered), 1);

  return (
    <AdminShell>
      <PageHeader
        eyebrow="KPIs predictivos"
        title="Cumplimiento, SLA y riesgo"
        description="No solo historico: ETA, pausas, drop-off por zona y confianza proyectan como cerrara el dia."
      />
      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Cumplimiento entregas" value={formatPercent(kpis.completionRate)} icon={Percent} tone="green" />
          <StatCard label="Cumplimiento proyectado" value={formatPercent(kpis.projectedSLA)} icon={Gauge} tone="blue" />
          <StatCard label="Tasa de fallos" value={formatPercent(kpis.failureRate)} icon={AlertCircle} tone={kpis.failureRate > 8 ? "red" : "amber"} />
          <StatCard label="Paquetes por driver" value={kpis.averagePackagesPerDriver.toFixed(1)} icon={Users} tone="slate" />
          <StatCard label="Entregados por hora" value={kpis.deliveredPerHour.toFixed(1)} icon={TrendingUp} tone="blue" />
          <StatCard label="Rutas en riesgo" value={kpis.routesAtRisk} icon={Activity} tone={kpis.routesAtRisk ? "amber" : "green"} />
          <StatCard label="SLA objetivo" value={formatPercent(data.settings.targetSlaPercent)} icon={PackageCheck} tone="slate" />
          <StatCard label="SLA proyectado" value={formatPercent(kpis.projectedSLA)} icon={PackageCheck} tone="green" />
          <StatCard label="ETA cierre operativo" value={kpis.operationalCloseEstimate} icon={Clock} tone="amber" />
          <StatCard label="Drop-off promedio" value={`${kpis.averageDropoffTime.toFixed(1)} min`} icon={Timer} tone="slate" />
          <StatCard label="Rutas activas" value={kpis.activeRoutes} icon={Truck} tone="blue" />
          <StatCard label="ETA confianza promedio" value={formatPercent(kpis.etaConfidenceAverage)} icon={BarChart3} tone="blue" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>KPIs visuales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <KpiProgress label="Cumplimiento de entregas" value={kpis.completionRate} tone="green" />
              <KpiProgress label="Cumplimiento proyectado" value={kpis.projectedSLA} tone="blue" />
              <KpiProgress label="SLA objetivo" value={data.settings.targetSlaPercent} tone="green" />
              <KpiProgress label="Tasa de fallos" value={kpis.failureRate} tone={kpis.failureRate > 8 ? "red" : "amber"} />
              <KpiProgress label="Confianza ETA promedio" value={kpis.etaConfidenceAverage} tone="blue" />
              <KpiProgress label="Cierre contra objetivo" value={kpis.operationalCloseEstimate <= data.settings.targetCloseTime ? 92 : 68} tone="amber" />
              <KpiProgress label="Utilizacion por unidad" value={(kpis.averagePackagesPerDriver / data.settings.averageUnitCapacity) * 100} tone="blue" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productividad por driver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {routeRows.map(({ route, stats, driver }) => (
                  <div key={route.id} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_1.5fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{driver?.name}</p>
                      <p className="text-xs text-slate-500">
                        {route.id} · {route.zone}
                      </p>
                    </div>
                    <div>
                      <Progress
                        value={kpis.driverProductivity.find((item) => item.routeId === route.id)?.productivityScore ?? stats.progress}
                        tone={stats.risk === "risk_high" ? "red" : stats.risk === "risk_medium" ? "amber" : "green"}
                      />
                      <div className="mt-2 flex justify-between text-xs text-slate-500">
                        <span>{stats.delivered} entregados · {stats.pauseMinutes} min pausa</span>
                        <span>
                          {formatPercent(kpis.driverProductivity.find((item) => item.routeId === route.id)?.productivityScore ?? stats.progress)} productividad
                        </span>
                      </div>
                    </div>
                    <StatusBadge type="risk" status={stats.risk} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Drop-off promedio por zona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.zones.map((zone) => {
                const zonePackages = data.packages.filter((item) => item.zone === zone.name);
                const average = zonePackages.reduce((sum, item) => sum + item.dropoffTimeMinutes, 0) / Math.max(zonePackages.length, 1);
                return (
                  <div key={zone.name} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900">{zone.name}</span>
                      <span className="font-bold text-slate-950">{average.toFixed(1)} min</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Trafico x{zone.trafficFactor} · parking {zone.parkingDifficulty}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rutas por riesgo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {routeRows.map(({ route, stats }) => (
                <div key={route.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{route.id}</p>
                    <p className="text-xs text-slate-500">Cierre {stats.estimatedCloseTime} · delay {stats.delayMinutes} min</p>
                  </div>
                  <StatusBadge type="risk" status={riskToBadgeRisk(stats.operationalRisk)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Entregas en riesgo por zona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.zones.map((zone) => {
                const count = calculateAtRiskPackages(data.packages.filter((item) => item.zone === zone.name));
                return (
                  <div key={zone.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-semibold text-slate-900">{zone.name}</span>
                    <span className="text-sm font-bold text-slate-950">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Grafico de entregas por ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid min-h-[220px] grid-cols-3 items-end gap-5 rounded-lg bg-slate-50 p-5">
              {routeRows.map(({ route, stats }) => (
                <div key={route.id} className="flex h-full flex-col justify-end gap-3">
                  <div
                    className="rounded-t-md bg-sky-600"
                    style={{ height: `${Math.max((stats.delivered / maxDelivered) * 100, 8)}%` }}
                  />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900">{route.id}</p>
                    <p className="text-xs text-slate-500">{stats.delivered} entregas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function KpiProgress({ label, value, tone }: { label: string; value: number; tone: "blue" | "green" | "amber" | "red" }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-bold text-slate-950">{formatPercent(value)}</span>
      </div>
      <Progress value={value} tone={tone} />
    </div>
  );
}
