import { CheckCircle2, Clock, MapPin, Navigation, PackageCheck, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrackingStep = "prepared" | "assigned" | "on_the_way" | "delivered";

const STEPS: Array<{ key: TrackingStep; label: string; icon: LucideIcon; hint: string }> = [
  { key: "prepared", label: "Pedido preparado", icon: PackageCheck, hint: "Tu pedido fue empaquetado." },
  { key: "assigned", label: "Conductor asignado", icon: MapPin, hint: "Un conductor tomó tu entrega." },
  { key: "on_the_way", label: "En camino", icon: Navigation, hint: "El conductor va hacia tu dirección." },
  { key: "delivered", label: "Entregado", icon: CheckCircle2, hint: "Tu pedido llegó a destino." },
];

/**
 * MercadoLibre-style vertical delivery timeline. Shows the order journey with the current
 * state highlighted. `activeStep` is the index of the current step (0..3). `delayed` marks the
 * in-transit step as running late; `failed` turns the last step into an incident state.
 */
export function TrackingTimeline({
  activeStep,
  delayed = false,
  failed = false,
  etaWindow,
}: {
  activeStep: number;
  delayed?: boolean;
  failed?: boolean;
  etaWindow?: string;
}) {
  return (
    <div className="rounded-3xl border border-[#e5e5ea] bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#1d1d1f]">Estado del envío</h2>
        {delayed && !failed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Demorado
          </span>
        ) : null}
      </div>

      <ol className="mt-4">
        {STEPS.map((step, index) => {
          const isLast = index === STEPS.length - 1;
          const isIncident = failed && isLast;
          const done = index < activeStep;
          const current = index === activeStep;
          const Icon = isIncident ? Clock : step.icon;

          const dotClass = isIncident
            ? "bg-red-500 text-white ring-red-100"
            : done
              ? "bg-emerald-500 text-white ring-emerald-100"
              : current
                ? "bg-[#10a37f] text-white ring-brand-100"
                : "bg-[#f0f0f3] text-[#86868b] ring-transparent";

          const lineClass = index < activeStep ? "bg-emerald-400" : "bg-[#e5e5ea]";

          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? <span className={cn("absolute left-[15px] top-9 h-[calc(100%-1.75rem)] w-0.5", lineClass)} /> : null}
              <span className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4", dotClass)}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className={cn("text-sm font-semibold", current || done || isIncident ? "text-[#1d1d1f]" : "text-[#86868b]")}>
                  {isIncident ? "Incidente reportado" : step.label}
                </p>
                <p className="mt-0.5 text-xs text-[#86868b]">
                  {isIncident ? "Hubo un problema con la entrega. Soporte te contactará." : step.hint}
                </p>
                {current && step.key === "on_the_way" && etaWindow ? (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs font-semibold text-[#1d1d1f]">
                    <Clock className="h-3.5 w-3.5 text-[#10a37f]" />
                    Llega {etaWindow}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
