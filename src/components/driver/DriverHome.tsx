"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock3, Package, PackageCheck, PackageX, Play, Route } from "lucide-react";
import { DriverShell } from "@/components/driver/DriverShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { etaConfidenceLabels } from "@/components/shared/status-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { riskToBadgeRisk } from "@/lib/etaCalculations";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";

export function DriverHome() {
  const currentUser = useRoutePulseStore((state) => state.currentUser);
  const routes = useRoutePulseStore((state) => state.routes);
  const packages = useRoutePulseStore((state) => state.packages);
  const settings = useRoutePulseStore((state) => state.settings);
  const startRoute = useRoutePulseStore((state) => state.startRoute);
  const resumeRoute = useRoutePulseStore((state) => state.resumeRoute);
  const route = routes.find((item) => item.id === currentUser?.assignedRouteId);
  const routePackages = route ? getPackagesForRoute(route.id, packages) : [];
  const pendingRoutePackages = routePackages.filter((item) => item.status === "pending" || item.status === "in_progress");
  const stats = route ? calculateRouteStats(route, packages, settings) : null;
  const currentStop = stats?.currentStop;
  const remainingStops = routePackages.filter((item) => item.status === "pending" || item.status === "in_progress").length;
  const routeStateText = stats?.operationalRisk === "high" ? "atrasada" : stats?.operationalRisk === "medium" ? "en riesgo" : "en tiempo";

  return (
    <DriverShell>
      <div className="space-y-5 p-5">
        <section className="rounded-xl bg-slate-950 p-5 text-white">
          <p className="text-sm text-slate-300">Driver</p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal">{currentUser?.name}</h1>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-white/10 p-4">
            <div>
              <p className="text-sm text-slate-300">Ruta asignada</p>
              <p className="text-xl font-bold">{route?.id ?? "Sin ruta"}</p>
            </div>
            {route ? <StatusBadge type="route" status={route.status} /> : null}
          </div>
        </section>

        {route && stats ? (
          <>
            <Card>
              <CardContent className="space-y-5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{route.zone} · {routeStateText}</p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">{formatPercent(stats.progress)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                    <Route className="h-6 w-6" />
                  </div>
                </div>
                <Progress value={stats.progress} tone={stats.risk === "risk_high" ? "red" : stats.risk === "risk_medium" ? "amber" : "green"} />
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric icon={Package} label="Totales" value={stats.total} />
                  <MiniMetric icon={PackageCheck} label="Entregados" value={stats.delivered} />
                  <MiniMetric icon={Package} label="Pendientes" value={stats.pending + stats.inProgress} />
                  <MiniMetric icon={PackageX} label="Fallidos" value={stats.failed} />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                    <Clock3 className="h-4 w-4" />
                    Cierre estimado
                  </span>
                  <span className="font-bold text-slate-950">{stats.estimatedCloseTime}</span>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-slate-500">Próxima parada</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-950">
                        {currentStop ? `#${currentStop.sequence} ${currentStop.customerName}` : "Sin paradas pendientes"}
                      </p>
                      {currentStop ? (
                        <p className="mt-1 text-xs text-slate-500">
                          ETA {currentStop.estimatedArrivalWindowStart} - {currentStop.estimatedArrivalWindowEnd} · {currentStop.locality}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge type="risk" status={riskToBadgeRisk(stats.operationalRisk)} />
                  </div>
                  {currentStop ? (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <span className="rounded-md bg-slate-50 p-2">{remainingStops} restantes</span>
                      <span className="rounded-md bg-slate-50 p-2">{currentStop.dropoffTimeMinutes} min drop-off</span>
                      <span className="rounded-md bg-slate-50 p-2">ETA {etaConfidenceLabels[currentStop.etaConfidence]}</span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {route.status === "paused" ? (
                <Button size="lg" variant="warning" onClick={() => resumeRoute(route.id)}>
                  <Play className="h-5 w-5" />
                  Reanudar ruta
                </Button>
              ) : route.status === "scheduled" ? (
                <Button size="lg" onClick={() => startRoute(route.id)}>
                  <Play className="h-5 w-5" />
                  Iniciar ruta
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href="/driver/route">
                    Continuar ruta
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href="/driver/route">
                  Ver ruta
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-bold text-slate-950">Próximas paradas</p>
                <div className="mt-4 space-y-3">
                  {pendingRoutePackages.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          #{item.sequence} · {item.customerName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.estimatedArrivalWindowStart} - {item.estimatedArrivalWindowEnd} · {item.stopsBeforeCustomer} antes
                        </p>
                      </div>
                      <StatusBadge type="package" status={item.status} />
                    </div>
                  ))}
                  {pendingRoutePackages.length === 0 ? (
                    <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">No quedan paradas pendientes.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-slate-500">No hay ruta asignada para este usuario demo.</CardContent>
          </Card>
        )}
      </div>
    </DriverShell>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
