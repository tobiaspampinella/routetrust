"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Eye,
  Map,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Timer,
  Trash2,
  Truck,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsEnterpriseOverview } from "@/components/admin/CmsEnterpriseOverview";
import { LiveCmsTab } from "@/components/admin/LiveCmsTab";
import { FleetTrackingMap } from "@/components/customer/FleetTrackingMap";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildDemoRouteSimulation } from "@/lib/routeSimulationEngine";
import type { CustomerTrackingCms, DeliveryPriority, MapProviderMode, TrafficLevel } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";

const providerOptions: Array<{ value: MapProviderMode; label: string; description: string }> = [
  {
    value: "local_3d_mock",
    label: "3D mock local",
    description: "Demo visual sin API keys. Ideal para vender el concepto y validar UX.",
  },
  {
    value: "maplibre_osm_ready",
    label: "MapLibre / OSM ready",
    description: "Proveedor recomendado para beta de bajo costo; pendiente de integrar tiles/routing legal.",
  },
  {
    value: "google_maps_ready",
    label: "Google Maps ready",
    description: "Activa calles reales, Directions y TrafficLayer cuando existe NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.",
  },
  {
    value: "apple_mapkit_ready",
    label: "Apple MapKit ready",
    description: "Preparado para conectar Apple MapKit JS con token autorizado.",
  },
];

const emptyStopForm = {
  customerName: "",
  street: "",
  streetNumber: "",
  locality: "Belgrano",
  addressReference: "",
  trafficLevel: "medium" as TrafficLevel,
  dropoffMinutes: 6,
  priority: "normal" as DeliveryPriority,
};

export function AdminCms() {
  const [activeTab, setActiveTab] = useState<"enterprise" | "demo" | "live">("enterprise");
  const {
    settings,
    trackingCms,
    updateTrackingCms,
    addTrackingDemoStop,
    removeTrackingDemoStop,
    resetTrackingDemoStops,
    startTrackingSimulation,
    pauseTrackingSimulation,
    restartTrackingSimulation,
  } = useRoutePulseStore(
    useShallow((state) => ({
      settings: state.settings,
      trackingCms: state.trackingCms,
      updateTrackingCms: state.updateTrackingCms,
      addTrackingDemoStop: state.addTrackingDemoStop,
      removeTrackingDemoStop: state.removeTrackingDemoStop,
      resetTrackingDemoStops: state.resetTrackingDemoStops,
      startTrackingSimulation: state.startTrackingSimulation,
      pauseTrackingSimulation: state.pauseTrackingSimulation,
      restartTrackingSimulation: state.restartTrackingSimulation,
    })),
  );
  const [draft, setDraft] = useState<CustomerTrackingCms>(trackingCms);
  const [stopForm, setStopForm] = useState(emptyStopForm);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setDraft((current) =>
      dirty
        ? {
            ...current,
            demoStops: trackingCms.demoStops,
            simulationStarted: trackingCms.simulationStarted,
            simulationStartedAt: trackingCms.simulationStartedAt,
            simulationPausedAt: trackingCms.simulationPausedAt,
            simulationPausedElapsedSeconds: trackingCms.simulationPausedElapsedSeconds,
          }
        : trackingCms,
    );
  }, [dirty, trackingCms]);

  const simulation = useMemo(
    () =>
      buildDemoRouteSimulation({
        settings,
        trackingCms: {
          ...trackingCms,
          liveSimulationSpeed: draft.liveSimulationSpeed,
          showNextStopsCount: draft.showNextStopsCount,
        },
        now: now || Date.now(),
      }),
    [draft.liveSimulationSpeed, draft.showNextStopsCount, now, settings, trackingCms],
  );
  const elapsedSeconds = simulation.elapsedSeconds;
  const projection = simulation.projection;

  const canAddStop = trackingCms.demoStops.length < 5;
  const demoStatus = trackingCms.simulationStarted
    ? "En vivo"
    : trackingCms.simulationPausedElapsedSeconds > 0
      ? "Pausado"
      : "Listo para iniciar";

  function setValue<K extends keyof CustomerTrackingCms>(key: K, value: CustomerTrackingCms[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaved(false);
  }

  function commitDraft() {
    const nextDraft: CustomerTrackingCms = {
      ...draft,
      liveSimulationSpeed: Math.min(Math.max(Number(draft.liveSimulationSpeed) || 1, 0.25), 3),
      showNextStopsCount: Math.min(Math.max(Math.round(Number(draft.showNextStopsCount) || 4), 2), 5),
      demoStops: trackingCms.demoStops,
      simulationStarted: trackingCms.simulationStarted,
      simulationStartedAt: trackingCms.simulationStartedAt,
      simulationPausedAt: trackingCms.simulationPausedAt,
      simulationPausedElapsedSeconds: trackingCms.simulationPausedElapsedSeconds,
    };

    updateTrackingCms(nextDraft);
    setDraft(nextDraft);
    setDirty(false);
    setSaved(true);
  }

  function launchDemo() {
    commitDraft();
    startTrackingSimulation();
  }

  function submitStop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canAddStop || !stopForm.customerName.trim() || !stopForm.street.trim()) return;

    addTrackingDemoStop({
      customerName: stopForm.customerName.trim(),
      street: stopForm.street.trim(),
      streetNumber: stopForm.streetNumber.trim() || "S/N",
      locality: stopForm.locality.trim() || "Buenos Aires",
      addressReference: stopForm.addressReference.trim() || "Sin referencia",
      trafficLevel: stopForm.trafficLevel,
      dropoffMinutes: Number(stopForm.dropoffMinutes) || 6,
      priority: stopForm.priority,
    });
    setStopForm(emptyStopForm);
    setSaved(false);
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow={activeTab === "enterprise" ? "Enterprise CMS" : activeTab === "demo" ? "Tracking demo builder" : "Live Operations CMS"}
        title={activeTab === "enterprise" ? "Consola SaaS B2B logística" : activeTab === "demo" ? "CMS de experiencia cliente" : "Gestión Operativa"}
        description={
          activeTab === "enterprise"
            ? "Administra tenants, módulos, RBAC, approvals, auditoría y configuración comercial-operativa del SaaS."
            : activeTab === "demo"
              ? "Controla el copy público, la simulación y las paradas demo."
              : "Administra rutas reales, reasigna paquetes y fuerza estados en vivo."
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-4 flex rounded-xl bg-slate-200 p-1">
            <button
              onClick={() => setActiveTab("enterprise")}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${activeTab === "enterprise" ? "bg-white text-brand-700 shadow" : "text-slate-500 hover:text-slate-900"}`}
            >
              Enterprise
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${activeTab === "demo" ? "bg-white text-brand-700 shadow" : "text-slate-500 hover:text-slate-900"}`}
            >
              Demo Builder
            </button>
            <button
              onClick={() => setActiveTab("live")}
              className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${activeTab === "live" ? "bg-white text-brand-700 shadow" : "text-slate-500 hover:text-slate-900"}`}
            >
              Live Ops
            </button>
          </div>
          {activeTab === "demo" && saved ? <span className="text-sm font-semibold text-emerald-700">Cambios guardados</span> : null}
          {activeTab === "demo" && <Badge variant={trackingCms.simulationStarted ? "in_progress" : "pending"}>{demoStatus}</Badge>}
        </div>
      </PageHeader>

      {activeTab === "enterprise" ? (
        <CmsEnterpriseOverview />
      ) : activeTab === "live" ? (
        <LiveCmsTab />
      ) : (

      <div className="space-y-6 p-5 lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Texto publico y proveedor de mapa</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <Field label="Nombre de producto">
                  <Input value={draft.productName} onChange={(event) => setValue("productName", event.target.value)} />
                </Field>
                <Field label="Barrio / zona foco">
                  <Input value={draft.neighborhoodFocus} onChange={(event) => setValue("neighborhoodFocus", event.target.value)} />
                </Field>
                <Field label="Titulo cliente">
                  <Input value={draft.customerHeadline} onChange={(event) => setValue("customerHeadline", event.target.value)} />
                </Field>
                <Field label="Telefono soporte">
                  <Input value={draft.supportPhone} onChange={(event) => setValue("supportPhone", event.target.value)} />
                </Field>
                <Field className="md:col-span-2" label="Subtitulo cliente">
                  <TextArea value={draft.customerSubheadline} onChange={(value) => setValue("customerSubheadline", value)} rows={3} />
                </Field>
                <Field label="Label soporte">
                  <Input value={draft.supportLabel} onChange={(event) => setValue("supportLabel", event.target.value)} />
                </Field>
                <Field label="Paradas visibles">
                  <Input
                    type="number"
                    min={2}
                    max={5}
                    value={draft.showNextStopsCount}
                    onChange={(event) => setValue("showNextStopsCount", Number(event.target.value))}
                  />
                </Field>
                <Field className="md:col-span-2" label="Nota de privacidad">
                  <TextArea value={draft.privacyNote} onChange={(value) => setValue("privacyNote", value)} rows={2} />
                </Field>

                <div className="grid gap-3 md:col-span-2">
                  <Label>Proveedor de mapa</Label>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {providerOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer gap-3 rounded-3xl border border-border bg-white p-4 hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name="mapProviderMode"
                          value={option.value}
                          checked={draft.mapProviderMode === option.value}
                          onChange={(event) => setValue("mapProviderMode", event.target.value as MapProviderMode)}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          <span className="block text-sm font-black text-slate-950">{option.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{option.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Velocidad simulacion">
                  <Input
                    type="number"
                    min={0.25}
                    max={3}
                    step={0.25}
                    value={draft.liveSimulationSpeed}
                    onChange={(event) => setValue("liveSimulationSpeed", Number(event.target.value))}
                  />
                </Field>
                <Field label="Estado proveedor">
                  <TextArea value={draft.mapProviderStatus} onChange={(value) => setValue("mapProviderStatus", value)} rows={2} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paradas demo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <form onSubmit={submitStop} className="grid gap-3 lg:grid-cols-6">
                  <Field label="Pedido" className="lg:col-span-2">
                    <Input
                      value={stopForm.customerName}
                      onChange={(event) => setStopForm((current) => ({ ...current, customerName: event.target.value }))}
                      placeholder="Pedido Palermo"
                    />
                  </Field>
                  <Field label="Calle" className="lg:col-span-2">
                    <Input
                      value={stopForm.street}
                      onChange={(event) => setStopForm((current) => ({ ...current, street: event.target.value }))}
                      placeholder="Av. Cabildo"
                    />
                  </Field>
                  <Field label="Altura">
                    <Input
                      value={stopForm.streetNumber}
                      onChange={(event) => setStopForm((current) => ({ ...current, streetNumber: event.target.value }))}
                      placeholder="1842"
                    />
                  </Field>
                  <Field label="Drop-off">
                    <Input
                      type="number"
                      min={3}
                      max={18}
                      value={stopForm.dropoffMinutes}
                      onChange={(event) => setStopForm((current) => ({ ...current, dropoffMinutes: Number(event.target.value) }))}
                    />
                  </Field>
                  <Field label="Localidad" className="lg:col-span-2">
                    <Input
                      value={stopForm.locality}
                      onChange={(event) => setStopForm((current) => ({ ...current, locality: event.target.value }))}
                    />
                  </Field>
                  <Field label="Referencia" className="lg:col-span-2">
                    <Input
                      value={stopForm.addressReference}
                      onChange={(event) => setStopForm((current) => ({ ...current, addressReference: event.target.value }))}
                      placeholder="Timbre, acceso, entre calles"
                    />
                  </Field>
                  <Field label="Trafico">
                    <Select
                      value={stopForm.trafficLevel}
                      onChange={(value) => setStopForm((current) => ({ ...current, trafficLevel: value as TrafficLevel }))}
                      options={[
                        { value: "low", label: "Bajo" },
                        { value: "medium", label: "Medio" },
                        { value: "high", label: "Alto" },
                      ]}
                    />
                  </Field>
                  <Field label="Prioridad">
                    <Select
                      value={stopForm.priority}
                      onChange={(value) => setStopForm((current) => ({ ...current, priority: value as DeliveryPriority }))}
                      options={[
                        { value: "normal", label: "Normal" },
                        { value: "high", label: "Alta" },
                        { value: "urgent", label: "Urgente" },
                      ]}
                    />
                  </Field>
                  <Button className="self-end" disabled={!canAddStop}>
                    <Plus className="h-4 w-4" />
                    {canAddStop ? "Agregar parada" : "Maximo 5"}
                  </Button>
                </form>

                <div className="grid gap-3">
                  {trackingCms.demoStops.map((stop, index) => (
                    <div key={stop.id} className="grid gap-3 rounded-3xl bg-[#f5f5f7] p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-[#1d1d1f] shadow-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1d1d1f]">{stop.customerName}</p>
                        <p className="mt-1 truncate text-sm font-medium text-[#6e6e73]">
                          {stop.street} {stop.streetNumber}, {stop.locality}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#86868b]">
                          {stop.addressReference} · trafico {stop.trafficLevel} · drop-off {stop.dropoffMinutes} min · {stop.priority}
                        </p>
                      </div>
                      <Button size="icon" variant="ghost" aria-label={`Eliminar ${stop.customerName}`} onClick={() => removeTrackingDemoStop(stop.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Simulacion en vivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <PreviewCard icon={Truck} label="Estado" value={demoStatus} />
                  <PreviewCard icon={Timer} label="ETA cliente" value={projection.orderEtaWindow} />
                  <PreviewCard icon={Clock} label="Tiempo restante" value={`${projection.liveEtaMinutes} min`} />
                  <PreviewCard icon={ShieldCheck} label="Paradas" value={`${trackingCms.demoStops.length}/5 cargadas`} />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" onClick={launchDemo} disabled={trackingCms.demoStops.length < 1}>
                    <Play className="h-4 w-4" />
                    Iniciar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={pauseTrackingSimulation}>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </Button>
                  <Button size="sm" variant="outline" onClick={restartTrackingSimulation} disabled={trackingCms.demoStops.length < 1}>
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar
                  </Button>
                </div>

                <div className="rounded-[30px] border border-[#d2d2d7] bg-[#f5f5f7] p-2">
                  <FleetTrackingMap
                    demoStops={trackingCms.demoStops}
                    stops={projection.stops}
                    truckPosition={projection.truckPosition}
                    packages={projection.packages}
                    order={projection.order}
                    paused={!trackingCms.simulationStarted && elapsedSeconds > 0 && projection.routeStatus !== "completed"}
                    started={trackingCms.simulationStarted || elapsedSeconds > 0}
                    routeStatus={projection.routeStatus}
                    trafficFactor={projection.trafficFactor}
                    liveEtaMinutes={projection.liveEtaMinutes}
                    orderEtaWindow={projection.orderEtaWindow}
                    progress={projection.progress}
                    providerMode={draft.mapProviderMode}
                    providerStatus={draft.mapProviderStatus}
                    compact
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={commitDraft}>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                  <Button asChild variant="outline">
                    <a href="/track/demo" target="_blank" rel="noreferrer">
                      <Eye className="h-4 w-4" />
                      Abrir tracking demo
                    </a>
                  </Button>
                  <Button variant="secondary" onClick={resetTrackingDemoStops}>
                    <RotateCcw className="h-4 w-4" />
                    Restaurar paradas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview de publicacion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                  <PreviewCard icon={Smartphone} label="Experiencia" value="iPhone tracking app" />
                  <PreviewCard icon={Map} label="Mapa" value={providerOptions.find((option) => option.value === draft.mapProviderMode)?.label ?? "Mapa"} />
                  <PreviewCard icon={Eye} label="Privacidad" value="Paradas anonimizadas" />
                </div>
                <p className="mt-4 rounded-3xl bg-[#f5f5f7] p-4 text-sm font-medium leading-6 text-[#6e6e73]">
                  {draft.mapProviderStatus}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      )}
    </AdminShell>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs font-bold uppercase text-[#6e6e73]">{label}</Label>
      {children}
    </div>
  );
}

function TextArea({ value, onChange, rows }: { value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <textarea
      value={value}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 py-3 text-sm font-medium text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-2xl border border-[#d2d2d7] bg-[#f5f5f7] px-4 text-sm font-semibold text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function PreviewCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#6e6e73]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-sm font-black text-[#1d1d1f]">{value}</p>
    </div>
  );
}
