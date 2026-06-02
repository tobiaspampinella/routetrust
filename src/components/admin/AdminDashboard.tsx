"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Clock3,
  Package,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { BugReport } from "@/lib/bugReporting";
import { calculateOperationsKpis, calculateRouteStats, getPackagesForRoute } from "@/lib/kpiCalculations";
import { generateOperationalInsights } from "@/lib/operationalInsights";
import { betaCoreModules, buildProjectIntelligenceReport } from "@/lib/projectIntelligence";
import { formatPercent } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";
import { getDefaultEnterpriseCmsState } from "@/services/cms/cmsService";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";

type Tone = "violet" | "cyan" | "slate";

const primaryMetrics = [
  { key: "totalPackages", label: "Despachos totales", icon: Package, tone: "slate" as Tone },
  { key: "deliveredPackages", label: "Entregados", icon: Truck, tone: "violet" as Tone },
  { key: "activeDrivers", label: "Drivers activos", icon: Users, tone: "slate" as Tone },
  { key: "routesAtRisk", label: "Rutas en riesgo", icon: AlertTriangle, tone: "cyan" as Tone },
];

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
      currentUser: state.currentUser,
    })),
  );

  const cmsState = getDefaultEnterpriseCmsState();
  const kpis = calculateOperationsKpis(data);
  const insights = generateOperationalInsights(data.routes, data.packages, data.drivers, data.settings).slice(0, 4);
  const openIncidents = data.incidents.filter((incident) => incident.status !== "resolved");
  const routeStats = data.routes.map((route) => ({
    route,
    stats: calculateRouteStats(route, data.packages, data.settings),
    driver: data.drivers.find((driver) => driver.id === route.driverId),
  }));
  const primaryRoute = routeStats[0];
  const primaryPackages = primaryRoute ? getPackagesForRoute(primaryRoute.route.id, data.packages) : [];
  const secondaryPackages = useMemo(
    () =>
      data.packages
        .slice()
        .sort((left, right) => left.sequence - right.sequence)
        .slice(0, 5),
    [data.packages],
  );

  const betaReport = buildProjectIntelligenceReport({
    appVersion: APP_VERSION,
    buildStatus: openIncidents.some((incident) => incident.severity === "high") ? "warning" : "ready",
    modules: betaCoreModules,
    risks: openIncidents.some((incident) => incident.severity === "high")
      ? ["Hay incidentes de severidad alta abiertos."]
      : ["La beta sigue apoyada en estado local y no tiene persistencia productiva."],
  });

  const completionPercent = Math.round(kpis.completionRate * 100);
  const projectedSlaPercent = Math.round(kpis.projectedSLA * 100);
  const etaConfidencePercent = Math.round(kpis.etaConfidenceAverage * 100);
  const betaCoreRatio = `${betaReport.implementedModules}/${betaReport.modules.filter((module) => module.status !== "excluded").length}`;

  useEffect(() => {
    let active = true;

    async function loadRecentBugs() {
      const response = await fetch("/api/bugs", { credentials: "include" }).catch(() => null);
      const payload = response?.ok ? ((await response.json().catch(() => null)) as { reports?: BugReport[] } | null) : null;
      if (!active || !payload?.reports) return;
      setRecentBugs(payload.reports.slice(0, 4));
    }

    loadRecentBugs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell>
      <section className="ops-panel rounded-[2rem] px-4 py-5 sm:px-5 lg:px-8 lg:py-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b49bff]/18 bg-[#b49bff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[#cfc4ff]">
                Control tower
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl xl:text-[3.2rem]">
                Dashboard operativo para ultima milla.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
                {data.settings.operatingZone} - cierre objetivo {data.settings.targetCloseTime} - lectura unificada de ritmo operativo, bugs,
                riesgo y readiness beta.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto_auto] xl:min-w-[540px]">
              <div className="flex items-center gap-3 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-3">
                <Search className="h-4 w-4 text-white/40" />
                <span className="text-sm text-white/42">Buscar ruta, ticket o cliente...</span>
              </div>
              <div className="flex items-center justify-center rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-3 text-white/76">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-3 rounded-[1.3rem] border border-white/8 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#b49bff] to-[#6ee7f9] text-sm font-bold text-[#090910]">
                  {data.currentUser?.name.slice(0, 2).toUpperCase() || "RT"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{data.currentUser?.name || "Admin"}</p>
                  <p className="text-xs text-white/40">Operations lead</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {primaryMetrics.map(({ key, label, icon, tone }) => (
              <KpiTile
                key={key}
                label={label}
                value={formatMetricValue(key, kpis)}
                icon={icon}
                tone={tone}
                detail={formatMetricDetail(key, kpis)}
              />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
            <div className="ops-panel-soft rounded-[1.9rem] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-2xl font-semibold text-white">Live shipment tracking</p>
                  <p className="mt-1 text-sm text-white/46">Centro visual principal con lectura inmediata de progreso, ETA y estado.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-white/65">
                  <FilterPill label="Ground shipping" />
                  <FilterPill label="Ongoing" />
                  <FilterPill label="Today" />
                </div>
              </div>

              <div className="ops-world-grid relative mt-5 min-h-[420px] overflow-hidden rounded-[1.7rem] border border-white/6 bg-[#0e0f1b]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(180,155,255,0.08),transparent_35%)]" />
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 920 460" fill="none" aria-hidden="true">
                  <path d="M86 256C198 174 298 154 414 194C520 230 649 166 836 206" className="customer-route-shadow" />
                  <path d="M86 256C198 174 298 154 414 194C520 230 649 166 836 206" className="customer-route-line" />
                  <path d="M414 196C503 310 618 336 774 350" className="customer-route-shadow" />
                  <path d="M414 196C503 310 618 336 774 350" className="customer-route-line" />
                  <path d="M306 108C350 116 380 128 414 194" className="customer-route-shadow" />
                  <path d="M306 108C350 116 380 128 414 194" className="customer-route-line" />
                </svg>

                {[
                  { left: "10%", top: "55%" },
                  { left: "32%", top: "22%" },
                  { left: "45%", top: "42%" },
                  { left: "68%", top: "29%" },
                  { left: "77%", top: "77%" },
                  { left: "89%", top: "44%" },
                ].map((point) => (
                  <div
                    key={`${point.left}-${point.top}`}
                    className="absolute h-3.5 w-3.5 rounded-full bg-[#b49bff] shadow-[0_0_0_8px_rgba(180,155,255,0.08)]"
                    style={{ left: point.left, top: point.top }}
                  >
                    <span className="absolute -inset-2 rounded-full border border-[#b49bff]/30" />
                  </div>
                ))}

                <div className="absolute left-5 top-5 hidden gap-2 sm:flex">
                  <InfoChip label={`${kpis.activeRoutes} rutas`} value="Activas" />
                  <InfoChip label={primaryPackages[0]?.estimatedArrival || "--"} value="Proximo ETA" />
                </div>

                <div className="ops-panel absolute bottom-5 left-5 right-5 max-w-[360px] rounded-[1.45rem] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/44">{primaryRoute?.route.id || "Ruta principal"}</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        {primaryPackages[0]?.trackingCode || "SHPMT-6373-2537"}
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#090910]">Out for delivery</div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-white/42">ETA</p>
                      <p className="mt-1 font-semibold text-white">{primaryRoute?.stats.estimatedCloseTime || "--"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-white/42">Riesgo</p>
                      <p className="mt-1 font-semibold text-white">{formatRiskLabel(primaryRoute?.stats.risk || "risk_low")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-white/42">Driver</p>
                      <p className="mt-1 font-semibold text-white">{primaryRoute?.driver?.name || "--"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="ops-panel-soft rounded-[1.9rem] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-white">Margen operativo</p>
                  <FilterPill label="Today" />
                </div>
                <div className="mx-auto mt-8 flex h-56 w-56 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_58%)]">
                  <div
                    className="flex h-48 w-48 items-center justify-center rounded-full"
                    style={{ background: `conic-gradient(#a78bfa 0 ${completionPercent}%, rgba(255,255,255,0.08) ${completionPercent}% 100%)` }}
                  >
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#090913] text-5xl font-semibold text-white">
                      {completionPercent}%
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-center text-sm text-white/42">Cierre operativo estimado</p>
                <p className="mt-2 text-center text-4xl font-semibold text-white">{kpis.operationalCloseEstimate}</p>
              </div>

              <div className="ops-panel-soft rounded-[1.9rem] p-5">
                <p className="text-2xl font-semibold text-white">Beta readiness</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <ReadinessTile label="Core beta" value={betaCoreRatio} detail={`${betaReport.partialModules} parciales`} icon={ShieldCheck} />
                  <ReadinessTile label="SLA proyectado" value={`${projectedSlaPercent}%`} detail="escenario de hoy" icon={TrendingUp} />
                  <ReadinessTile label="Confianza ETA" value={`${etaConfidencePercent}%`} detail="promedio actual" icon={Sparkles} />
                  <ReadinessTile label="Incidentes" value={openIncidents.length} detail="abiertos" icon={AlertTriangle} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 2xl:grid-cols-[0.9fr_1.1fr]">
            <div className="ops-panel-soft rounded-[1.9rem] p-5">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-white">Ritmo de entregas</p>
                <FilterPill label="Semana" />
              </div>
              <div className="ops-dot-grid relative mt-6 h-[260px] overflow-hidden rounded-[1.5rem] border border-white/6 bg-[#101120] p-5">
                <svg viewBox="0 0 560 220" className="absolute inset-x-0 bottom-10 h-[180px] w-full px-4" fill="none" aria-hidden="true">
                  <path d="M20 124C66 196 110 190 156 126C190 80 238 60 286 112C326 154 360 162 410 104C462 44 500 68 540 146" className="customer-route-shadow" />
                  <path d="M20 124C66 196 110 190 156 126C190 80 238 60 286 112C326 154 360 162 410 104C462 44 500 68 540 146" className="customer-route-line" />
                </svg>
                <div className="ops-panel absolute left-1/2 top-[42%] w-[190px] -translate-x-1/2 rounded-[1.2rem] p-3 text-center">
                  <p className="text-sm text-white/48">Shipment error rate</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{Math.max(1, Math.round(kpis.failureRate * 100))}%</p>
                </div>
                <div className="absolute inset-x-5 bottom-4 grid grid-cols-7 text-center text-xs text-white/32">
                  {["S", "M", "T", "W", "T", "F", "S"].map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="ops-panel-soft rounded-[1.9rem] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-2xl font-semibold text-white">Recent shipments</p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Export" />
                  <FilterPill label="All" />
                  <FilterPill label="Week" />
                </div>
              </div>
              <div className="ops-scrollbar mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.22em] text-white/28">
                      <th className="px-4 py-2 font-medium">Shipment ID</th>
                      <th className="px-4 py-2 font-medium">Cliente</th>
                      <th className="px-4 py-2 font-medium">Ventana</th>
                      <th className="px-4 py-2 font-medium">Origen</th>
                      <th className="px-4 py-2 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {secondaryPackages.map((shipment) => (
                      <tr key={shipment.id} className="rounded-2xl bg-white/[0.035] text-sm text-white/76">
                        <td className="rounded-l-2xl px-4 py-3 font-semibold text-white">{shipment.trackingCode}</td>
                        <td className="px-4 py-3">{shipment.customerName}</td>
                        <td className="px-4 py-3">
                          {shipment.estimatedArrivalWindowStart} - {shipment.estimatedArrivalWindowEnd}
                        </td>
                        <td className="px-4 py-3">{shipment.locality}</td>
                        <td className="rounded-r-2xl px-4 py-3">
                          <StatusBadge type="package" status={shipment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <div className="ops-panel-soft rounded-[1.9rem] p-5">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-white">Insights operativos</p>
                <div className="text-xs uppercase tracking-[0.24em] text-white/30">Live</div>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {insights.map((insight) => (
                  <div key={insight} className="rounded-[1.35rem] border border-[#6ee7f9]/12 bg-[#6ee7f9]/[0.04] p-4 text-sm leading-7 text-white/70">
                    {insight}
                  </div>
                ))}
              </div>
            </div>

            <div className="ops-panel-soft rounded-[1.9rem] p-5">
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-white">Triage de bugs</p>
                <FilterPill label={`${recentBugs.length || 0} activos`} />
              </div>
              <div className="mt-5 space-y-3">
                {recentBugs.length === 0 ? (
                  <div className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4 text-sm text-white/52">
                    Todavia no hay tickets persistidos para mostrar en esta vista.
                  </div>
                ) : (
                  recentBugs.map((bug) => (
                    <div key={bug.id} className="rounded-[1.35rem] border border-white/8 bg-white/[0.035] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{bug.title}</p>
                          <p className="mt-1 text-xs text-white/38">
                            {bug.id} - {bug.pageContext?.pageLabel || bug.routePath || "Pagina desconocida"}
                          </p>
                        </div>
                        <StatusBadge
                          type="risk"
                          status={bug.severity === "P0" || bug.severity === "P1" ? "risk_high" : bug.severity === "P2" ? "risk_medium" : "risk_low"}
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/50">
                        <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">{bug.category}</span>
                        <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">{bug.status}</span>
                        <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1">{bug.assignedAgents.join(", ")}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function KpiTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Package;
  tone: Tone;
}) {
  const toneClass =
    tone === "violet"
      ? "ops-highlight border-transparent text-[#090910]"
      : tone === "cyan"
        ? "border-[#6ee7f9]/18 bg-[#6ee7f9]/[0.07] text-white"
        : "border-white/8 bg-white/[0.035] text-white";

  const iconClass =
    tone === "violet"
      ? "bg-[#0b0b13]/10 text-[#090910]"
      : tone === "cyan"
        ? "bg-[#6ee7f9]/14 text-[#6ee7f9]"
        : "bg-white/6 text-[#b49bff]";

  const secondaryText = tone === "violet" ? "text-[#322760]/68" : "text-white/46";

  return (
    <article className={`ops-card-glow rounded-[1.7rem] border p-5 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${secondaryText}`}>{label}</p>
          <p className="mt-3 text-4xl font-semibold">{value}</p>
          <p className={`mt-2 text-xs ${secondaryText}`}>{detail}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function FilterPill({ label }: { label: string }) {
  return <div className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-white/66">{label}</div>;
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-[#0f1020]/90 px-3 py-1.5 text-sm text-white/72 backdrop-blur">
      <span className="text-white/38">{value}</span> {label}
    </div>
  );
}

function ReadinessTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.035] p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/6 text-[#b49bff]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-[0.2em] text-white/34">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/42">{detail}</p>
    </div>
  );
}

function formatMetricValue(key: string, kpis: ReturnType<typeof calculateOperationsKpis>) {
  switch (key) {
    case "totalPackages":
      return kpis.totalPackages;
    case "deliveredPackages":
      return kpis.deliveredPackages;
    case "activeDrivers":
      return kpis.activeDrivers;
    case "routesAtRisk":
      return kpis.routesAtRisk;
    default:
      return "--";
  }
}

function formatMetricDetail(key: string, kpis: ReturnType<typeof calculateOperationsKpis>) {
  switch (key) {
    case "totalPackages":
      return `${kpis.pendingPackages} pendientes`;
    case "deliveredPackages":
      return `${formatPercent(kpis.completionRate)} de avance`;
    case "activeDrivers":
      return `${kpis.averagePackagesPerDriver.toFixed(1)} paquetes por unidad`;
    case "routesAtRisk":
      return `${kpis.atRiskPackages} paquetes comprometidos`;
    default:
      return "";
  }
}

function formatRiskLabel(risk: "risk_low" | "risk_medium" | "risk_high") {
  if (risk === "risk_high") return "Alto";
  if (risk === "risk_medium") return "Medio";
  return "Bajo";
}
