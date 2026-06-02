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
    <div className="ops-world-grid relative min-h-[260px] overflow-hidden rounded-[1.4rem] border border-white/8 bg-[#111220]">
      <div className="absolute inset-x-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
      <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0e18]/90 px-3 py-2 text-sm font-semibold text-white shadow-sm">
        <Warehouse className="h-4 w-4 text-[#b49bff]" />
        Hub
      </div>
      <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0e18]/90 px-3 py-2 text-sm font-semibold text-white shadow-sm">
        <Navigation className="h-4 w-4 text-[#6ee7f9]" />
        Ruta
      </div>
      <div className="relative z-10 grid min-h-[260px] grid-cols-4 gap-3 p-6 pt-20 sm:grid-cols-6">
        {visibleStops.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#b49bff] text-sm font-bold text-[#090910] shadow-md">
              {item.sequence}
            </div>
            <div className="hidden text-center text-xs text-white/42 sm:block">
              {item.estimatedArrivalWindowStart} - {item.estimatedArrivalWindowEnd}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0e18]/90 px-3 py-2 shadow-sm">
        <PackageCheck className="h-4 w-4 text-white/64" />
        {packages[0] ? <StatusBadge type="package" status={packages[0].status} /> : null}
      </div>
    </div>
  );
}
