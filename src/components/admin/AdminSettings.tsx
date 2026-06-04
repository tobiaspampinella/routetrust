"use client";

import { useEffect, useState, type ReactNode } from "react";
import { RotateCcw, Save } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SystemSettings } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

export function AdminSettings() {
  const settings = useRoutePulseStore((state) => state.settings);
  const updateSettings = useRoutePulseStore((state) => state.updateSettings);
  const resetDemo = useRoutePulseStore((state) => state.resetDemo);
  const [draft, setDraft] = useState<SystemSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function setValue<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    updateSettings(draft);
    setSaved(true);
  }

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Configuracion"
        title="Settings operativos"
        description="Estos valores mock afectan ETA, riesgo, cumplimiento estimado y cierre operativo."
      >
        {saved ? <span className="text-sm font-semibold text-emerald-700">Cambios guardados</span> : null}
      </PageHeader>
      <div className="p-5 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuracion del sitio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Nombre de la empresa">
                <Input value={draft.companyName} onChange={(event) => setValue("companyName", event.target.value)} />
              </Field>
              <Field label="Direccion del almacen">
                <Input value={draft.warehouseAddress} onChange={(event) => setValue("warehouseAddress", event.target.value)} />
              </Field>
              <Field label="Hora inicio operacion">
                <Input type="time" value={draft.operationStartTime} onChange={(event) => setValue("operationStartTime", event.target.value)} />
              </Field>
              <Field label="Hora objetivo de cierre">
                <Input type="time" value={draft.targetCloseTime} onChange={(event) => setValue("targetCloseTime", event.target.value)} />
              </Field>
              <Field label="SLA objetivo %">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={draft.targetSlaPercent}
                  onChange={(event) => setValue("targetSlaPercent", Number(event.target.value))}
                />
              </Field>
              <Field label="Tolerancia por entrega">
                <Input
                  type="number"
                  min={1}
                  value={draft.deliveryToleranceMinutes}
                  onChange={(event) => setValue("deliveryToleranceMinutes", Number(event.target.value))}
                />
              </Field>
              <Field label="Drop-off base">
                <Input
                  type="number"
                  min={1}
                  value={draft.baseDropoffMinutes}
                  onChange={(event) => setValue("baseDropoffMinutes", Number(event.target.value))}
                />
              </Field>
              <Field label="Drop-off promedio operativo">
                <Input
                  type="number"
                  min={1}
                  value={draft.averageDropoffMinutes}
                  onChange={(event) => setValue("averageDropoffMinutes", Number(event.target.value))}
                />
              </Field>
              <Field label="Pausa maxima esperada">
                <Input
                  type="number"
                  min={1}
                  value={draft.maxExpectedPauseMinutes}
                  onChange={(event) => setValue("maxExpectedPauseMinutes", Number(event.target.value))}
                />
              </Field>
              <Field label="Capacidad promedio por unidad">
                <Input
                  type="number"
                  min={1}
                  value={draft.averageUnitCapacity}
                  onChange={(event) => setValue("averageUnitCapacity", Number(event.target.value))}
                />
              </Field>
              <Field label="Zona operativa">
                <Input value={draft.operatingZone} onChange={(event) => setValue("operatingZone", event.target.value)} />
              </Field>
              <Field label="Moneda">
                <Input value={draft.currency} onChange={(event) => setValue("currency", event.target.value)} />
              </Field>
              <Field label="Idioma">
                <Input value={draft.language} onChange={(event) => setValue("language", event.target.value)} />
              </Field>
              <Field label="Pais / mercado objetivo">
                <Input value={draft.countryMarket} onChange={(event) => setValue("countryMarket", event.target.value)} />
              </Field>
              <div className="rounded-lg border border-border bg-slate-50 p-4">
                <Label className="mb-3 block">Modo simulacion</Label>
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-white px-4 py-3">
                  <span className="text-sm font-semibold text-slate-800">{draft.simulationMode ? "Activo" : "Inactivo"}</span>
                  <input
                    type="checkbox"
                    checked={draft.simulationMode}
                    onChange={(event) => setValue("simulationMode", event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-brand-600"
                  />
                </label>
              </div>
              <ToggleField label="Modo predictivo" value={draft.predictiveMode} onChange={(value) => setValue("predictiveMode", value)} />
              <ToggleField label="Calculo de riesgo" value={draft.riskCalculationEnabled} onChange={(value) => setValue("riskCalculationEnabled", value)} />
              <ToggleField label="Tracking cliente" value={draft.customerTrackingEnabled} onChange={(value) => setValue("customerTrackingEnabled", value)} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={saveSettings}>
                <Save className="h-4 w-4" />
                Guardar configuracion
              </Button>
              <Button variant="outline" onClick={resetDemo}>
                <RotateCcw className="h-4 w-4" />
                Reiniciar demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="rounded-lg border border-border bg-slate-50 p-4">
      <Label className="mb-3 block">{label}</Label>
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-border bg-white px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">{value ? "Activo" : "Inactivo"}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-brand-600"
        />
      </label>
    </div>
  );
}
