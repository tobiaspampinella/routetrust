"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Repeat2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { RouteMapPlaceholder } from "@/components/shared/RouteMapPlaceholder";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { etaConfidenceLabels, operationalRiskLabels, routeStatusLabels } from "@/components/shared/status-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { riskToBadgeRisk } from "@/lib/etaCalculations";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";

export function AdminRoutes() {
  const [selectedRouteId, setSelectedRouteId] = useState("route-001");
  const routes = useRoutePulseStore((state) => state.routes);
  const packages = useRoutePulseStore((state) => state.packages);
  const drivers = useRoutePulseStore((state) => state.drivers);
  const vehicles = useRoutePulseStore((state) => state.vehicles);
  const settings = useRoutePulseStore((state) => state.settings);
  const recalculateRouteEta = useRoutePulseStore((state) => state.recalculateRouteEta);
  const markRouteRisk = useRoutePulseStore((state) => state.markRouteRisk);
  const mockReassignRoute = useRoutePulseStore((state) => state.mockReassignRoute);

  const rows = useMemo(
    () =>
      routes.map((route) => ({
        route,
        stats: calculateRouteStats(route, packages, settings),
        driver: drivers.find((driver) => driver.id === route.driverId),
        vehicle: vehicles.find((vehicle) => vehicle.id === route.vehicleId),
      })),
    [drivers, packages, routes, settings, vehicles],
  );

  const selected = rows.find((item) => item.route.id === selectedRouteId) ?? rows[0];
  const selectedPackages = selected ? getPackagesForRoute(selected.route.id, packages) : [];

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Control de rutas"
        title="Rutas del dia"
        description="Vista operativa por driver, unidad, avance, riesgo y cierre estimado."
      />
      <div className="space-y-6 p-5 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Panel de rutas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Route ID</th>
                    <th className="px-3 py-3">Driver</th>
                    <th className="px-3 py-3">Unidad</th>
                    <th className="px-3 py-3">Zona</th>
                    <th className="px-3 py-3">Riesgo operativo</th>
                    <th className="px-3 py-3">Asignados</th>
                    <th className="px-3 py-3">Entregados</th>
                    <th className="px-3 py-3">Pendientes</th>
                    <th className="px-3 py-3">Fallidos</th>
                    <th className="px-3 py-3">Avance</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Cierre estimado</th>
                    <th className="px-3 py-3">SLA proyectado</th>
                    <th className="px-3 py-3">Pausas</th>
                    <th className="px-3 py-3">Delay</th>
                    <th className="px-3 py-3">Drop-off</th>
                    <th className="px-3 py-3">Proxima parada</th>
                    <th className="px-3 py-3">Sugerencia</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ route, stats, driver, vehicle }) => (
                    <tr key={route.id} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-semibold text-slate-950">{route.id}</td>
                      <td className="px-3 py-3 text-slate-700">{driver?.name}</td>
                      <td className="px-3 py-3 text-slate-700">{vehicle?.plate}</td>
                      <td className="px-3 py-3 text-slate-700">{route.zone}</td>
                      <td className="px-3 py-3">
                        <StatusBadge type="risk" status={riskToBadgeRisk(stats.operationalRisk)} />
                      </td>
                      <td className="px-3 py-3">{stats.total}</td>
                      <td className="px-3 py-3">{stats.delivered}</td>
                      <td className="px-3 py-3">{stats.pending + stats.inProgress}</td>
                      <td className="px-3 py-3">{stats.failed}</td>
                      <td className="px-3 py-3">
                        <div className="min-w-28">
                          <Progress value={stats.progress} tone={stats.risk === "risk_high" ? "red" : stats.risk === "risk_medium" ? "amber" : "green"} />
                          <p className="mt-1 text-xs text-slate-500">{formatPercent(stats.progress)}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge type="route" status={route.status} />
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">{stats.estimatedCloseTime}</td>
                      <td className="px-3 py-3">
                        {formatPercent(stats.projectedSlaCompliance)}
                      </td>
                      <td className="px-3 py-3">{stats.pauseMinutes} min</td>
                      <td className="px-3 py-3">{stats.delayMinutes} min</td>
                      <td className="px-3 py-3">{stats.averageDropoffMinutes.toFixed(1)} min</td>
                      <td className="px-3 py-3 text-slate-700">
                        {stats.currentStop ? `#${stats.currentStop.sequence} ${stats.currentStop.customerName}` : "Sin pendiente"}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        {stats.suggestedReassignments[0] ?? "Sin accion sugerida"}
                      </td>
                      <td className="px-3 py-3">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRouteId(route.id)}>
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {selected ? (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Detalle {selected.route.id}</CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {selected.driver?.name} · {selected.vehicle?.plate} · {routeStatusLabels[selected.route.status]} · cierre {selected.stats.estimatedCloseTime}
                    </p>
                  </div>
                  <StatusBadge type="risk" status={riskToBadgeRisk(selected.stats.operationalRisk)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <RouteMapPlaceholder packages={selectedPackages} />
                <div className="grid gap-3 sm:grid-cols-4">
                  <RouteDetailMetric label="SLA proyectado" value={formatPercent(selected.stats.projectedSlaCompliance)} />
                  <RouteDetailMetric label="Pausas acumuladas" value={`${selected.stats.pauseMinutes} min`} />
                  <RouteDetailMetric label="Delay acumulado" value={`${selected.stats.delayMinutes} min`} />
                  <RouteDetailMetric label="Confianza ETA" value={formatPercent(selected.stats.etaConfidenceAverage)} />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <Button variant="outline" onClick={() => mockReassignRoute(selected.route.id)}>
                    <Repeat2 className="h-4 w-4" />
                    Reasignar
                  </Button>
                  <Button variant="warning" onClick={() => markRouteRisk(selected.route.id, "risk_high")}>
                    <AlertTriangle className="h-4 w-4" />
                    Marcar riesgo
                  </Button>
                  <Button variant="secondary" onClick={() => recalculateRouteEta(selected.route.id)}>
                    <RefreshCw className="h-4 w-4" />
                    Recalcular ETA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paradas asignadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[560px] overflow-auto pr-2">
                  <div className="space-y-3">
                    {selectedPackages.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                                {item.sequence}
                              </span>
                              <p className="truncate text-sm font-semibold text-slate-950">{item.customerName}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{item.address}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {item.locality} · ref: {item.addressReference}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              ETA {item.estimatedArrivalWindowStart} - {item.estimatedArrivalWindowEnd} · {item.trackingCode}
                              {item.failedReason ? ` · ${item.failedReason}` : ""}
                            </p>
                            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-4">
                              <span>Paradas antes: {item.stopsBeforeCustomer}</span>
                              <span>Drop-off: {item.dropoffTimeMinutes} min</span>
                              <span>Confianza: {etaConfidenceLabels[item.etaConfidence]}</span>
                              <span>Riesgo: {operationalRiskLabels[item.riskLevel]}</span>
                            </div>
                          </div>
                          <StatusBadge type="package" status={item.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

function RouteDetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
