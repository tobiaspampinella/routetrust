"use client";

import { Navigation, Truck } from "lucide-react";
import type { TrackingProjectionStop, TrackingRoutePoint } from "@/lib/trackingSimulation";
import type { RouteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CustomerTrackingMap3DProps {
  stops: TrackingProjectionStop[];
  truckPosition: {
    x: number;
    y: number;
  };
  routePoints?: TrackingRoutePoint[];
  paused?: boolean;
  started?: boolean;
  routeStatus?: RouteStatus;
  trafficFactor?: number;
}

const streetLabels = [
  { label: "Av. Cabildo", x: 18, y: 28, rotate: -24 },
  { label: "Juramento", x: 52, y: 18, rotate: 14 },
  { label: "Mendoza", x: 62, y: 60, rotate: -18 },
  { label: "Belgrano", x: 10, y: 68, rotate: 22 },
];

function buildRoutePath(points: TrackingRoutePoint[]) {
  if (points.length < 2) return "M8 82 C22 68 26 60 36 54 C48 46 58 40 72 29 C82 21 90 16 96 9";
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ");
}

function stopMarkerLabel(label: string) {
  return label.match(/\d+/)?.[0] ?? "";
}

export function CustomerTrackingMap3D({
  stops,
  truckPosition,
  routePoints = [],
  paused,
  started = true,
  routeStatus = "in_progress",
  trafficFactor = 1,
}: CustomerTrackingMap3DProps) {
  const routePath = buildRoutePath(routePoints);
  const statusLabel = routeStatus === "scheduled" ? "Listo para salir" : routeStatus === "completed" ? "Entregado" : paused ? "Pausado" : "En reparto";

  return (
    <section className="relative h-[470px] overflow-hidden rounded-[34px] bg-[#dfe8ef] shadow-inner">
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-4 text-[12px] font-bold text-slate-800">
        <span>9:41</span>
        <div className="h-6 w-24 rounded-full bg-slate-950" />
        <span>5G</span>
      </div>

      <div className="absolute inset-0 customer-map-sky" />
      <div className="customer-map-plane absolute inset-[-12%]">
        <div className="absolute inset-0 customer-map-grid" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={routePath} className="customer-route-shadow" />
          <path d={routePath} className="customer-route-line" />
          <path d="M18 12 L92 76" className="customer-street-main" />
          <path d="M-4 46 L82 95" className="customer-street-secondary" />
          <path d="M28 -6 L2 95" className="customer-street-secondary" />
          <path d="M58 -2 L25 101" className="customer-street-secondary" />
          <path d="M88 2 L46 104" className="customer-street-secondary" />
          <path d="M2 30 L102 18" className="customer-street-secondary" />
          <path d="M4 64 L104 48" className="customer-street-secondary" />
        </svg>

        {streetLabels.map((street) => (
          <span
            key={street.label}
            className="absolute rounded bg-white/55 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
            style={{ left: `${street.x}%`, top: `${street.y}%`, transform: `rotate(${street.rotate}deg)` }}
          >
            {street.label}
          </span>
        ))}

        {stops.map((stop) => (
          <div
            key={stop.id}
            className={cn(
              "absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-[11px] font-black shadow-lg",
              stop.kind === "customer"
                ? "bg-emerald-500 text-white"
                : stop.status === "delivered"
                  ? "bg-emerald-100 text-emerald-800"
                  : stop.kind === "current"
                    ? "bg-sky-500 text-white"
                    : "bg-white text-slate-700",
            )}
            style={{ left: `${stop.x}%`, top: `${stop.y}%` }}
          >
            {stop.kind === "customer" ? <Navigation className="h-4 w-4" /> : stopMarkerLabel(stop.label)}
          </div>
        ))}

        <div
          className={cn("customer-truck absolute z-30", paused && "customer-truck-paused", !started && "customer-truck-idle")}
          style={{ left: `${truckPosition.x}%`, top: `${truckPosition.y}%` }}
        >
          <div className="customer-truck-shadow" />
          <div className="customer-truck-body">
            <div className="customer-truck-cab">
              <Truck className="h-5 w-5" />
            </div>
            <div className="customer-truck-box" />
          </div>
        </div>
      </div>

      <div className="absolute left-4 top-16 z-40 rounded-2xl border border-white/60 bg-white/85 px-4 py-3 shadow-lg backdrop-blur">
        <p className="text-[11px] font-bold uppercase text-slate-500">Camión en vivo</p>
        <p className="mt-1 text-sm font-black text-slate-950">{statusLabel}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">Tráfico x{trafficFactor.toFixed(2)}</p>
      </div>
    </section>
  );
}
