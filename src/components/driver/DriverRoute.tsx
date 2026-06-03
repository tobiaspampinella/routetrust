"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, MapPin, PackageCheck, Pause, Play, XCircle } from "lucide-react";
import { DriverShell } from "@/components/driver/DriverShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { etaConfidenceLabels, operationalRiskLabels } from "@/components/shared/status-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { riskToBadgeRisk } from "@/lib/etaCalculations";
import { formatPercent } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { DriverMap } from "@/components/customer/DriverMap";

const failReasons = ["cliente ausente", "direccion incorrecta", "acceso imposible", "rechazo", "otro"];
const pauseReasons = ["comida", "bano", "combustible", "incidente", "otro"];
const incidentReasons = ["calle bloqueada", "cliente reporta problema", "unidad con falla", "zona insegura", "otro"];

export function DriverRoute() {
  const [failOpen, setFailOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const currentUser = useRoutePulseStore((state) => state.currentUser);
  const routes = useRoutePulseStore((state) => state.routes);
  const packages = useRoutePulseStore((state) => state.packages);
  const settings = useRoutePulseStore((state) => state.settings);
  const startRoute = useRoutePulseStore((state) => state.startRoute);
  const markArrived = useRoutePulseStore((state) => state.markArrived);
  const markDelivered = useRoutePulseStore((state) => state.markDelivered);
  const markFailed = useRoutePulseStore((state) => state.markFailed);
  const pauseRoute = useRoutePulseStore((state) => state.pauseRoute);
  const resumeRoute = useRoutePulseStore((state) => state.resumeRoute);
  const reportIncident = useRoutePulseStore((state) => state.reportIncident);

  const route = routes.find((item) => item.id === currentUser?.assignedRouteId);
  const routePackages = route ? getPackagesForRoute(route.id, packages) : [];
  const stats = route ? calculateRouteStats(route, packages, settings) : null;
  const currentStop = routePackages.find((item) => item.status === "in_progress") ?? routePackages.find((item) => item.status === "pending");
  const remainingStops = routePackages.filter((item) => item.status === "pending" || item.status === "in_progress").length;
  const isPaused = route?.status === "paused";
  const isComplete = route?.status === "completed" || !currentStop;
  const routeStateText = stats?.operationalRisk === "high" ? "atrasada" : stats?.operationalRisk === "medium" ? "en riesgo" : "en tiempo";

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function submitFail(reason: string) {
    if (!route) return;
    markFailed(route.id, reason);
    setFailOpen(false);
    showToast(`Entrega fallida: ${reason}`);
  }

  function submitPause(reason: string) {
    if (!route) return;
    pauseRoute(route.id, reason);
    setPauseOpen(false);
    showToast(`Ruta pausada: ${reason}`);
  }

  function submitIncident(reason: string) {
    if (!route) return;
    reportIncident({
      routeId: route.id,
      packageId: currentStop?.id,
      title: `Incidencia driver en ${route.id}`,
      detail: reason,
      severity: reason === "calle bloqueada" || reason === "zona insegura" ? "high" : "medium",
      source: "driver",
    });
    setIncidentOpen(false);
    showToast(`Incidencia reportada: ${reason}`);
  }

  function handleDeliver() {
    if (!route) return;
    markDelivered(route.id);
    showToast("Paquete entregado.");
  }

  return (
    <DriverShell>
      <div className="space-y-5 p-5">
        {route && stats ? (
          <>
            <section className="rounded-3xl bg-[#0b0f14] p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#22d3ee]">Ruta actual</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight">{route.id}</h1>
                  <p className="mt-1 text-sm text-white/60">Estado operativo: {routeStateText}</p>
                </div>
                <StatusBadge type="risk" status={riskToBadgeRisk(stats.operationalRisk)} />
              </div>
              <div className="mt-5">
                <Progress value={stats.progress} tone={stats.risk === "risk_high" ? "red" : stats.risk === "risk_medium" ? "amber" : "green"} />
                <div className="mt-2 flex justify-between text-xs text-white/60">
                  <span>{formatPercent(stats.progress)} avance</span>
                  <span>ETA cierre {stats.estimatedCloseTime}</span>
                </div>
              </div>
            </section>

            <Card>
              <CardContent className="p-5">
                {currentStop ? (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500">Proxima parada</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-950">{currentStop.customerName}</h2>
                        <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                          {currentStop.address}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">{currentStop.locality}</p>
                        <p className="mt-1 text-xs text-slate-500">Referencia: {currentStop.addressReference}</p>
                      </div>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-lg font-bold text-white">
                        {currentStop.sequence}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <StopMetric label="Restantes" value={remainingStops} />
                      <StopMetric label="ETA ventana" value={`${currentStop.estimatedArrivalWindowStart} - ${currentStop.estimatedArrivalWindowEnd}`} />
                      <StopMetric label="Drop-off" value={`${currentStop.dropoffTimeMinutes} min`} />
                    </div>

                    <DriverMap packages={routePackages} />

                    <div className="flex flex-wrap gap-3">
                      <StopMetric label="Paradas antes" value={currentStop.stopsBeforeCustomer} />
                      <StopMetric label="Confianza" value={etaConfidenceLabels[currentStop.etaConfidence]} />
                      <StopMetric label="Riesgo" value={operationalRiskLabels[currentStop.riskLevel]} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-emerald-50 p-4 text-emerald-800">
                    <p className="font-bold">Ruta completada</p>
                    <p className="mt-1 text-sm">Todas las paradas fueron procesadas.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {route.status === "paused" ? (
                <Button size="lg" variant="warning" onClick={() => resumeRoute(route.id)}>
                  <Play className="h-5 w-5" />
                  Reanudar
                </Button>
              ) : route.status === "scheduled" ? (
                <Button size="lg" onClick={() => startRoute(route.id)} disabled={isComplete}>
                  <Play className="h-5 w-5" />
                  Iniciar ruta
                </Button>
              ) : (
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-center text-sm font-bold text-sky-900">
                  Ruta en curso. Usa las acciones de la parada actual.
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" className="h-14 text-base" onClick={() => markArrived(route.id)} disabled={isPaused || isComplete}>
                  <MapPin className="h-5 w-5" />
                  Llegué
                </Button>
                <Button variant="success" size="lg" className="h-14 text-base" onClick={handleDeliver} disabled={isPaused || isComplete}>
                  <CheckCircle2 className="h-5 w-5" />
                  Entregado
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="destructive" size="lg" className="h-14 text-base" onClick={() => setFailOpen(true)} disabled={isPaused || isComplete}>
                  <XCircle className="h-5 w-5" />
                  No pude entregar
                </Button>
                <Button variant="warning" size="lg" className="h-14 text-base" onClick={() => setPauseOpen(true)} disabled={isPaused || isComplete}>
                  <Pause className="h-5 w-5" />
                  Pausar
                </Button>
              </div>
              <Button variant="outline" size="lg" className="h-14 text-base" onClick={() => setIncidentOpen(true)} disabled={isComplete}>
                <AlertTriangle className="h-5 w-5" />
                Reportar incidencia
              </Button>
            </div>

            {route.pauseReason ? (
              <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-semibold">
                  Pausa activa: {route.pauseReason}. La pausa impacto el ETA de las proximas entregas.
                </p>
              </div>
            ) : null}

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-950">Plan de paradas</p>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    {stats.estimatedCloseTime}
                  </span>
                </div>
                <div className="space-y-3">
                  {routePackages.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {item.sequence}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{item.customerName}</p>
                          <p className="truncate text-xs text-slate-500">
                            {item.estimatedArrivalWindowStart} - {item.estimatedArrivalWindowEnd} - {item.stopsBeforeCustomer} antes
                          </p>
                          <p className="truncate text-xs text-slate-500">{item.locality} - {item.addressReference}</p>
                        </div>
                      </div>
                      <StatusBadge type="package" status={item.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <ReasonModal open={failOpen} onOpenChange={setFailOpen} title="Motivo por el que no pude entregar" reasons={failReasons} onSelect={submitFail} />
            <ReasonModal open={pauseOpen} onOpenChange={setPauseOpen} title="Motivo de pausa" reasons={pauseReasons} onSelect={submitPause} />
            <ReasonModal open={incidentOpen} onOpenChange={setIncidentOpen} title="Reportar incidencia operativa" reasons={incidentReasons} onSelect={submitIncident} />
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

function StopMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ReasonModal({
  open,
  onOpenChange,
  title,
  reasons,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reasons: string[];
  onSelect: (reason: string) => void;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title}>
      <div className="grid gap-2">
        {reasons.map((reason) => (
          <Button key={reason} variant="outline" className="justify-start" onClick={() => onSelect(reason)}>
            <PackageCheck className="h-4 w-4" />
            {reason}
          </Button>
        ))}
      </div>
    </Modal>
  );
}
