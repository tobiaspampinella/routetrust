"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useShallow } from "zustand/react/shallow";
import { Pencil, Phone, Plus, Search, Trash2, Truck, UserRound, X } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Drawer } from "@/components/ui/drawer";
import { Modal } from "@/components/ui/modal";
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
import type { Driver } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

type DriverStatus = Driver["status"];

const STATUS_META: Record<DriverStatus, { label: string; badge: "delivered" | "in_progress" | "paused" | "pending" }> = {
  available: { label: "Disponible", badge: "delivered" },
  on_route: { label: "En ruta", badge: "in_progress" },
  paused: { label: "Pausado", badge: "paused" },
  offline: { label: "Offline", badge: "pending" },
};

const STATUS_ORDER: DriverStatus[] = ["available", "on_route", "paused", "offline"];

interface DriverDraft {
  id: string | null;
  name: string;
  phone: string;
  status: DriverStatus;
}

const EMPTY_DRAFT: DriverDraft = { id: null, name: "", phone: "", status: "available" };

export function AdminDrivers() {
  const { drivers, routes, addDriver, updateDriver, removeDriver } = useRoutePulseStore(
    useShallow((state) => ({
      drivers: state.drivers,
      routes: state.routes,
      addDriver: state.addDriver,
      updateDriver: state.updateDriver,
      removeDriver: state.removeDriver,
    })),
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<DriverDraft>(EMPTY_DRAFT);
  const [pendingDelete, setPendingDelete] = useState<Driver | null>(null);

  const routeZone = useMemo(() => {
    const map = new Map<string, string>();
    routes.forEach((route) => map.set(route.id, route.zone));
    return map;
  }, [routes]);

  const counts = useMemo(() => {
    const base: Record<DriverStatus, number> = { available: 0, on_route: 0, paused: 0, offline: 0 };
    drivers.forEach((driver) => {
      base[driver.status] += 1;
    });
    return base;
  }, [drivers]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return drivers.filter((driver) => {
      if (statusFilter !== "all" && driver.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        driver.name.toLowerCase().includes(needle) ||
        driver.phone.toLowerCase().includes(needle) ||
        driver.id.toLowerCase().includes(needle)
      );
    });
  }, [drivers, query, statusFilter]);

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setDrawerOpen(true);
  }

  function openEdit(driver: Driver) {
    setDraft({ id: driver.id, name: driver.name, phone: driver.phone, status: driver.status });
    setDrawerOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.phone.trim()) return;
    if (draft.id) {
      updateDriver(draft.id, { name: draft.name, phone: draft.phone, status: draft.status });
    } else {
      addDriver({ name: draft.name, phone: draft.phone, status: draft.status });
    }
    setDrawerOpen(false);
  }

  function confirmDelete() {
    if (pendingDelete) removeDriver(pendingDelete.id);
    setPendingDelete(null);
  }

  const kpis = [
    { label: "Total", value: drivers.length, tone: "text-[#1d1d1f]" },
    { label: "Disponibles", value: counts.available, tone: "text-emerald-600" },
    { label: "En ruta", value: counts.on_route, tone: "text-blue-600" },
    { label: "Pausados / offline", value: counts.paused + counts.offline, tone: "text-amber-600" },
  ];

  return (
    <AdminShell>
      <PageHeader eyebrow="Operaciones" title="Conductores" description="Gestiona tu flota de conductores: alta, edición, estado operativo y asignación de ruta.">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo conductor
        </Button>
      </PageHeader>

      <div className="space-y-6 p-5 lg:p-8">
        <AlertBanner tone="demo" title="Datos locales">
          Los conductores se guardan en el navegador (store local persistente). Aún no hay backend de flota conectado.
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
              placeholder="Buscar por nombre, teléfono o ID"
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
            icon={drivers.length === 0 ? Truck : Search}
            title={drivers.length === 0 ? "Sin conductores aún" : "Sin resultados"}
            description={
              drivers.length === 0
                ? "Crea tu primer conductor para empezar a asignar rutas."
                : "Ningún conductor coincide con la búsqueda o el filtro."
            }
            action={
              drivers.length === 0 ? (
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Nuevo conductor
                </Button>
              ) : (
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
                  <TableHead>Conductor</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ruta asignada</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((driver) => {
                  const meta = STATUS_META[driver.status];
                  const zone = driver.assignedRouteId ? routeZone.get(driver.assignedRouteId) : null;
                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73]">
                            <UserRound className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1d1d1f]">{driver.name}</p>
                            <p className="text-xs text-[#86868b]">{driver.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-[#6e6e73]">
                          <Phone className="h-3.5 w-3.5" />
                          {driver.phone}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {driver.assignedRouteId ? (
                          <span className="text-[#1d1d1f]">{zone ?? driver.assignedRouteId}</span>
                        ) : (
                          <span className="text-[#86868b]">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" aria-label={`Editar ${driver.name}`} onClick={() => openEdit(driver)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar ${driver.name}`}
                            disabled={driver.status === "on_route"}
                            title={driver.status === "on_route" ? "No se puede eliminar un conductor en ruta" : undefined}
                            onClick={() => setPendingDelete(driver)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
        title={draft.id ? "Editar conductor" : "Nuevo conductor"}
        description={draft.id ? "Actualiza los datos del conductor." : "Da de alta un conductor en tu flota."}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="driver-form">
              {draft.id ? "Guardar cambios" : "Crear conductor"}
            </Button>
          </div>
        }
      >
        <form id="driver-form" onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="driver-name">Nombre</Label>
            <Input
              id="driver-name"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nombre y apellido"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="driver-phone">Teléfono</Label>
            <Input
              id="driver-phone"
              value={draft.phone}
              onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+54 11 5555 5555"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="driver-status">Estado</Label>
            <Select
              id="driver-status"
              value={draft.status}
              onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as DriverStatus }))}
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {STATUS_META[status].label}
                </option>
              ))}
            </Select>
          </div>
        </form>
      </Drawer>

      <Modal
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Eliminar conductor"
        description={pendingDelete ? `Se eliminará a ${pendingDelete.name}. Esta acción no se puede deshacer.` : ""}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setPendingDelete(null)}>
            <X className="h-4 w-4" />
            Cancelar
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </Modal>
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
