import type { PackageStatus, RiskLevel, RouteStatus } from "@/lib/types";

export const packageStatusLabels: Record<PackageStatus, string> = {
  pending: "Pendiente",
  in_progress: "En ruta",
  delivered: "Entregado",
  failed: "Fallido",
};

export const routeStatusLabels: Record<RouteStatus, string> = {
  scheduled: "Programada",
  in_progress: "Activa",
  paused: "Pausada",
  completed: "Completada",
};

export const riskLabels: Record<RiskLevel, string> = {
  risk_low: "Bajo",
  risk_medium: "Medio",
  risk_high: "Alto",
};

export const etaConfidenceLabels = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
} as const;

export const operationalRiskLabels = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
} as const;
