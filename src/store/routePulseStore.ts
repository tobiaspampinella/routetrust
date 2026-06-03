"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cloneInitialRoutePulseData } from "@/data/mockData";
import {
  applyPauseImpactToRoute,
  calculateRouteEstimatedCloseTime,
  calculateRouteRiskFromCloseTime,
  getClockTime,
  recalculatePackageEtas,
} from "@/lib/etaCalculations";
import { calculateProjectedSLA } from "@/lib/kpiCalculations";
import { getTrackingSimulationElapsedSeconds } from "@/lib/trackingSimulation";
import type {
  AuditEntry,
  CustomerTrackingCms,
  DeliveryPackage,
  Driver,
  IncidentSeverity,
  IncidentStatus,
  RiskLevel,
  RoutePulseData,
  SessionUser,
  SystemSettings,
  TrackingDemoStop,
} from "@/lib/types";

type LoginResult =
  | {
      ok: true;
      user: SessionUser;
    }
  | {
      ok: false;
      error: string;
    };

interface RoutePulseStore extends RoutePulseData {
  currentUser: SessionUser | null;
  auditLogs: AuditEntry[];
  dismissedApprovals: string[];
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setCurrentUser: (user: SessionUser | null) => void;
  resetDemo: () => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  updateTrackingCms: (settings: Partial<CustomerTrackingCms>) => void;
  addTrackingDemoStop: (stop: Omit<TrackingDemoStop, "id">) => void;
  updateTrackingDemoStop: (stopId: string, stop: Partial<TrackingDemoStop>) => void;
  removeTrackingDemoStop: (stopId: string) => void;
  resetTrackingDemoStops: () => void;
  startTrackingSimulation: () => void;
  restartTrackingSimulation: () => void;
  pauseTrackingSimulation: () => void;
  startRoute: (routeId: string) => void;
  markArrived: (routeId: string) => void;
  markDelivered: (routeId: string) => void;
  markFailed: (routeId: string, reason: string) => void;
  pauseRoute: (routeId: string, reason: string) => void;
  resumeRoute: (routeId: string) => void;
  reportIncident: (input: { routeId: string; packageId?: string; title: string; detail: string; severity?: IncidentSeverity; source?: "admin" | "driver" | "customer" | "system" }) => void;
  resolveIncident: (incidentId: string) => void;
  setIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  recalculateRouteEta: (routeId: string) => void;
  markRouteRisk: (routeId: string, risk: RiskLevel) => void;
  mockReassignRoute: (routeId: string) => void;
  approveRouteSuggestion: (routeId: string, note?: string) => void;
  rejectRouteSuggestion: (routeId: string, note?: string) => void;
  setDrivers: (drivers: Driver[]) => void;
  addDriver: (input: { name: string; phone: string; status?: Driver["status"] }) => void;
  updateDriver: (driverId: string, input: Partial<Pick<Driver, "name" | "phone" | "status">>) => void;
  removeDriver: (driverId: string) => void;
}

function pauseDelay(reason: string) {
  const normalized = reason.toLowerCase();
  if (normalized.includes("comida")) return 25;
  if (normalized.includes("combustible")) return 15;
  if (normalized.includes("incidente")) return 30;
  return 10;
}

function routeIsFinished(packages: DeliveryPackage[]) {
  return packages.every((item) => item.status === "delivered" || item.status === "failed");
}

function setNextStopInProgress(packages: DeliveryPackage[], routeId: string) {
  const hasCurrentStop = packages.some((item) => item.routeId === routeId && item.status === "in_progress");
  if (hasCurrentStop) return packages;

  const nextStop = packages
    .filter((item) => item.routeId === routeId)
    .sort((a, b) => a.sequence - b.sequence)
    .find((item) => item.status === "pending");

  if (!nextStop) return packages;

  return packages.map((item) => (item.id === nextStop.id ? { ...item, status: "in_progress" as const } : item));
}

function resetTrackingSimulationFields(trackingCms: CustomerTrackingCms) {
  return {
    ...trackingCms,
    simulationStarted: false,
    simulationStartedAt: undefined,
    simulationPausedAt: undefined,
    simulationPausedElapsedSeconds: 0,
  };
}

function refreshPredictiveModel(
  state: Pick<RoutePulseStore, "routes" | "packages" | "settings" | "zones">,
  routeIds = state.routes.map((route) => route.id),
) {
  let packages = state.packages;
  const routes = state.routes.map((route) => {
    if (!routeIds.includes(route.id)) return route;

    const routePackages = packages.filter((item) => item.routeId === route.id).sort((a, b) => a.sequence - b.sequence);
    const currentStop = routePackages.find((item) => item.status === "in_progress") ?? routePackages.find((item) => item.status === "pending");
    const averageDropoffMinutes =
      routePackages.reduce((sum, item) => sum + item.dropoffTimeMinutes, 0) / Math.max(routePackages.length, 1);
    const baseRoute = {
      ...route,
      pauseMinutes: route.pauseMinutes ?? route.totalPausedMinutes,
      totalPausedMinutes: route.pauseMinutes ?? route.totalPausedMinutes,
      delayMinutes: route.delayMinutes ?? route.extraDelayMinutes,
      extraDelayMinutes: route.delayMinutes ?? route.extraDelayMinutes,
      currentStopSequence: currentStop?.sequence ?? routePackages.length + 1,
      averageDropoffMinutes,
    };
    const estimatedCloseTime = calculateRouteEstimatedCloseTime(baseRoute, state.settings, routePackages, state.zones);
    const riskLevel = calculateRouteRiskFromCloseTime(estimatedCloseTime, baseRoute, state.settings);
    const routeForEta = {
      ...baseRoute,
      estimatedCloseTime,
      riskLevel,
      projectedSlaCompliance: baseRoute.projectedSlaCompliance,
      suggestedReassignments:
        riskLevel === "high"
          ? [`Mover 3 paradas de ${route.id} a una ruta de bajo riesgo podria reducir el atraso estimado.`]
          : (route.suggestedReassignments ?? []).filter((item) => !item.includes("Mover 3 paradas")),
    };
    const recalculated = recalculatePackageEtas(routeForEta, routePackages, state.settings, state.zones);
    const nextRoute = {
      ...routeForEta,
      projectedSlaCompliance: calculateProjectedSLA(routeForEta, recalculated, state.settings),
    };
    const byId = new Map(recalculated.map((item) => [item.id, item]));
    packages = packages.map((item) => byId.get(item.id) ?? item);

    return nextRoute;
  });

  return { routes, packages };
}

const initialState = cloneInitialRoutePulseData();

export const useRoutePulseStore = create<RoutePulseStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentUser: null,
      auditLogs: [],
      dismissedApprovals: [],
      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const payload = (await response.json().catch(() => null)) as { user?: SessionUser; error?: string } | null;

        if (!response.ok || !payload?.user) {
          return {
            ok: false,
            error: payload?.error ?? "No se pudo iniciar sesion.",
          };
        }

        set({ currentUser: payload.user });
        return {
          ok: true,
          user: payload.user,
        };
      },
      logout: async () => {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        }).catch(() => null);
        set({ currentUser: null });
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      setDrivers: (drivers) => set({ drivers }),
      addDriver: ({ name, phone, status = "available" }) => {
        set((state) => ({
          drivers: [
            ...state.drivers,
            {
              id: `driver-${Date.now()}`,
              name: name.trim(),
              phone: phone.trim(),
              status,
              assignedRouteId: "",
            },
          ],
        }));
      },
      updateDriver: (driverId, input) => {
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver.id === driverId
              ? {
                  ...driver,
                  ...(input.name !== undefined ? { name: input.name.trim() } : {}),
                  ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
                  ...(input.status !== undefined ? { status: input.status } : {}),
                }
              : driver,
          ),
        }));
      },
      removeDriver: (driverId) => {
        set((state) => ({
          drivers: state.drivers.filter((driver) => driver.id !== driverId),
        }));
      },
      resetDemo: () => {
        const freshState = cloneInitialRoutePulseData();
        set({ ...freshState, currentUser: get().currentUser });
      },
      updateSettings: (settings) => {
        set((state) => {
          const nextSettings = { ...state.settings, ...settings };
          const refreshed = refreshPredictiveModel({ ...state, settings: nextSettings });

          return {
            settings: nextSettings,
            routes: refreshed.routes,
            packages: refreshed.packages,
            company: {
              ...state.company,
              name: nextSettings.companyName,
            },
            warehouse: {
              ...state.warehouse,
              address: nextSettings.warehouseAddress,
              zone: nextSettings.operatingZone,
            },
          };
        });
      },
      updateTrackingCms: (settings) => {
        set((state) => ({
          trackingCms: {
            ...state.trackingCms,
            ...settings,
          },
        }));
      },
      addTrackingDemoStop: (stop) => {
        set((state) => {
          if (state.trackingCms.demoStops.length >= 5) return {};
          return {
            trackingCms: resetTrackingSimulationFields({
              ...state.trackingCms,
              demoStops: [
                ...state.trackingCms.demoStops,
                {
                  ...stop,
                  id: `demo-stop-${Date.now()}`,
                },
              ],
            }),
          };
        });
      },
      updateTrackingDemoStop: (stopId, stop) => {
        set((state) => ({
          trackingCms: resetTrackingSimulationFields({
            ...state.trackingCms,
            demoStops: state.trackingCms.demoStops.map((item) => (item.id === stopId ? { ...item, ...stop } : item)),
          }),
        }));
      },
      removeTrackingDemoStop: (stopId) => {
        set((state) => ({
          trackingCms: resetTrackingSimulationFields({
            ...state.trackingCms,
            demoStops: state.trackingCms.demoStops.filter((item) => item.id !== stopId),
          }),
        }));
      },
      resetTrackingDemoStops: () => {
        const freshState = cloneInitialRoutePulseData();
        set((state) => ({
          trackingCms: resetTrackingSimulationFields({
            ...state.trackingCms,
            demoStops: freshState.trackingCms.demoStops,
          }),
        }));
      },
      startTrackingSimulation: () => {
        set((state) => ({
          trackingCms: {
            ...state.trackingCms,
            simulationStarted: true,
            simulationStartedAt: Date.now(),
            simulationPausedAt: undefined,
          },
        }));
      },
      restartTrackingSimulation: () => {
        set((state) => ({
          trackingCms: {
            ...state.trackingCms,
            simulationStarted: true,
            simulationStartedAt: Date.now(),
            simulationPausedAt: undefined,
            simulationPausedElapsedSeconds: 0,
          },
        }));
      },
      pauseTrackingSimulation: () => {
        set((state) => ({
          trackingCms: {
            ...state.trackingCms,
            simulationStarted: false,
            simulationPausedAt: Date.now(),
            simulationPausedElapsedSeconds: getTrackingSimulationElapsedSeconds(state.trackingCms),
          },
        }));
      },
      startRoute: (routeId) => {
        set((state) => {
          const now = getClockTime();
          const routes = state.routes.map((route) =>
            route.id === routeId
              ? {
                  ...route,
                  status: "in_progress" as const,
                  startedAt: route.startedAt ?? now,
                  completedAt: undefined,
                }
              : route,
          );
          const route = routes.find((item) => item.id === routeId);
          let packages = state.packages;
          const hasCurrentStop = packages.some((item) => item.routeId === routeId && item.status === "in_progress");
          if (!hasCurrentStop) packages = setNextStopInProgress(packages, routeId);

          const refreshed = refreshPredictiveModel({ ...state, routes, packages }, [routeId]);

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) =>
              driver.id === route?.driverId ? { ...driver, status: "on_route" as const } : driver,
            ),
          };
        });
      },
      markArrived: (routeId) => {
        set((state) => {
          const packages = setNextStopInProgress(state.packages, routeId);
          return refreshPredictiveModel({ ...state, packages }, [routeId]);
        });
      },
      markDelivered: (routeId) => {
        set((state) => {
          const now = getClockTime();
          const routePackages = state.packages.filter((item) => item.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
          const currentStop = routePackages.find((item) => item.status === "in_progress") ?? routePackages.find((item) => item.status === "pending");

          if (!currentStop) return {};

          let packages = state.packages.map((item) =>
            item.id === currentStop.id
              ? {
                  ...item,
                  status: "delivered" as const,
                  deliveredAt: now,
                  failedReason: undefined,
                }
              : item,
          );

          const updatedRoutePackages = packages.filter((item) => item.routeId === routeId);
          const finished = routeIsFinished(updatedRoutePackages);
          if (!finished) packages = setNextStopInProgress(packages, routeId);

          const route = state.routes.find((item) => item.id === routeId);
          const refreshed = refreshPredictiveModel(
            {
              ...state,
              packages,
              routes: state.routes.map((item) =>
                item.id === routeId
                  ? {
                      ...item,
                      status: finished ? ("completed" as const) : ("in_progress" as const),
                      completedAt: finished ? now : item.completedAt,
                    }
                  : item,
              ),
            },
            [routeId],
          );

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) =>
              driver.id === route?.driverId ? { ...driver, status: finished ? ("available" as const) : ("on_route" as const) } : driver,
            ),
          };
        });
      },
      markFailed: (routeId, reason) => {
        set((state) => {
          const now = getClockTime();
          const routePackages = state.packages.filter((item) => item.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
          const currentStop = routePackages.find((item) => item.status === "in_progress") ?? routePackages.find((item) => item.status === "pending");

          if (!currentStop) return {};

          let packages = state.packages.map((item) =>
            item.id === currentStop.id
              ? {
                  ...item,
                  status: "failed" as const,
                  deliveredAt: undefined,
                  failedReason: reason,
                }
              : item,
          );
          const updatedRoutePackages = packages.filter((item) => item.routeId === routeId);
          const finished = routeIsFinished(updatedRoutePackages);
          if (!finished) packages = setNextStopInProgress(packages, routeId);

          const route = state.routes.find((item) => item.id === routeId);
          const refreshed = refreshPredictiveModel(
            {
              ...state,
              packages,
              routes: state.routes.map((item) =>
                item.id === routeId
                  ? {
                      ...item,
                      status: finished ? ("completed" as const) : ("in_progress" as const),
                      completedAt: finished ? now : item.completedAt,
                    }
                  : item,
              ),
            },
            [routeId],
          );

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) =>
              driver.id === route?.driverId ? { ...driver, status: finished ? ("available" as const) : ("on_route" as const) } : driver,
            ),
          };
        });
      },
      pauseRoute: (routeId, reason) => {
        set((state) => {
          const now = getClockTime();
          const route = state.routes.find((item) => item.id === routeId);
          const pauseMinutes = pauseDelay(reason);
          const routes = state.routes.map((item) =>
            item.id === routeId
              ? {
                  ...applyPauseImpactToRoute(item, pauseMinutes),
                  status: "paused" as const,
                  pauseStartedAt: now,
                  pauseReason: reason,
                }
              : item,
          );
          const refreshed = refreshPredictiveModel({ ...state, routes }, [routeId]);

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) =>
              driver.id === route?.driverId ? { ...driver, status: "paused" as const } : driver,
            ),
          };
        });
      },
      resumeRoute: (routeId) => {
        set((state) => {
          const route = state.routes.find((item) => item.id === routeId);
          const routes = state.routes.map((item) =>
            item.id === routeId
              ? {
                  ...item,
                  status: "in_progress" as const,
                  pauseStartedAt: undefined,
                  pauseReason: undefined,
                }
              : item,
          );
          const refreshed = refreshPredictiveModel({ ...state, routes }, [routeId]);

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) =>
              driver.id === route?.driverId ? { ...driver, status: "on_route" as const } : driver,
            ),
          };
        });
      },
      reportIncident: (input) => {
        set((state) => ({
          incidents: [
            {
              id: `incident-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              routeId: input.routeId,
              packageId: input.packageId,
              title: input.title,
              detail: input.detail,
              severity: input.severity ?? "medium",
              status: "open" as const,
              source: input.source ?? "driver",
              createdAt: new Date().toISOString(),
            },
            ...state.incidents,
          ].slice(0, 20),
          routes: state.routes.map((route) =>
            route.id === input.routeId && input.severity === "high"
              ? {
                  ...route,
                  riskLevel: "high" as const,
                  manualRisk: "risk_high" as const,
                  suggestedReassignments: [
                    "Incidente abierto: requiere revision humana antes de reasignar o cambiar SLA.",
                    ...route.suggestedReassignments.filter((item) => !item.includes("Incidente abierto")),
                  ],
                }
              : route,
          ),
        }));
      },
      resolveIncident: (incidentId) => {
        set((state) => ({
          incidents: state.incidents.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status: "resolved" as const,
                  resolvedAt: new Date().toISOString(),
                }
              : incident,
          ),
        }));
      },
      setIncidentStatus: (incidentId, status) => {
        set((state) => ({
          incidents: state.incidents.map((incident) =>
            incident.id === incidentId
              ? {
                  ...incident,
                  status,
                  resolvedAt: status === "resolved" ? new Date().toISOString() : undefined,
                }
              : incident,
          ),
        }));
      },
      recalculateRouteEta: (routeId) => {
        set((state) => refreshPredictiveModel(state, [routeId]));
      },
      markRouteRisk: (routeId, risk) => {
        set((state) => {
          const routes = state.routes.map((route) =>
            route.id === routeId
              ? {
                  ...route,
                  manualRisk: risk,
                  riskLevel: risk === "risk_high" ? ("high" as const) : risk === "risk_medium" ? ("medium" as const) : ("low" as const),
                }
              : route,
          );
          return refreshPredictiveModel({ ...state, routes }, [routeId]);
        });
      },
      mockReassignRoute: (routeId) => {
        set((state) => {
          const targetRoute = state.routes.find((route) => route.id === routeId);
          const fallbackDriver = state.drivers.find((driver) => driver.id !== targetRoute?.driverId && driver.status !== "paused");
          if (!targetRoute || !fallbackDriver) return {};

          const routes = state.routes.map((route) => (route.id === routeId ? { ...route, driverId: fallbackDriver.id } : route));
          const refreshed = refreshPredictiveModel({ ...state, routes }, [routeId]);

          return {
            routes: refreshed.routes,
            packages: refreshed.packages,
            drivers: state.drivers.map((driver) => {
              if (driver.id === fallbackDriver.id) return { ...driver, assignedRouteId: routeId, status: targetRoute.status === "paused" ? "paused" : "on_route" };
              if (driver.id === targetRoute.driverId) return { ...driver, status: "available" as const };
              return driver;
            }),
          };
        });
      },
      approveRouteSuggestion: (routeId, note) => {
        set((state) => {
          const targetRoute = state.routes.find((route) => route.id === routeId);
          if (!targetRoute) return {};

          const fallbackDriver = state.drivers.find(
            (driver) => driver.id !== targetRoute.driverId && driver.status !== "paused",
          );
          const reassign = Boolean(fallbackDriver);

          const routesWithDriver = reassign
            ? state.routes.map((route) => (route.id === routeId ? { ...route, driverId: fallbackDriver!.id } : route))
            : state.routes;
          const refreshed = refreshPredictiveModel({ ...state, routes: routesWithDriver }, [routeId]);
          const routes = refreshed.routes.map((route) =>
            route.id === routeId ? { ...route, suggestedReassignments: [] } : route,
          );
          const drivers = reassign
            ? state.drivers.map((driver) => {
                if (driver.id === fallbackDriver!.id)
                  return {
                    ...driver,
                    assignedRouteId: routeId,
                    status: (targetRoute.status === "paused" ? "paused" : "on_route") as Driver["status"],
                  };
                if (driver.id === targetRoute.driverId) return { ...driver, status: "available" as const };
                return driver;
              })
            : state.drivers;

          const entry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            action: "route_approved",
            routeId,
            zone: targetRoute.zone,
            detail: reassign
              ? `AI reassignment applied on ${targetRoute.zone}.`
              : `Suggestion approved (no driver available to reassign) on ${targetRoute.zone}.`,
            note: note?.trim() || undefined,
            actor: get().currentUser?.name ?? "admin",
            createdAt: new Date().toISOString(),
          };

          return {
            routes,
            packages: refreshed.packages,
            drivers,
            auditLogs: [entry, ...state.auditLogs].slice(0, 50),
            dismissedApprovals: [...new Set([...state.dismissedApprovals, routeId])],
          };
        });
      },
      rejectRouteSuggestion: (routeId, note) => {
        set((state) => {
          const targetRoute = state.routes.find((route) => route.id === routeId);
          if (!targetRoute) return {};

          const entry: AuditEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            action: "route_rejected",
            routeId,
            zone: targetRoute.zone,
            detail: `AI suggestion rejected on ${targetRoute.zone}; route kept as-is.`,
            note: note?.trim() || undefined,
            actor: get().currentUser?.name ?? "admin",
            createdAt: new Date().toISOString(),
          };

          return {
            auditLogs: [entry, ...state.auditLogs].slice(0, 50),
            dismissedApprovals: [...new Set([...state.dismissedApprovals, routeId])],
          };
        });
      },
    }),
    {
      name: "routepulse-ai-tester-state",
      version: 7,
      storage: createJSONStorage(() => localStorage),
      migrate: () => {
        const freshState = cloneInitialRoutePulseData();
        return {
          ...freshState,
          currentUser: null,
        };
      },
    },
  ),
);
