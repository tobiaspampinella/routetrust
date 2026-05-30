"use client";

import { useRoutePulseStore } from "@/store/routePulseStore";
import { useShallow } from "zustand/react/shallow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle2, RefreshCw, XCircle, Play } from "lucide-react";

export function LiveCmsTab() {
  const { routes, packages, markDelivered, markFailed, startRoute, mockReassignRoute, recalculateRouteEta } = useRoutePulseStore(
    useShallow((state) => ({
      routes: state.routes,
      packages: state.packages,
      markDelivered: state.markDelivered,
      markFailed: state.markFailed,
      startRoute: state.startRoute,
      mockReassignRoute: state.mockReassignRoute,
      recalculateRouteEta: state.recalculateRouteEta,
    }))
  );

  return (
    <div className="space-y-6 p-5 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-2">
        {routes.map((route) => {
          const routePackages = packages.filter((p) => p.routeId === route.id).sort((a, b) => a.sequence - b.sequence);
          const currentStop = routePackages.find((p) => p.status === "in_progress") ?? routePackages.find((p) => p.status === "pending");

          return (
            <Card key={route.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ruta {route.id}</CardTitle>
                  <p className="text-sm text-slate-500">Estado: {route.status} · Zona: {route.zone}</p>
                </div>
                <StatusBadge type="route" status={route.status} />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startRoute(route.id)} disabled={route.status === "completed"}>
                    <Play className="mr-2 h-4 w-4" /> Iniciar / Forzar Avance
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => recalculateRouteEta(route.id)}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Recalcular ETA
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mockReassignRoute(route.id)}>
                    Reasignar
                  </Button>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-sm font-bold text-slate-700">Gestión de próxima parada</p>
                  {currentStop ? (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="truncate font-semibold text-slate-900">
                          #{currentStop.sequence} {currentStop.customerName}
                        </p>
                        <p className="text-xs text-slate-500">{currentStop.address}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="success" onClick={() => markDelivered(route.id)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Entregado
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => markFailed(route.id, "Rechazo CMS")}>
                          <XCircle className="mr-1 h-4 w-4" /> Fallido
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No hay paradas pendientes.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
