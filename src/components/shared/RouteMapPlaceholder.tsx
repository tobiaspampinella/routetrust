import { Navigation, PackageCheck, Warehouse } from "lucide-react";
import type { DeliveryPackage } from "@/lib/types";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface RouteMapPlaceholderProps {
  packages: DeliveryPackage[];
  compact?: boolean;
}

export function RouteMapPlaceholder({ packages, compact = false }: RouteMapPlaceholderProps) {
  const visibleStops = packages.slice(0, compact ? 8 : 12);

  return (
    <div className="route-grid relative min-h-[260px] overflow-hidden rounded-lg border border-border bg-white">
      <div className="absolute inset-x-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
        <Warehouse className="h-4 w-4 text-sky-700" />
        Hub
      </div>
      <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm">
        <Navigation className="h-4 w-4 text-emerald-700" />
        Ruta
      </div>
      <div className="relative z-10 grid min-h-[260px] grid-cols-4 gap-3 p-6 pt-20 sm:grid-cols-6">
        {visibleStops.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-sm font-bold text-white shadow-md">
              {item.sequence}
            </div>
            <div className="hidden text-center text-xs text-slate-500 sm:block">
              {item.estimatedArrivalWindowStart} - {item.estimatedArrivalWindowEnd}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2 shadow-sm">
        <PackageCheck className="h-4 w-4 text-slate-600" />
        {packages[0] ? <StatusBadge type="package" status={packages[0].status} /> : null}
      </div>
    </div>
  );
}
