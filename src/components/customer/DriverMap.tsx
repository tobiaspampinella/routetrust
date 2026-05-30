"use client";

import { CustomerTrackingMap3D } from "@/components/customer/CustomerTrackingMap3D";
import type { TrackingProjectionStop } from "@/lib/trackingSimulation";
import type { DeliveryPackage } from "@/lib/types";

export function DriverMap({ packages }: { packages: DeliveryPackage[] }) {
  const visiblePackages = packages.slice(0, 8);
  const stops: TrackingProjectionStop[] = visiblePackages.map((pkg, index) => ({
    id: pkg.id,
    label: pkg.status === "in_progress" ? "Actual" : `Parada ${pkg.sequence}`,
    locality: pkg.locality,
    etaWindow: `${pkg.estimatedArrivalWindowStart} - ${pkg.estimatedArrivalWindowEnd}`,
    minutesFromNow: 0,
    kind: pkg.status === "in_progress" ? "current" : pkg.status === "delivered" ? "after_customer" : "before_customer",
    status: pkg.status,
    x: 18 + ((index * 11) % 66),
    y: 78 - ((index * 9) % 58),
  }));

  const currentIndex = Math.max(
    visiblePackages.findIndex((pkg) => pkg.status === "in_progress" || pkg.status === "pending"),
    0,
  );
  const truckPosition = stops[currentIndex] ? { x: stops[currentIndex].x, y: stops[currentIndex].y } : { x: 24, y: 72 };

  return (
    <div className="h-[240px] overflow-hidden rounded-2xl border border-slate-200 [&_section]:h-[240px] [&_section]:rounded-2xl">
      <CustomerTrackingMap3D stops={stops} truckPosition={truckPosition} routePoints={stops.map((stop) => ({ x: stop.x, y: stop.y }))} />
    </div>
  );
}
