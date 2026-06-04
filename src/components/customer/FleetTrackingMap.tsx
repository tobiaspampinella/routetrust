"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Gauge, Navigation, Radio, Route, ShieldCheck, Truck } from "lucide-react";
import {
  coordinateAtProgress,
  demoRouteOrigin,
  formatLatLng,
  getDemoRouteCoordinates,
  type LatLng,
} from "@/lib/demoMapCoordinates";
import type { TrackingProjectionStop } from "@/lib/trackingSimulation";
import type { DeliveryPackage, MapProviderMode, RouteStatus, TrackingDemoStop } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FleetTrackingMapProps {
  demoStops: TrackingDemoStop[];
  stops: TrackingProjectionStop[];
  truckPosition: {
    x: number;
    y: number;
  };
  packages?: DeliveryPackage[];
  order?: DeliveryPackage;
  paused?: boolean;
  started?: boolean;
  routeStatus?: RouteStatus;
  trafficFactor?: number;
  liveEtaMinutes?: number;
  orderEtaWindow?: string;
  progress?: number;
  providerMode?: MapProviderMode;
  providerStatus?: string;
  compact?: boolean;
}

type GoogleMapsApi = {
  maps: {
    DirectionsRenderer: new (options?: Record<string, unknown>) => GoogleDirectionsRenderer;
    DirectionsService: new () => GoogleDirectionsService;
    LatLngBounds: new () => GoogleLatLngBounds;
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    Marker: new (options: Record<string, unknown>) => GoogleMarker;
    Point: new (x: number, y: number) => unknown;
    Size: new (width: number, height: number) => unknown;
    TrafficLayer: new () => GoogleLayer;
    TrafficModel: {
      BEST_GUESS: string;
    };
    TravelMode: {
      DRIVING: string;
    };
  };
};

type GoogleMap = {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
  panTo: (position: LatLng) => void;
};

type GoogleLayer = {
  setMap: (map: GoogleMap | null) => void;
};

type GoogleMarker = {
  setMap: (map: GoogleMap | null) => void;
  setPosition: (position: LatLng) => void;
};

type GoogleDirectionsRenderer = {
  setDirections: (result: unknown) => void;
  setMap: (map: GoogleMap | null) => void;
};

type GoogleDirectionsResult = {
  routes?: Array<{
    overview_path?: Array<{
      lat: () => number;
      lng: () => number;
    }>;
  }>;
};

type GoogleDirectionsService = {
  route: (
    request: Record<string, unknown>,
    callback: (result: GoogleDirectionsResult | null, status: string) => void,
  ) => void;
};

type GoogleLatLngBounds = {
  extend: (position: LatLng) => void;
};

type GoogleMapsWindow = Window & {
  google?: GoogleMapsApi;
  __routePulseGoogleMapsPromise?: Promise<GoogleMapsApi>;
};

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

const trafficLabels: Record<string, string> = {
  low: "Fluido",
  medium: "Moderado",
  high: "Pesado",
};

function getGoogleMapsWindow() {
  return window as GoogleMapsWindow;
}

function loadGoogleMaps(apiKey: string) {
  const mapsWindow = getGoogleMapsWindow();
  if (mapsWindow.google?.maps) return Promise.resolve(mapsWindow.google);
  if (mapsWindow.__routePulseGoogleMapsPromise) return mapsWindow.__routePulseGoogleMapsPromise;

  mapsWindow.__routePulseGoogleMapsPromise = new Promise<GoogleMapsApi>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-routepulse-google-maps]");

    if (existingScript) {
      existingScript.addEventListener("load", () => (mapsWindow.google?.maps ? resolve(mapsWindow.google) : reject(new Error("Google Maps no disponible"))));
      existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.routepulseGoogleMaps = "true";
    script.onload = () => (mapsWindow.google?.maps ? resolve(mapsWindow.google) : reject(new Error("Google Maps no disponible")));
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  return mapsWindow.__routePulseGoogleMapsPromise;
}

function truckIconDataUrl(paused?: boolean) {
  const body = paused ? "#f59e0b" : "#0f172a";
  const accent = paused ? "#fef3c7" : "#ffffff";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76">
  <filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="7" stdDeviation="4" flood-color="#0f172a" flood-opacity=".35"/></filter>
  <g filter="url(#s)" transform="rotate(-18 38 38)">
    <rect x="15" y="25" width="42" height="27" rx="10" fill="${body}"/>
    <rect x="22" y="18" width="25" height="12" rx="6" fill="${accent}"/>
    <rect x="44" y="30" width="10" height="15" rx="4" fill="#38bdf8"/>
    <circle cx="25" cy="54" r="5" fill="#111827"/>
    <circle cx="49" cy="54" r="5" fill="#111827"/>
  </g>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getRouteStatusLabel(status: RouteStatus, paused?: boolean) {
  if (paused) return "Pausado · ETA recalculando";
  if (status === "completed") return "Entregado";
  if (status === "scheduled") return "Listo para iniciar";
  return "Vehiculo en reparto";
}

function getProviderLabel(useGoogleMap: boolean, providerMode?: MapProviderMode) {
  if (useGoogleMap) return "Google Maps + trafico";
  if (providerMode === "maplibre_osm_ready") return "MapLibre mock fallback";
  if (providerMode === "apple_mapkit_ready") return "Apple MapKit pendiente";
  return "Fallback local sin API key";
}

function isDeliveryPackage(stop: DeliveryPackage | TrackingProjectionStop): stop is DeliveryPackage {
  return "trackingCode" in stop;
}

function pointForCoordinate(coordinate: LatLng, coordinates: LatLng[]) {
  const lats = coordinates.map((item) => item.lat);
  const lngs = coordinates.map((item) => item.lng);
  const minLat = Math.min(...lats) - 0.004;
  const maxLat = Math.max(...lats) + 0.004;
  const minLng = Math.min(...lngs) - 0.006;
  const maxLng = Math.max(...lngs) + 0.006;
  const x = ((coordinate.lng - minLng) / Math.max(maxLng - minLng, 0.001)) * 100;
  const y = 100 - ((coordinate.lat - minLat) / Math.max(maxLat - minLat, 0.001)) * 100;

  return {
    x: Math.min(Math.max(x, 8), 92),
    y: Math.min(Math.max(y, 10), 88),
  };
}

function buildPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

export function FleetTrackingMap({
  demoStops,
  stops,
  truckPosition,
  packages = [],
  order,
  paused,
  started = true,
  routeStatus = "in_progress",
  trafficFactor = 1,
  liveEtaMinutes = 0,
  orderEtaWindow = "--:--",
  progress = 0,
  providerMode = "google_maps_ready",
  providerStatus,
  compact,
}: FleetTrackingMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const directionsRendererRef = useRef<GoogleDirectionsRenderer | null>(null);
  const directionsServiceRef = useRef<GoogleDirectionsService | null>(null);
  const trafficLayerRef = useRef<GoogleLayer | null>(null);
  const truckMarkerRef = useRef<GoogleMarker | null>(null);
  const stopMarkersRef = useRef<GoogleMarker[]>([]);
  const googleRoutePathRef = useRef<LatLng[]>([]);
  const [googleStatus, setGoogleStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const routeCoordinates = useMemo(() => getDemoRouteCoordinates(demoStops), [demoStops]);
  const currentCoordinate = useMemo(() => coordinateAtProgress(routeCoordinates, progress), [progress, routeCoordinates]);
  const routeSignature = useMemo(
    () => routeCoordinates.map((coordinate) => `${coordinate.lat.toFixed(5)},${coordinate.lng.toFixed(5)}`).join("|"),
    [routeCoordinates],
  );
  const useGoogleMap = Boolean(googleMapsApiKey) && providerMode === "google_maps_ready" && googleStatus !== "error";
  const projectedStops = packages.length ? packages.filter((item) => item.status !== "delivered").slice(0, 4) : [];
  const activeStop = projectedStops[0] ?? order;
  const providerLabel = getProviderLabel(useGoogleMap && googleStatus === "ready", providerMode);
  const routeHealth = paused ? "Pausa impactando ETA" : trafficFactor > 1.34 ? "Riesgo por trafico" : trafficFactor > 1.12 ? "Atencion operativa" : "En tiempo";
  const routePoints = routeCoordinates.map((coordinate) => pointForCoordinate(coordinate, routeCoordinates));
  const routePath = buildPath(routePoints);
  const localTruckPoint = started ? pointForCoordinate(currentCoordinate, routeCoordinates) : truckPosition;

  useEffect(() => {
    if (!useGoogleMap || !mapElementRef.current) return;

    let cancelled = false;
    setGoogleStatus("loading");

    loadGoogleMaps(googleMapsApiKey)
      .then((google) => {
        if (cancelled || !mapElementRef.current) return;

        if (!mapRef.current) {
          mapRef.current = new google.maps.Map(mapElementRef.current, {
            center: demoRouteOrigin,
            clickableIcons: false,
            disableDefaultUI: true,
            gestureHandling: "greedy",
            mapTypeControl: false,
            mapTypeId: "roadmap",
            streetViewControl: false,
            tilt: 45,
            zoom: 14,
            styles: [
              { featureType: "poi.business", stylers: [{ visibility: "off" }] },
              { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ saturation: -20 }, { lightness: 18 }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#d9eaf7" }] },
            ],
          });
          trafficLayerRef.current = new google.maps.TrafficLayer();
          trafficLayerRef.current.setMap(mapRef.current);
          directionsRendererRef.current = new google.maps.DirectionsRenderer({
            markerOptions: { visible: false },
            preserveViewport: false,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#10a37f",
              strokeOpacity: 0.92,
              strokeWeight: 6,
            },
          });
          directionsRendererRef.current.setMap(mapRef.current);
          directionsServiceRef.current = new google.maps.DirectionsService();
          truckMarkerRef.current = new google.maps.Marker({
            icon: {
              anchor: new google.maps.Point(28, 28),
              scaledSize: new google.maps.Size(56, 56),
              url: truckIconDataUrl(false),
            },
            map: mapRef.current,
            optimized: true,
            position: demoRouteOrigin,
            title: "Vehiculo demo RoutePulse",
          });
        }

        setGoogleStatus("ready");
      })
      .catch(() => setGoogleStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [useGoogleMap]);

  useEffect(() => {
    const mapsWindow = typeof window === "undefined" ? undefined : getGoogleMapsWindow();
    const google = mapsWindow?.google;

    if (!useGoogleMap || googleStatus !== "ready" || !google?.maps || !mapRef.current || !directionsRendererRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    routeCoordinates.forEach((coordinate) => bounds.extend(coordinate));
    mapRef.current.fitBounds(bounds, 34);

    stopMarkersRef.current.forEach((marker) => marker.setMap(null));
    stopMarkersRef.current = routeCoordinates.slice(1).map((coordinate, index) => {
      const isCustomer = index === routeCoordinates.length - 2;
      return new google.maps.Marker({
        icon: {
          fillColor: isCustomer ? "#10b981" : "#10a37f",
          fillOpacity: 1,
          path: "M 0,0 m -10,0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0",
          scale: isCustomer ? 1.15 : 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
        },
        label: {
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "800",
          text: isCustomer ? "T" : String(index + 1),
        },
        map: mapRef.current,
        position: coordinate,
        title: demoStops[index]?.customerName ?? `Parada ${index + 1}`,
      });
    });

    if (!directionsServiceRef.current || routeCoordinates.length < 2) return;

    directionsServiceRef.current.route(
      {
        destination: routeCoordinates[routeCoordinates.length - 1],
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
        origin: routeCoordinates[0],
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: routeCoordinates.slice(1, -1).map((coordinate) => ({
          location: coordinate,
          stopover: true,
        })),
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
          googleRoutePathRef.current =
            result.routes?.[0]?.overview_path?.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            })) ?? routeCoordinates;
        } else {
          googleRoutePathRef.current = routeCoordinates;
        }
      },
    );
  }, [demoStops, googleStatus, routeCoordinates, routeSignature, useGoogleMap]);

  useEffect(() => {
    if (!useGoogleMap || googleStatus !== "ready" || !truckMarkerRef.current) return;

    const path = googleRoutePathRef.current.length > 1 ? googleRoutePathRef.current : routeCoordinates;
    const nextPosition = started ? coordinateAtProgress(path, progress) : routeCoordinates[0];
    truckMarkerRef.current.setPosition(nextPosition);
    mapRef.current?.panTo(nextPosition);
  }, [googleStatus, progress, routeCoordinates, started, useGoogleMap]);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[34px] bg-[#0b1220] text-white shadow-2xl",
        compact ? "h-[500px]" : "min-h-[660px] lg:h-[720px]",
      )}
    >
      <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-6 pt-4 text-[12px] font-bold text-white/80">
        <span>9:41</span>
        <div className="h-6 w-28 rounded-full bg-black shadow-inner" />
        <span>5G</span>
      </div>

      {useGoogleMap ? (
        <div ref={mapElementRef} className="absolute inset-0 bg-slate-200" />
      ) : (
        <LocalFleetMap
          demoStops={demoStops}
          routePath={routePath}
          routePoints={routePoints}
          started={started}
          truckPoint={localTruckPoint}
          paused={paused}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45" />

      <div className="absolute left-4 right-4 top-14 z-40 flex flex-wrap items-start justify-between gap-3">
        <div className="rounded-[24px] border border-white/20 bg-black/62 px-4 py-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-white/60">
            <Radio className={cn("h-3.5 w-3.5", started && !paused ? "text-emerald-300" : "text-amber-300")} />
            Live fleet tracking
          </div>
          <p className="mt-1 text-base font-black">{getRouteStatusLabel(routeStatus, paused)}</p>
          <p className="mt-1 text-xs font-semibold text-white/65">{formatLatLng(currentCoordinate)}</p>
        </div>

        <div className="rounded-[24px] border border-white/20 bg-white/92 px-4 py-3 text-right text-[#1d1d1f] shadow-xl backdrop-blur-xl">
          <p className="text-[11px] font-bold uppercase text-[#6e6e73]">Proveedor</p>
          <p className="mt-1 text-sm font-black">{providerLabel}</p>
          <p className="mt-1 text-xs font-semibold text-[#86868b]">
            {useGoogleMap && googleStatus === "loading" ? "Cargando mapa..." : useGoogleMap && googleStatus === "ready" ? "Trafico real activo" : "API key pendiente"}
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-40 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/20 bg-white/94 p-4 text-[#1d1d1f] shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase text-[#6e6e73]">ETA cliente</p>
              <p className="mt-1 text-3xl font-black tracking-normal">{orderEtaWindow}</p>
              <p className="mt-2 text-sm font-semibold text-[#6e6e73]">
                {liveEtaMinutes > 0 ? `${liveEtaMinutes} min restantes · ${projectedStops.length} paradas visibles` : "Entrega finalizada"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#eaf4ff] px-4 py-3 text-right">
              <p className="text-[11px] font-bold uppercase text-[#10a37f]">Estado ruta</p>
              <p className="mt-1 text-sm font-black text-[#1d1d1f]">{routeHealth}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FleetMetric icon={Truck} label="Unidad" value="RP-DEMO-01" />
            <FleetMetric icon={Gauge} label="Trafico" value={`x${trafficFactor.toFixed(2)}`} />
            <FleetMetric icon={Clock} label="Drop-off" value={`${activeStop?.dropoffTimeMinutes ?? demoStops[0]?.dropoffMinutes ?? 6} min`} />
            <FleetMetric icon={ShieldCheck} label="Privacidad" value="Anonimizado" />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/20 bg-black/70 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase text-white/50">Siguientes 4 paradas</p>
              <p className="mt-1 text-sm font-semibold text-white/80">ETA, trafico y drop-off por ubicacion</p>
            </div>
            <Route className="h-5 w-5 text-brand-100" />
          </div>

          <div className="mt-3 space-y-2">
            {(projectedStops.length ? projectedStops : stops).slice(0, 4).map((stop, index) => {
              let stopTitle: string;
              let stopMeta: string;
              let stopEta: string;

              if (isDeliveryPackage(stop)) {
                stopTitle = stop.id === order?.id ? "Tu entrega" : "Parada protegida";
                stopMeta = `${stop.locality} · drop-off ${stop.dropoffTimeMinutes} min`;
                stopEta = `${stop.estimatedArrivalWindowStart}-${stop.estimatedArrivalWindowEnd}`;
              } else {
                stopTitle = stop.label;
                stopMeta = stop.locality;
                stopEta = stop.etaWindow;
              }

              const traffic = demoStops[Math.min(index, demoStops.length - 1)]?.trafficLevel ?? "medium";
              return (
                <div key={stop.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-black",
                      index === 0 ? "bg-brand-600 text-slate-950" : "bg-white/15 text-white",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{stopTitle}</p>
                    <p className="truncate text-xs font-semibold text-white/55">{stopMeta}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{stopEta}</p>
                    <p className="text-[10px] font-bold uppercase text-white/45">{trafficLabels[traffic]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!useGoogleMap ? (
        <div className="absolute left-4 right-4 top-36 z-40 rounded-2xl border border-amber-200/40 bg-amber-50/95 px-4 py-3 text-xs font-semibold leading-5 text-amber-900 shadow-xl backdrop-blur lg:left-auto lg:max-w-sm">
          {providerStatus ??
            "Demo local activo. Para calles reales, rutas y trafico vivo configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY y reinicia npm run dev."}
        </div>
      ) : null}
    </section>
  );
}

function LocalFleetMap({
  demoStops,
  routePath,
  routePoints,
  truckPoint,
  paused,
  started,
}: {
  demoStops: TrackingDemoStop[];
  routePath: string;
  routePoints: Array<{ x: number; y: number }>;
  truckPoint: { x: number; y: number };
  paused?: boolean;
  started?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#e8edf2]">
      <div className="absolute inset-[-10%] fleet-map-plane">
        <div className="absolute inset-0 fleet-map-grid" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M8 12 L96 88" className="fleet-street fleet-street-main" />
          <path d="M4 45 L96 30" className="fleet-street" />
          <path d="M9 71 L92 55" className="fleet-street" />
          <path d="M20 0 L36 100" className="fleet-street" />
          <path d="M55 0 L69 100" className="fleet-street" />
          <path d="M84 0 L72 100" className="fleet-street" />
          <path d={routePath} className="fleet-route-shadow" />
          <path d={routePath} className="fleet-route-line" />
        </svg>

        {[
          { label: "Av. Cabildo", x: 29, y: 35, rotate: -14 },
          { label: "Juramento", x: 48, y: 44, rotate: 12 },
          { label: "Mendoza", x: 61, y: 58, rotate: -7 },
          { label: "Av. del Libertador", x: 54, y: 22, rotate: 18 },
        ].map((street) => (
          <span
            key={street.label}
            className="absolute rounded-md bg-white/80 px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm"
            style={{ left: `${street.x}%`, top: `${street.y}%`, transform: `rotate(${street.rotate}deg)` }}
          >
            {street.label}
          </span>
        ))}

        {routePoints.slice(1).map((point, index) => {
          const isCustomer = index === demoStops.length - 1;
          return (
            <div
              key={demoStops[index]?.id ?? index}
              className={cn(
                "absolute z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-[11px] font-black shadow-xl",
                isCustomer ? "bg-emerald-500 text-white" : "bg-brand-600 text-white",
              )}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            >
              {isCustomer ? <Navigation className="h-4 w-4" /> : index + 1}
            </div>
          );
        })}

        <div
          className={cn("customer-truck absolute z-30", paused && "customer-truck-paused", !started && "customer-truck-idle")}
          style={{ left: `${truckPoint.x}%`, top: `${truckPoint.y}%` }}
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
    </div>
  );
}

function FleetMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] px-3 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#86868b]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-black text-[#1d1d1f]">{value}</p>
    </div>
  );
}
