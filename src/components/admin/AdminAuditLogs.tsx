"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { CheckCircle2, FileText, Search, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { AuditAction } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

const ACTION_META: Record<AuditAction, { label: string; badge: "delivered" | "failed"; icon: typeof CheckCircle2 }> = {
  route_approved: { label: "Aprobada", badge: "delivered", icon: CheckCircle2 },
  route_rejected: { label: "Rechazada", badge: "failed", icon: XCircle },
};

const ACTION_ORDER: AuditAction[] = ["route_approved", "route_rejected"];

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminAuditLogs() {
  const auditLogs = useRoutePulseStore(useShallow((state) => state.auditLogs));

  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return auditLogs.filter((entry) => {
      if (actionFilter !== "all" && entry.action !== actionFilter) return false;
      if (!needle) return true;
      return (
        (entry.zone ?? "").toLowerCase().includes(needle) ||
        entry.routeId.toLowerCase().includes(needle) ||
        entry.detail.toLowerCase().includes(needle) ||
        entry.actor.toLowerCase().includes(needle) ||
        (entry.note ?? "").toLowerCase().includes(needle)
      );
    });
  }, [auditLogs, query, actionFilter]);

  const approvedCount = auditLogs.filter((entry) => entry.action === "route_approved").length;
  const rejectedCount = auditLogs.filter((entry) => entry.action === "route_rejected").length;

  const kpis = [
    { label: "Eventos totales", value: auditLogs.length, tone: "text-[#1d1d1f]" },
    { label: "Aprobaciones", value: approvedCount, tone: "text-emerald-600" },
    { label: "Rechazos", value: rejectedCount, tone: "text-red-600" },
  ];

  return (
    <AdminShell>
      <PageHeader eyebrow="Operaciones" title="Audit logs" description="Registro inmutable de decisiones operativas. Cada aprobación o rechazo de ruta queda trazado con responsable y contexto.">
        <Badge variant="outline">{auditLogs.length} eventos</Badge>
      </PageHeader>

      <div className="space-y-6 p-5 lg:p-8">
        <AlertBanner tone="demo" title="Datos locales">
          El audit log se guarda en el store local persistente (últimas 50 decisiones). Aún no hay backend de auditoría conectado.
        </AlertBanner>

        <div className="grid grid-cols-3 gap-4">
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
              placeholder="Buscar por zona, ruta, responsable o nota"
              className="h-11 pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <FilterChip active={actionFilter === "all"} onClick={() => setActionFilter("all")}>
              Todos
            </FilterChip>
            {ACTION_ORDER.map((action) => (
              <FilterChip key={action} active={actionFilter === action} onClick={() => setActionFilter(action)}>
                {ACTION_META[action].label}
              </FilterChip>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={auditLogs.length === 0 ? FileText : Search}
            title={auditLogs.length === 0 ? "Sin eventos de auditoría" : "Sin resultados"}
            description={
              auditLogs.length === 0
                ? "Las decisiones de aprobación de rutas aparecerán aquí. Empieza en Aprobaciones."
                : "Ningún evento coincide con la búsqueda o el filtro."
            }
            action={
              auditLogs.length === 0 ? (
                <Button asChild size="sm">
                  <a href="/admin/approvals">Ir a Aprobaciones</a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { setQuery(""); setActionFilter("all"); }}>
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
                  <TableHead>Evento</TableHead>
                  <TableHead>Zona / ruta</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => {
                  const meta = ACTION_META[entry.action];
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <meta.icon className={cn("h-4 w-4", entry.action === "route_approved" ? "text-emerald-600" : "text-red-600")} />
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-[#1d1d1f]">{entry.zone ?? entry.routeId}</span>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-md text-[#6e6e73]">{entry.detail}</p>
                        {entry.note ? <p className="mt-0.5 max-w-md truncate text-xs italic text-[#86868b]">“{entry.note}”</p> : null}
                      </TableCell>
                      <TableCell>
                        <span className="text-[#1d1d1f]">{entry.actor}</span>
                      </TableCell>
                      <TableCell>
                        <span className="whitespace-nowrap text-sm text-[#6e6e73]">{formatTimestamp(entry.createdAt)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
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
