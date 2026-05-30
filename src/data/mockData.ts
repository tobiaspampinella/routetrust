import type { DeliveryPackage, OperationalRisk, RoutePulseData, ZoneProfile } from "@/lib/types";
import { addMinutesToTime } from "@/lib/etaCalculations";

export const zoneProfiles: ZoneProfile[] = [
  {
    name: "CABA Norte",
    averageDropoffMinutes: 7,
    trafficFactor: 1.08,
    failedDeliveryRate: 0.05,
    parkingDifficulty: "medium",
  },
  {
    name: "GBA Oeste",
    averageDropoffMinutes: 11,
    trafficFactor: 1.24,
    failedDeliveryRate: 0.11,
    parkingDifficulty: "high",
  },
  {
    name: "Rosario Centro",
    averageDropoffMinutes: 8,
    trafficFactor: 1.12,
    failedDeliveryRate: 0.07,
    parkingDifficulty: "medium",
  },
];

const routeDefinitions = [
  {
    id: "route-001",
    driverId: "driver-001",
    vehicleId: "unit-001",
    zone: "CABA Norte",
    status: "in_progress" as const,
    startedAt: "08:05",
    currentStopSequence: 7,
    totalPausedMinutes: 0,
    pauseMinutes: 0,
    extraDelayMinutes: 0,
    delayMinutes: 6,
    riskLevel: "low" as OperationalRisk,
    estimatedCloseTime: "17:28",
    projectedSlaCompliance: 94,
    suggestedReassignments: [],
    averageDropoffMinutes: 7,
  },
  {
    id: "route-002",
    driverId: "driver-002",
    vehicleId: "unit-002",
    zone: "GBA Oeste",
    status: "paused" as const,
    startedAt: "08:10",
    currentStopSequence: 6,
    pauseStartedAt: "10:35",
    pauseReason: "incidente",
    totalPausedMinutes: 18,
    pauseMinutes: 18,
    extraDelayMinutes: 15,
    delayMinutes: 24,
    riskLevel: "high" as OperationalRisk,
    estimatedCloseTime: "18:38",
    projectedSlaCompliance: 88,
    suggestedReassignments: ["Mover 3 paradas de route-002 a route-003 podria reducir el atraso estimado."],
    averageDropoffMinutes: 11,
  },
  {
    id: "route-003",
    driverId: "driver-003",
    vehicleId: "unit-003",
    zone: "Rosario Centro",
    status: "scheduled" as const,
    currentStopSequence: 1,
    totalPausedMinutes: 0,
    pauseMinutes: 0,
    extraDelayMinutes: 0,
    delayMinutes: 0,
    riskLevel: "low" as OperationalRisk,
    estimatedCloseTime: "17:06",
    projectedSlaCompliance: 96,
    suggestedReassignments: ["Puede absorber 2-3 paradas si otra ruta supera el cierre objetivo."],
    averageDropoffMinutes: 8,
  },
];

const names = [
  "Ana Torres",
  "Carlos Medina",
  "Mariana Solis",
  "Hector Vargas",
  "Lucia Reyes",
  "Diego Paredes",
  "Sofia Nunez",
  "Andres Gomez",
  "Valeria Cruz",
  "Jorge Salas",
  "Paola Leon",
  "Luis Cabrera",
  "Fernanda Rios",
  "Ricardo Mena",
  "Camila Ortiz",
  "Mateo Prieto",
  "Natalia Cano",
  "Ivan Herrera",
  "Renata Molina",
  "Oscar Aguilar",
];

const streets = [
  "Av. Santa Fe",
  "Av. Cabildo",
  "Av. Corrientes",
  "Calle Thames",
  "Av. Juan B. Justo",
  "Ruta 7 Colectora",
  "Calle Mitre",
  "Pasaje sin nombre",
  "Bv. Oroño",
  "Calle San Juan",
];

const references = [
  "Porton negro, timbre no funciona",
  "Entrada por pasillo lateral",
  "Entre farmacia y kiosco",
  "Casa al fondo, reja verde",
  "Pedir acceso en seguridad",
  "Deposito detras del local",
  "Numeracion confusa, llamar antes",
  "Edificio sin encargado al mediodia",
  "Barrio cerrado, DNI requerido",
  "Local a la calle, horario partido",
];

function statusFor(routeIndex: number, sequence: number): DeliveryPackage["status"] {
  if (routeIndex === 0) {
    if (sequence <= 6) return "delivered";
    if (sequence === 7) return "in_progress";
  }

  if (routeIndex === 1) {
    if (sequence <= 4) return "delivered";
    if (sequence === 5) return "failed";
    if (sequence === 6) return "in_progress";
  }

  return "pending";
}

function generatePackages() {
  return routeDefinitions.flatMap((route, routeIndex) =>
    Array.from({ length: 20 }, (_, itemIndex) => {
      const sequence = itemIndex + 1;
      const globalIndex = routeIndex * 20 + itemIndex + 1;
      const status = statusFor(routeIndex, sequence);
      const zoneProfile = zoneProfiles.find((zone) => zone.name === route.zone) ?? zoneProfiles[0];
      const dropoffTimeMinutes = zoneProfile.averageDropoffMinutes + (itemIndex % 3);
      const transitMinutes = Math.round((8 + (sequence % 5) * 3) * zoneProfile.trafficFactor);
      const cumulativeEta = sequence * (transitMinutes + dropoffTimeMinutes) + route.pauseMinutes + route.delayMinutes;
      const estimatedArrival = addMinutesToTime(route.startedAt ?? "08:30", cumulativeEta);
      const etaConfidence = route.riskLevel === "high" || sequence > 15 ? "low" : route.riskLevel === "medium" || sequence > 9 ? "medium" : "high";
      const riskLevel: OperationalRisk =
        route.riskLevel === "high" || etaConfidence === "low" ? "high" : etaConfidence === "medium" ? "medium" : "low";
      const windowSize = etaConfidence === "low" ? 24 : etaConfidence === "medium" ? 16 : 10;
      const priority = sequence % 13 === 0 ? "urgent" : sequence % 5 === 0 ? "high" : "normal";

      return {
        id: `pkg-${String(globalIndex).padStart(3, "0")}`,
        routeId: route.id,
        trackingCode: `RPAI-${String(globalIndex).padStart(5, "0")}`,
        customerName: names[itemIndex % names.length],
        address: `${streets[(itemIndex + routeIndex) % streets.length]} ${120 + globalIndex}, ${route.zone}`,
        locality: route.zone,
        addressReference: references[(itemIndex + routeIndex) % references.length],
        zone: route.zone,
        sequence,
        status,
        estimatedArrival,
        estimatedArrivalWindowStart: addMinutesToTime(estimatedArrival, -Math.floor(windowSize / 2)),
        estimatedArrivalWindowEnd: addMinutesToTime(estimatedArrival, Math.ceil(windowSize / 2)),
        stopsBeforeCustomer: Math.max(sequence - route.currentStopSequence, 0),
        etaConfidence,
        riskLevel,
        dropoffTimeMinutes,
        priority,
        lastEvent:
          status === "delivered"
            ? `Entregado a las ${addMinutesToTime(route.startedAt ?? "08:30", sequence * 11)}`
            : status === "failed"
              ? "Entrega fallida: cliente ausente"
              : route.status === "paused"
                ? `ETA afectado por pausa de ${route.pauseMinutes} min`
                : "ETA predictivo recalculado",
        deliveredAt: status === "delivered" ? addMinutesToTime(route.startedAt ?? "08:30", sequence * 11) : undefined,
        failedReason: status === "failed" ? "cliente ausente" : undefined,
      } satisfies DeliveryPackage;
    }),
  );
}

export const initialRoutePulseData: RoutePulseData = {
  company: {
    id: "company-001",
    name: "RoutePulse AI LatAm Demo",
  },
  warehouse: {
    id: "warehouse-001",
    name: "Microhub AMBA Norte",
    address: "Av. General Paz 4200, Buenos Aires, Argentina",
    zone: "LatAm",
  },
  settings: {
    companyName: "RoutePulse AI LatAm Demo",
    warehouseAddress: "Av. General Paz 4200, Buenos Aires, Argentina",
    operationStartTime: "08:00",
    targetCloseTime: "18:00",
    targetSlaPercent: 92,
    deliveryToleranceMinutes: 10,
    baseDropoffMinutes: 7,
    averageDropoffMinutes: 8,
    maxExpectedPauseMinutes: 15,
    averageUnitCapacity: 22,
    operatingZone: "Argentina / LatAm",
    currency: "ARS",
    language: "es-AR",
    countryMarket: "Argentina / LatAm",
    simulationMode: true,
    predictiveMode: true,
    riskCalculationEnabled: true,
    customerTrackingEnabled: true,
  },
  trackingCms: {
    productName: "RoutePulse AI",
    customerHeadline: "Tu entrega se mueve en tiempo real",
    customerSubheadline: "Vista tipo fleet management con ETA vivo, trafico, drop-off y proximas paradas protegidas.",
    supportLabel: "Soporte de entrega",
    supportPhone: "+54 11 4567 8900",
    privacyNote: "Mostramos tu entrega, el vehiculo asignado y paradas anonimizadas. No exponemos datos de otros clientes.",
    mapProviderMode: "google_maps_ready",
    mapProviderStatus: "Google Maps ready: al configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY se activa mapa real, calles reales y capa de trafico.",
    liveSimulationSpeed: 1,
    showNextStopsCount: 4,
    neighborhoodFocus: "Belgrano / Colegiales / Nunez, Buenos Aires",
    simulationStarted: false,
    simulationPausedElapsedSeconds: 0,
    demoStops: [
      {
        id: "demo-stop-001",
        customerName: "Pedido Colegiales",
        street: "Av. Federico Lacroze",
        streetNumber: "2478",
        locality: "Colegiales",
        addressReference: "Local a la calle, estacionar sobre Lacroze",
        trafficLevel: "medium",
        dropoffMinutes: 6,
        priority: "normal",
        lat: -34.574,
        lng: -58.4538,
      },
      {
        id: "demo-stop-002",
        customerName: "Pedido Belgrano R",
        street: "Av. Cabildo",
        streetNumber: "1842",
        locality: "Belgrano",
        addressReference: "Edificio con seguridad, dejar en recepcion",
        trafficLevel: "low",
        dropoffMinutes: 5,
        priority: "normal",
        lat: -34.5624,
        lng: -58.4566,
      },
      {
        id: "demo-stop-003",
        customerName: "Pedido Barrancas",
        street: "Juramento",
        streetNumber: "2471",
        locality: "Belgrano",
        addressReference: "Timbre 4B, llamar antes",
        trafficLevel: "medium",
        dropoffMinutes: 7,
        priority: "normal",
        lat: -34.5602,
        lng: -58.4579,
      },
      {
        id: "demo-stop-004",
        customerName: "Pedido Bajo Belgrano",
        street: "Mendoza",
        streetNumber: "1640",
        locality: "Belgrano",
        addressReference: "Local a la calle, carga y descarga breve",
        trafficLevel: "high",
        dropoffMinutes: 8,
        priority: "high",
        lat: -34.5607,
        lng: -58.4446,
      },
      {
        id: "demo-stop-005",
        customerName: "Pedido Nunez",
        street: "Av. del Libertador",
        streetNumber: "6200",
        locality: "Nunez",
        addressReference: "Acceso por recepcion, llamar al llegar",
        trafficLevel: "medium",
        dropoffMinutes: 6,
        priority: "urgent",
        lat: -34.5501,
        lng: -58.4556,
      },
    ],
  },
  users: [
    {
      id: "user-admin-001",
      email: "admin@demo.com",
      role: "admin",
      name: "Admin Demo",
    },
    {
      id: "user-driver-001",
      email: "driver1@demo.com",
      role: "driver",
      name: "Miguel Alvarez",
      driverId: "driver-001",
      assignedRouteId: "route-001",
    },
    {
      id: "user-driver-002",
      email: "driver2@demo.com",
      role: "driver",
      name: "Laura Jimenez",
      driverId: "driver-002",
      assignedRouteId: "route-002",
    },
  ],
  drivers: [
    {
      id: "driver-001",
      name: "Miguel Alvarez",
      phone: "+54 11 1000 001",
      status: "on_route",
      assignedRouteId: "route-001",
    },
    {
      id: "driver-002",
      name: "Laura Jimenez",
      phone: "+54 11 1000 002",
      status: "paused",
      assignedRouteId: "route-002",
    },
    {
      id: "driver-003",
      name: "Roberto Chavez",
      phone: "+54 341 100 003",
      status: "available",
      assignedRouteId: "route-003",
    },
  ],
  vehicles: [
    {
      id: "unit-001",
      plate: "RP-210-A",
      type: "Utilitario tercerizado",
      capacity: 24,
      status: "active",
    },
    {
      id: "unit-002",
      plate: "RP-318-B",
      type: "Furgon tercerizado",
      capacity: 28,
      status: "active",
    },
    {
      id: "unit-003",
      plate: "RP-441-C",
      type: "Moto cargo tercerizada",
      capacity: 18,
      status: "active",
    },
  ],
  routes: routeDefinitions.map((route) => ({
    ...route,
    packageIds: Array.from({ length: 20 }, (_, index) => `pkg-${String(routeDefinitions.indexOf(route) * 20 + index + 1).padStart(3, "0")}`),
  })),
  packages: generatePackages(),
  zones: zoneProfiles,
};

export function cloneInitialRoutePulseData() {
  return structuredClone(initialRoutePulseData);
}
