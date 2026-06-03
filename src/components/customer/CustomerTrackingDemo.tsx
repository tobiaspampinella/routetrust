"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Bell, Gauge, MapPin, PackageCheck, Phone, ShieldCheck, Timer, Truck } from "lucide-react";
import { FleetTrackingMap } from "@/components/customer/FleetTrackingMap";
import { TrackingTimeline } from "@/components/customer/TrackingTimeline";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { etaConfidenceLabels } from "@/components/shared/status-labels";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDemoTrackingProjection, getTrackingSimulationElapsedSeconds } from "@/lib/trackingSimulation";
import type { DeliveryPackage, RouteStatus } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";

export function CustomerTrackingDemo() {
  const { settings, trackingCms } = useRoutePulseStore(
    useShallow((state) => ({
      settings: state.settings,
      trackingCms: state.trackingCms,
    })),
  );
  const [now, setNow] = useState(() => Date.now());
  const [pageStartedAt] = useState(() => Date.now());
  const demoStops = trackingCms.demoStops;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const storedElapsedSeconds = getTrackingSimulationElapsedSeconds(trackingCms, now);
  const autoPresentationMode = !trackingCms.simulationStarted && trackingCms.simulationPausedElapsedSeconds === 0;
  const elapsedSeconds = autoPresentationMode
    ? Math.max(Math.floor((now - pageStartedAt) / 1000), 0)
    : storedElapsedSeconds;
  const projectionStarted = trackingCms.simulationStarted || autoPresentationMode || storedElapsedSeconds > 0;
  const projection = useMemo(
    () =>
      buildDemoTrackingProjection(
        demoStops,
        settings,
        elapsedSeconds,
        trackingCms.showNextStopsCount,
        trackingCms.liveSimulationSpeed,
        projectionStarted,
      ),
    [demoStops, elapsedSeconds, projectionStarted, settings, trackingCms.liveSimulationSpeed, trackingCms.showNextStopsCount],
  );
  const order = projection.order;
  const routeStatus = projection.routeStatus;
  const paused = !autoPresentationMode && !trackingCms.simulationStarted && storedElapsedSeconds > 0 && routeStatus !== "completed";

  const orderDelivered = order?.status === "delivered" || routeStatus === "completed";
  const orderFailed = order?.status === "failed";
  const orderMoving = routeStatus === "in_progress" || (projectionStarted && order?.status === "in_progress");
  const trackingStep = orderDelivered ? 3 : orderMoving ? 2 : projectionStarted ? 1 : 0;

  if (!settings.customerTrackingEnabled) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-5">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6 text-sm text-slate-600">El tracking cliente esta desactivado en settings.</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070707] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/15 bg-white/10 px-5 py-4 text-white backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase text-white/55">{trackingCms.productName} Fleet Demo</p>
            <p className="mt-1 text-lg font-semibold">Customer tracking con mapa operativo · {trackingCms.neighborhoodFocus}</p>
          </div>
          <Button asChild variant="outline" className="w-fit border-white/15 bg-white/10 text-white hover:bg-white/20">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Volver al tester
            </Link>
          </Button>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr] xl:items-start">
          <section className="rounded-[44px] border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-[38px] bg-[#f5f5f7]">
              <FleetTrackingMap
                demoStops={demoStops}
                stops={projection.stops}
                truckPosition={projection.truckPosition}
                packages={projection.packages}
                order={projection.order}
                paused={paused}
                started={projectionStarted}
                routeStatus={routeStatus}
                trafficFactor={projection.trafficFactor}
                liveEtaMinutes={projection.liveEtaMinutes}
                orderEtaWindow={projection.orderEtaWindow}
                progress={projection.progress}
                providerMode={trackingCms.mapProviderMode}
                providerStatus={trackingCms.mapProviderStatus}
              />

              <div className="space-y-4 px-5 pb-6 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase text-sky-700">{trackingCms.productName} Control Tower Lite</p>
                    <h1 className="mt-1 text-2xl font-black tracking-normal text-slate-950">{trackingCms.customerHeadline}</h1>
                    <p className="mt-2 text-sm text-slate-600">{trackingCms.customerSubheadline}</p>
                  </div>
                  {order ? <StatusBadge type="package" status={order.status} /> : null}
                </div>

                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400">ETA actualizado</p>
                      <p className="mt-1 text-3xl font-black">{order ? projection.orderEtaWindow : "--:--"}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white">
                      <Timer className="h-7 w-7" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {order
                      ? `Faltan ${projection.liveEtaMinutes} min. Hay ${order.stopsBeforeCustomer} entregas antes que la tuya.`
                      : "Estamos preparando la ventana de entrega."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            {order ? (
              <>
                <TrackingTimeline
                  activeStep={trackingStep}
                  delayed={paused}
                  failed={orderFailed}
                  etaWindow={projection.orderEtaWindow}
                />

                <div className="rounded-3xl border border-white/15 bg-white p-5 shadow-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">Pedido {order.trackingCode}</p>
                      <h2 className="mt-1 text-2xl font-black tracking-normal text-slate-950">{order.customerName}</h2>
                      <p className="mt-2 text-sm text-slate-600">{trackingCms.neighborhoodFocus}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                      <p className="text-xs font-bold uppercase text-emerald-700">Confianza ETA</p>
                      <p className="text-lg font-black text-emerald-900">{etaConfidenceLabels[order.etaConfidence]}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <CustomerMetric icon={Truck} label="Camión" value={routeStatusLabel(routeStatus, paused)} />
                    <CustomerMetric icon={PackageCheck} label="Estado" value={packageStatusLabel(order)} />
                    <CustomerMetric icon={Gauge} label="Tráfico" value={`x${projection.trafficFactor.toFixed(2)}`} />
                    <CustomerMetric icon={ShieldCheck} label="Privacidad" value="Paradas anonimizadas" />
                  </div>
                </div>

                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Antes de llegar a ti</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {projection.stops.map((stop) => (
                      <div
                        key={stop.id}
                        className={
                          stop.kind === "customer"
                            ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
                            : "rounded-2xl border border-border bg-white p-4"
                        }
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-950">{stop.label}</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{stop.locality}</p>
                          </div>
                          <p className="text-sm font-black text-slate-950">{stop.etaWindow}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Destino">
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
                      <div>
                        <p className="font-black text-slate-950">{order.locality}</p>
                        <p className="mt-1">{order.address}</p>
                        <p className="mt-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                          Ref: {order.addressReference}
                        </p>
                      </div>
                    </div>
                  </InfoCard>

                  <InfoCard title="Último evento">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
                        <Bell className="mt-0.5 h-5 w-5 shrink-0" />
                        <p className="font-semibold">{order.lastEvent ?? "ETA recalculado con datos operativos."}</p>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        <Phone className="h-5 w-5 text-slate-500" />
                        <div>
                          <p className="font-black text-slate-950">{trackingCms.supportLabel}</p>
                          <p>{trackingCms.supportPhone}</p>
                        </div>
                      </div>
                    </div>
                  </InfoCard>
                </div>
              </>
            ) : null}

            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-sm font-semibold text-slate-200">
              {trackingCms.privacyNote}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function packageStatusLabel(order: DeliveryPackage) {
  if (order.status === "delivered") return "Entregado";
  if (order.status === "in_progress") return "En reparto";
  if (order.status === "failed") return "No entregado";
  return "Programado";
}

function routeStatusLabel(status: RouteStatus, paused: boolean) {
  if (status === "scheduled") return "Preparando";
  if (status === "completed") return "Entregado";
  if (paused) return "ETA en actualizacion";
  return "En reparto";
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function CustomerMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
