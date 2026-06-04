"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Check, CheckCircle2, Pencil, Sparkles, X, XCircle } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Drawer } from "@/components/ui/drawer";
import { AlertBanner } from "@/components/ui/alert-banner";
import { EmptyState } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { useRoutePulseStore } from "@/store/routePulseStore";

const RISK_BADGE: Record<string, "risk_low" | "risk_medium" | "risk_high"> = {
  low: "risk_low",
  medium: "risk_medium",
  high: "risk_high",
};

const RISK_LABEL: Record<string, string> = { low: "Bajo", medium: "Medio", high: "Alto" };

export function AdminApprovals() {
  const { routes, drivers, auditLogs, dismissedApprovals, approveRouteSuggestion, rejectRouteSuggestion } =
    useRoutePulseStore(
      useShallow((state) => ({
        routes: state.routes,
        drivers: state.drivers,
        auditLogs: state.auditLogs,
        dismissedApprovals: state.dismissedApprovals,
        approveRouteSuggestion: state.approveRouteSuggestion,
        rejectRouteSuggestion: state.rejectRouteSuggestion,
      })),
    );

  const [modifyRouteId, setModifyRouteId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const driverName = useMemo(() => {
    const map = new Map<string, string>();
    drivers.forEach((driver) => map.set(driver.id, driver.name));
    return map;
  }, [drivers]);

  const queue = useMemo(
    () =>
      routes.filter(
        (route) => (route.suggestedReassignments?.length ?? 0) > 0 && !dismissedApprovals.includes(route.id),
      ),
    [routes, dismissedApprovals],
  );

  const approvedCount = auditLogs.filter((entry) => entry.action === "route_approved").length;
  const rejectedCount = auditLogs.filter((entry) => entry.action === "route_rejected").length;

  function openModify(routeId: string) {
    setModifyRouteId(routeId);
    setNote("");
  }

  function confirmModify() {
    if (modifyRouteId) approveRouteSuggestion(modifyRouteId, note);
    setModifyRouteId(null);
    setNote("");
  }

  const kpis = [
    { label: "Pendientes", value: queue.length, tone: "text-[#1d1d1f]" },
    { label: "Aprobadas", value: approvedCount, tone: "text-emerald-600" },
    { label: "Rechazadas", value: rejectedCount, tone: "text-red-600" },
    { label: "Decisiones registradas", value: auditLogs.length, tone: "text-brand" },
  ];

  return (
    <AdminShell>
      <PageHeader eyebrow="Operaciones" title="Aprobaciones" description="La AI sugiere. El humano aprueba. Revisa cada sugerencia de ruta y decide: aprobar, modificar o rechazar.">
        <Badge variant="in_progress">
          <Sparkles className="mr-1 h-3.5 w-3.5" />
          AI suggests · Human approves
        </Badge>
      </PageHeader>

      <div className="space-y-6 p-5 lg:p-8">
        <AlertBanner tone="demo" title="Datos locales">
          Las decisiones se registran en el audit log local persistente. Cada aprobación reasigna y recalcula la ruta en vivo.
        </AlertBanner>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-[#e5e5ea] bg-white p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{kpi.label}</p>
              <p className={cn("mt-2 text-3xl font-semibold", kpi.tone)}>{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          {/* Queue */}
          <div className="space-y-4">
            {queue.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Sin sugerencias pendientes"
                description="No hay rutas con sugerencias de la AI esperando aprobación."
              />
            ) : (
              queue.map((route) => {
                const risk = route.manualRisk?.replace("risk_", "") ?? route.riskLevel;
                return (
                  <div key={route.id} className="rounded-3xl border border-[#e5e5ea] bg-white p-6 shadow-soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">
                          {route.zone} · {route.id}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#1d1d1f]">Sugerencia de reasignación</h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0b0f14] px-3 py-1 text-xs font-semibold text-[#19c37d]">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI propuesta
                      </span>
                    </div>

                    <p className="mt-4 rounded-2xl bg-[#f5f5f7] p-4 text-sm leading-6 text-[#1d1d1f]">
                      {route.suggestedReassignments[0]}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Metric label="Conductor" value={driverName.get(route.driverId) ?? route.driverId} />
                      <Metric label="Paradas" value={String(route.packageIds.length)} />
                      <Metric label="SLA proyectado" value={`${Math.round(route.projectedSlaCompliance)}%`} />
                      <Metric label="Riesgo" value={<Badge variant={RISK_BADGE[risk] ?? "risk_medium"}>{RISK_LABEL[risk] ?? risk}</Badge>} />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button variant="success" onClick={() => approveRouteSuggestion(route.id)}>
                        <Check className="h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button variant="outline" onClick={() => openModify(route.id)}>
                        <Pencil className="h-4 w-4" />
                        Modificar / nota
                      </Button>
                      <Button variant="ghost" onClick={() => rejectRouteSuggestion(route.id)}>
                        <X className="h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Audit history */}
          <div className="rounded-3xl border border-[#e5e5ea] bg-white p-6 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#86868b]">Historial de decisiones</h3>
            {auditLogs.length === 0 ? (
              <p className="mt-4 text-sm text-[#86868b]">Aún no hay decisiones registradas.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {auditLogs.slice(0, 12).map((entry) => (
                  <li key={entry.id} className="border-b border-[#f0f0f3] pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      {entry.action === "route_approved" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-[#1d1d1f]">{entry.zone ?? entry.routeId}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#6e6e73]">{entry.detail}</p>
                    {entry.note ? <p className="mt-1 text-xs italic text-[#86868b]">“{entry.note}”</p> : null}
                    <p className="mt-1 text-[11px] text-[#86868b]">{entry.actor}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={modifyRouteId !== null}
        onOpenChange={(open) => !open && setModifyRouteId(null)}
        title="Modificar y aprobar"
        description="Añade una nota de auditoría antes de aprobar la sugerencia."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModifyRouteId(null)}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmModify}>
              <Check className="h-4 w-4" />
              Aprobar con nota
            </Button>
          </div>
        }
      >
        <div className="space-y-1.5">
          <Label htmlFor="approval-note">Nota de auditoría</Label>
          <Textarea
            id="approval-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Motivo de la decisión, cambios manuales, contexto…"
            autoFocus
          />
        </div>
      </Drawer>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#f0f0f3] bg-[#fbfbfd] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#1d1d1f]">{value}</div>
    </div>
  );
}
