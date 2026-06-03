export type UserRole = "admin" | "driver";

export type PackageStatus = "pending" | "in_progress" | "delivered" | "failed";

export type RouteStatus = "scheduled" | "in_progress" | "paused" | "completed";

export type RiskLevel = "risk_low" | "risk_medium" | "risk_high";

export type OperationalRisk = "low" | "medium" | "high";

export type EtaConfidence = "high" | "medium" | "low";

export type DeliveryPriority = "normal" | "high" | "urgent";

export type ParkingDifficulty = "low" | "medium" | "high";

export type MapProviderMode = "local_3d_mock" | "maplibre_osm_ready" | "google_maps_ready" | "apple_mapkit_ready";

export type TrafficLevel = "low" | "medium" | "high";

export type IncidentSeverity = "low" | "medium" | "high";

export type IncidentStatus = "open" | "in_review" | "resolved";

export type IncidentSource = "admin" | "driver" | "customer" | "system";

export interface DemoUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  driverId?: string;
  assignedRouteId?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  driverId?: string;
  assignedRouteId?: string;
}

export interface Company {
  id: string;
  name: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  zone: string;
}

export interface SystemSettings {
  companyName: string;
  warehouseAddress: string;
  operationStartTime: string;
  targetCloseTime: string;
  targetSlaPercent: number;
  deliveryToleranceMinutes: number;
  baseDropoffMinutes: number;
  averageDropoffMinutes: number;
  maxExpectedPauseMinutes: number;
  averageUnitCapacity: number;
  operatingZone: string;
  currency: string;
  language: string;
  countryMarket: string;
  simulationMode: boolean;
  predictiveMode: boolean;
  riskCalculationEnabled: boolean;
  customerTrackingEnabled: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "available" | "on_route" | "paused" | "offline";
  assignedRouteId: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: string;
  capacity: number;
  status: "active" | "maintenance";
}

export interface DeliveryPackage {
  id: string;
  routeId: string;
  trackingCode: string;
  customerName: string;
  address: string;
  zone: string;
  locality: string;
  addressReference: string;
  sequence: number;
  status: PackageStatus;
  estimatedArrival: string;
  estimatedArrivalWindowStart: string;
  estimatedArrivalWindowEnd: string;
  stopsBeforeCustomer: number;
  etaConfidence: EtaConfidence;
  riskLevel: OperationalRisk;
  dropoffTimeMinutes: number;
  priority: DeliveryPriority;
  lastEvent?: string;
  deliveredAt?: string;
  failedReason?: string;
}

export interface RoutePlan {
  id: string;
  driverId: string;
  vehicleId: string;
  zone: string;
  status: RouteStatus;
  packageIds: string[];
  startedAt?: string;
  completedAt?: string;
  pauseStartedAt?: string;
  pauseReason?: string;
  totalPausedMinutes: number;
  pauseMinutes: number;
  extraDelayMinutes: number;
  delayMinutes: number;
  riskLevel: OperationalRisk;
  estimatedCloseTime: string;
  projectedSlaCompliance: number;
  suggestedReassignments: string[];
  averageDropoffMinutes: number;
  currentStopSequence: number;
  manualRisk?: RiskLevel;
}

export interface ZoneProfile {
  name: string;
  averageDropoffMinutes: number;
  trafficFactor: number;
  failedDeliveryRate: number;
  parkingDifficulty: ParkingDifficulty;
}

export interface CustomerTrackingCms {
  productName: string;
  customerHeadline: string;
  customerSubheadline: string;
  supportLabel: string;
  supportPhone: string;
  privacyNote: string;
  mapProviderMode: MapProviderMode;
  mapProviderStatus: string;
  liveSimulationSpeed: number;
  showNextStopsCount: number;
  neighborhoodFocus: string;
  simulationStarted: boolean;
  simulationStartedAt?: number;
  simulationPausedAt?: number;
  simulationPausedElapsedSeconds: number;
  demoStops: TrackingDemoStop[];
}

export interface TrackingDemoStop {
  id: string;
  customerName: string;
  street: string;
  streetNumber: string;
  locality: string;
  addressReference: string;
  trafficLevel: TrafficLevel;
  dropoffMinutes: number;
  priority: DeliveryPriority;
  lat?: number;
  lng?: number;
}

export interface OperationalIncident {
  id: string;
  routeId: string;
  packageId?: string;
  title: string;
  detail: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: IncidentSource;
  createdAt: string;
  resolvedAt?: string;
}

export type AuditAction = "route_approved" | "route_rejected";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  routeId: string;
  zone?: string;
  detail: string;
  note?: string;
  actor: string;
  createdAt: string;
}

export interface RoutePulseData {
  company: Company;
  warehouse: Warehouse;
  settings: SystemSettings;
  trackingCms: CustomerTrackingCms;
  users: SessionUser[];
  drivers: Driver[];
  vehicles: Vehicle[];
  routes: RoutePlan[];
  packages: DeliveryPackage[];
  zones: ZoneProfile[];
  incidents: OperationalIncident[];
}

export interface RouteStats {
  total: number;
  delivered: number;
  pending: number;
  failed: number;
  inProgress: number;
  progress: number;
  estimatedCloseTime: string;
  risk: RiskLevel;
  operationalRisk: OperationalRisk;
  projectedSlaCompliance: number;
  pauseMinutes: number;
  delayMinutes: number;
  averageDropoffMinutes: number;
  atRiskPackages: number;
  etaConfidenceAverage: number;
  currentStop?: DeliveryPackage;
  suggestedReassignments: string[];
}

export interface OperationsKpis {
  totalPackages: number;
  deliveredPackages: number;
  pendingPackages: number;
  failedPackages: number;
  completionRate: number;
  failureRate: number;
  activeRoutes: number;
  activeDrivers: number;
  averagePackagesPerDriver: number;
  estimatedOperationalCloseTime: string;
  routesInRisk: number;
  estimatedSLACompliance: number;
  deliveredPerHour: number;
  averageDropoffMinutes: number;
  projectedSLA: number;
  operationalCloseEstimate: string;
  atRiskPackages: number;
  routesAtRisk: number;
  averageDropoffTime: number;
  pauseImpactMinutes: number;
  driverProductivity: Array<{
    driverId: string;
    driverName: string;
    routeId: string;
    delivered: number;
    pending: number;
    productivityScore: number;
    pauseMinutes: number;
  }>;
  etaConfidenceAverage: number;
  suggestedReassignments: string[];
}
