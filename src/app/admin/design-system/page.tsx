"use client";

import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PALETTE = [
  { name: "Carbon Black", hex: "#0B0F14" },
  { name: "Primary Blue", hex: "#2563EB" },
  { name: "AI Cyan", hex: "#22D3EE" },
  { name: "Success Green", hex: "#22C55E" },
  { name: "Warning Amber", hex: "#F59E0B" },
  { name: "Incident Red", hex: "#EF4444" },
];

const SAMPLE_DRIVERS = [
  { id: "DRV-104", name: "M. Álvarez", status: "in_progress", route: "RT-22" },
  { id: "DRV-108", name: "S. Romero", status: "paused", route: "RT-31" },
  { id: "DRV-112", name: "J. Pereyra", status: "delivered", route: "RT-09" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  // Admin content uses the light surface convention (white card on the #f5f5f7 shell),
  // not the dark `bg-card` default that is reserved for the ops shell.
  return (
    <Card className="border border-[#e5e5ea] bg-white shadow-soft">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function DesignSystemPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AdminShell>
      <div className="space-y-6 p-5 lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase text-[#0066cc]">RouteTrust design system</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1d1d1f]">UI Primitives</h1>
          <p className="mt-2 text-sm text-[#6e6e73]">
            Living reference for the shared components in <code>src/components/ui</code>. Every block below
            is the real component — not a mockup.
          </p>
        </div>

        <Section title="Palette">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PALETTE.map((swatch) => (
              <div key={swatch.hex} className="rounded-2xl border border-[#e5e5ea] p-3">
                <div className="h-12 w-full rounded-xl" style={{ backgroundColor: swatch.hex }} />
                <p className="mt-2 text-xs font-semibold text-[#1d1d1f]">{swatch.name}</p>
                <p className="text-xs text-[#86868b]">{swatch.hex}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons & Badges">
          <div className="flex flex-wrap gap-3">
            <Button>Request Demo</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="success">Approve Route</Button>
            <Button variant="warning">SLA Risk</Button>
            <Button variant="destructive">Report Incident</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="in_progress">In progress</Badge>
            <Badge variant="delivered">Delivered</Badge>
            <Badge variant="paused">Paused</Badge>
            <Badge variant="failed">Incident</Badge>
            <Badge variant="risk_high">SLA high</Badge>
          </div>
        </Section>

        <Section title="Alert banners (honest status)">
          <AlertBanner tone="demo" title="Demo mode">
            Data shown here is seeded for demonstration and is not connected to a live tenant.
          </AlertBanner>
          <AlertBanner tone="info" title="DB connected">Persistence is running against PostgreSQL.</AlertBanner>
          <AlertBanner tone="warning" title="SLA at risk">2 routes are projected to breach their window.</AlertBanner>
          <AlertBanner tone="danger" title="Open incident">Driver DRV-108 reported a blocked access point.</AlertBanner>
        </Section>

        <Section title="Forms">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ds-name">Driver name</Label>
              <Input id="ds-name" placeholder="e.g. M. Álvarez" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ds-status">Status</Label>
              <Select id="ds-status" defaultValue="in_progress">
                <option value="idle">Idle</option>
                <option value="in_progress">On route</option>
                <option value="paused">Paused</option>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ds-note">Audit note</Label>
              <Textarea id="ds-note" placeholder="Reason for the change…" />
            </div>
          </div>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Open create drawer
          </Button>
        </Section>

        <Section title="Tabs + Table">
          <Tabs defaultValue="drivers">
            <TabsList>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="empty">Empty</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>
            <TabsContent value="drivers">
              <TableContainer>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_DRIVERS.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell className="text-[#6e6e73]">{driver.id}</TableCell>
                        <TableCell>{driver.route}</TableCell>
                        <TableCell>
                          <Badge variant={driver.status as "in_progress" | "paused" | "delivered"}>
                            {driver.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabsContent>
            <TabsContent value="empty">
              <EmptyState
                icon={Truck}
                title="No drivers yet"
                description="Add your first driver to start assigning routes."
                action={<Button size="sm">Add driver</Button>}
              />
            </TabsContent>
            <TabsContent value="loading">
              <LoadingState label="Loading drivers…" />
            </TabsContent>
            <TabsContent value="error">
              <ErrorState
                description="Could not reach the drivers API. Check the backend connection."
                action={
                  <Button size="sm" variant="outline">
                    Retry
                  </Button>
                }
              />
            </TabsContent>
          </Tabs>
        </Section>
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="New driver"
        description="Create a driver record (demo — not persisted)."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Save</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ds-drawer-name">Name</Label>
            <Input id="ds-drawer-name" placeholder="Full name" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ds-drawer-route">Assigned route</Label>
            <Select id="ds-drawer-route">
              <option value="">Unassigned</option>
              <option value="RT-09">RT-09</option>
              <option value="RT-22">RT-22</option>
            </Select>
          </div>
        </div>
      </Drawer>
    </AdminShell>
  );
}
