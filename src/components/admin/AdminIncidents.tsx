"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { CheckCircle2, Plus, RotateCcw, Search, ShieldAlert, Eye } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Drawer } from "@/components/ui/drawer";
import { AlertBanner } from "@/components/ui/alert-banner";
import { EmptyState } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { IncidentSeverity, IncidentStatus } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

const STATUS_META: Record<IncidentStatus, { label: string; badge: "pending" | "in_progress" | "delivered" }> = {
  open: { label: "Abierto", badge: "pending" },
  in_review: { label: "En revisión", badge: "in_progress" },
  resolved: { label: "Resuelto", badge: "delivered" },
};

const SEVERITY_META: Record<IncidentSeverity, { label: string; badge: "risk_low" | "risk_medium" | "risk_high" }> = {
  low: { label: "Baja", badge: "risk_low" },
  medium: { label: "Media", badge: "risk_medium" },
  high: { label: "Alta", badge: "risk_high" },
};

const STATUS_ORDER: IncidentStatus[] = ["open", "in_review", "resolved"];
const SEVERITY_ORDER: IncidentSeverity[] = ["low", "medium", "high"];

interface IncidentDraft {
  routeId: string;
  title: string;
  detail: string;
  severity: IncidentSeverity;
}

export function AdminIncidents() {
  const { incidents, routes, reportIncident, resolveIncident, setIncidentStatus } = useRoutePulseStore(
    useShallow((state) => ({
      incidents: state.incidents,
      routes: state.routes,
      reportIncident: state.reportIncident,
      resolveIncident: state.resolveIncident,
      setIncidentStatus: state.setIncidentStatus,
    })),
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<IncidentDraft>({
    routeId: routes[0]?.id ?? "",
    title: "",
    detail: "",
    severity: "medium",
  });

  const routeZone = useMemo(() => {
    const map = new Map<string, string>();
    routes.forEach((route) => map.set(route.id, route.zone));
    return map;
  }, [routes]);

  const counts = useMemo(() => {
    const base = { open: 0, in_review: 0, resolved: 0, high: 0 };
    incidents.forEach((incident) => {
      base[incident.status] += 1;
      if (incident.severity === "high" && incident.status !== "resolved") base.high += 1;
    });
    return base;
  }, [incidents]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return incidents.filter((incident) => {
      if (statusFilter !== "all" && incident.status !== statusFilter) return false;
      if (!needle) return true;
      const zone = routeZone.get(incident.routeId) ?? "";
      return (
        incident.title.toLowerCase().includes(needle) ||
        incident.detail.toLowerCase().includes(needle) ||
        zone.toLowerCase().includes(needle)
      );
    });
  }, [incidents, query, statusFilter, routeZone]);

  function openCreate() {
    setDraft({ routeId: routes[0]?.id ?? "", title: "", detail: "", severity: "medium" });
    setDrawerOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.routeId || !draft.title.trim() || !draft.detail.trim()) return;
    reportIncident({
      routeId: draft.routeId,
      title: draft.title.trim(),
      detail: draft.detail.trim(),
      severity: draft.severity,
      source: "admin",
    });
    setDrawerOpen(false);
  }

  const kpis = [
    { label: "Abiertos", value: counts.open, tone: "text-[#1d1d1f]" },
    { label: "En revisión", value: counts.in_review, tone: "text-blue-600" },
    { label: "Resueltos", value: counts.resolved, tone: "text-emerald-600" },
    { label: "Alta · sin resolver", value: counts.high, tone: "text-red-600" },
  ];

  return (
    <AdminShell>
      <PageHeader eyebrow="Operaciones" title="Incidentes" description="Registra, revisa y resuelve incidentes operativos. Los de severidad alta bloquean cambios automáticos de SLA.">
        <Button onClick={openCreate} disabled={routes.length === 0}>
          <Plus className="h-4 w-4" />
          Reportar incidente
        </Button>
      </PageHeader>

      <div className="space-y-6 p-5 lg:p-8">
        <AlertBanner tone="demo" title="Datos locales">
          Los incidentes se guardan en el store local persistente. Aún no hay backend de incidentes conectado.
        </AlertBanner>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{kpi.label}</p>
              <p className={cn("mt-2 text-3xl font-semibold", kpi.tone)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, detalle o zona"
              className="h-11 pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
              Todos
            </FilterChip>
            {STATUS_ORDER.map((status) => (
              <FilterChip key={status} active={statusFilter === status} onClick={() => setStatusFilter(status)}>
                {STATUS_META[status].label}
              </FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={incidents.length === 0 ? ShieldAlert : Search}
            title={incidents.length === 0 ? "Sin incidentes" : "Sin resultados"}
            description={
              incidents.length === 0
                ? "No hay incidentes registrados. Buena señal."
                : "Ningún incidente coincide con la búsqueda o el filtro."
            }
            action={
              incidents.length === 0 ? undefined : (
                <Button size="sm" variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); }}>
                  Limpiar filtros
                </Button>
              )
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Incidente</TableHead>
                  <TableHead>Zona / ruta</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((incident) => {
                  const status = STATUS_META[incident.status];
                  const severity = SEVERITY_META[incident.severity];
                  const zone = routeZone.get(incident.routeId);
                  return (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <p className="font-medium text-[#1d1d1f]">{incident.title}</p>
                        <p className="max-w-md truncate text-xs text-[#86868b]">{incident.detail}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#1d1d1f]">{zone ?? incident.routeId}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={severity.badge}>{severity.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.badge}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize text-[#6e6e73]">{incident.source}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {incident.status === "open" ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Marcar en revisión"
                              title="Marcar en revisión"
                              onClick={() => setIncidentStatus(incident.id, "in_review")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {incident.status !== "resolved" ? (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Resolver"
                              title="Resolver"
                              onClick={() => resolveIncident(incident.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </Button>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Reabrir"
                              title="Reabrir"
                              onClick={() => setIncidentStatus(incident.id, "open")}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Reportar incidente"
        description="Registra un incidente operativo asociado a una ruta."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="incident-form">
              Reportar
            </Button>
          </div>
        }
      >
        <form id="incident-form" onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="incident-route">Ruta</Label>
            <Select
              id="incident-route"
              value={draft.routeId}
              onChange={(event) => setDraft((current) => ({ ...current, routeId: event.target.value }))}
            >
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.zone} · {route.id}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="incident-title">Título</Label>
            <Input
              id="incident-title"
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Acceso bloqueado, dirección incorrecta…"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="incident-detail">Detalle</Label>
            <Textarea
              id="incident-detail"
              value={draft.detail}
              onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))}
              placeholder="Describe qué ocurrió y el contexto…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="incident-severity">Severidad</Label>
            <Select
              id="incident-severity"
              value={draft.severity}
              onChange={(event) => setDraft((current) => ({ ...current, severity: event.target.value as IncidentSeverity }))}
            >
              {SEVERITY_ORDER.map((severity) => (
                <option key={severity} value={severity}>
                  {SEVERITY_META[severity].label}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </Drawer>
    </AdminShell>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
        active ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73] ring-1 ring-[#e5e5ea] hover:text-[#1d1d1f]",
      )}
    >
      {children}
    </button>
  );
}
