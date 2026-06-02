"use client";

import { AlertTriangle, Truck, UserCheck, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoutePulseStore } from "@/store/routePulseStore";

export function AdminDrivers() {
  const drivers = useRoutePulseStore((state) => state.drivers);
  const routes = useRoutePulseStore((state) => state.routes);
  const incidents = useRoutePulseStore((state) => state.incidents);
  const packages = useRoutePulseStore((state) => state.packages);

  const activeDrivers = drivers.filter((driver) => driver.status === "on_route").length;
  const pausedDrivers = drivers.filter((driver) => driver.status === "paused").length;
  const availableDrivers = drivers.filter((driver) => driver.status === "available").length;
  const openDriverIncidents = incidents.filter(
    (incident) => incident.status !== "resolved" && (incident.source === "driver" || incident.source === "system"),
  ).length;

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Driver operations"
        title="Driver fleet visibility"
        description="Operational baseline for active drivers, route assignment, incident pressure and delivery workload."
      />

      <div className="space-y-6 p-5 lg:p-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Active drivers" value={activeDrivers} detail="Currently on route" icon={Users} tone="blue" />
          <StatCard label="Available drivers" value={availableDrivers} detail="Ready for reassignment" icon={UserCheck} tone="green" />
          <StatCard label="Paused drivers" value={pausedDrivers} detail="Operational stop in progress" icon={Truck} tone="amber" />
          <StatCard label="Open driver incidents" value={openDriverIncidents} detail="Requires manager review" icon={AlertTriangle} tone="red" />
        </section>

        <Card className="ops-card-glow">
          <CardHeader>
            <CardTitle>Driver roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-white/38">
                  <tr>
                    <th className="px-4 py-3 font-medium">Driver</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Assigned route</th>
                    <th className="px-4 py-3 font-medium">Zone</th>
                    <th className="px-4 py-3 font-medium">Packages</th>
                    <th className="px-4 py-3 font-medium">Open incidents</th>
                    <th className="px-4 py-3 font-medium">Operational note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {drivers.map((driver) => {
                    const route = routes.find((item) => item.id === driver.assignedRouteId);
                    const packageCount = packages.filter((item) => item.routeId === route?.id).length;
                    const incidentCount = incidents.filter(
                      (incident) => incident.status !== "resolved" && incident.routeId === route?.id,
                    ).length;

                    return (
                      <tr key={driver.id} className="text-white/76">
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-white">{driver.name}</p>
                            <p className="text-xs text-white/40">{driver.id}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <DriverStatusPill status={driver.status} />
                        </td>
                        <td className="px-4 py-4">{route?.id ?? "Unassigned"}</td>
                        <td className="px-4 py-4">{route?.zone ?? "Not configured"}</td>
                        <td className="px-4 py-4">{packageCount}</td>
                        <td className="px-4 py-4">{incidentCount}</td>
                        <td className="px-4 py-4 text-white/52">
                          {driver.status === "on_route"
                            ? "Monitor ETA confidence and route pressure."
                            : driver.status === "paused"
                              ? "Human review required before resuming."
                              : "Available for dispatch balancing."}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function DriverStatusPill({ status }: { status: "available" | "on_route" | "paused" | "offline" }) {
  const copy =
    status === "on_route"
      ? "On route"
      : status === "paused"
        ? "Paused"
        : status === "offline"
          ? "Offline"
          : "Available";

  const tone =
    status === "on_route"
      ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
      : status === "paused"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
        : status === "offline"
          ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
          : "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tone}`}>{copy}</span>;
}
