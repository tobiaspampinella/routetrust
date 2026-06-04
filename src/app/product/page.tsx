import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, MapPin, Navigation, Sparkles, Workflow, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public/PublicShell";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = {
  title: "Product · RouteTrust",
  description: "The RouteTrust platform: operations dashboard, customer tracking, driver portal and AI route approval.",
};

const CAPABILITIES = [
  {
    icon: BarChart3,
    title: "Operations dashboard",
    body: "Active routes, drivers online, SLA at risk, open incidents, completed deliveries and system health — one control tower for the whole day.",
  },
  {
    icon: MapPin,
    title: "Customer tracking",
    body: "A light, MercadoLibre-clear delivery timeline: order prepared, driver assigned, on the way, delayed, delivered — with live ETA windows.",
  },
  {
    icon: Navigation,
    title: "Driver portal",
    body: "Mobile-first route view with next stop, ETA and large one-tap actions: start route, arrived, delivered, report incident.",
  },
  {
    icon: Sparkles,
    title: "AI route approval",
    body: "The engine proposes optimal routes and reassignments with ETA savings and SLA impact. A human approves, modifies or rejects.",
  },
  {
    icon: Workflow,
    title: "Operational CMS",
    body: "Manage tenants, users, drivers, vehicles, routes, stops, incidents and approvals — Amazon-style tables with search, filters and audit logs.",
  },
  {
    icon: Bug,
    title: "Bug & incident reporting",
    body: "Capture incidents and bug reports in-product, triaged by severity, with an honest readiness and health surface.",
  },
];

export default function ProductPage() {
  return (
    <PublicShell>
      <section className="apple-hero-bg">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold text-[#10a37f]">The platform</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] lg:text-6xl">
              One operational layer, from control tower to doorstep.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6e6e73]">
              RouteTrust connects the people who plan, drive and receive deliveries. AI proposes the
              smart move; a human stays in control of every decision.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-14 rounded-xl px-7 text-base">
                <Link href="/contact">Request demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-xl px-7 text-base">
                <Link href="/track/demo">View tracking demo</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, index) => (
              <Reveal as="article" key={cap.title} delay={(index % 3) * 70}>
                <div className="flex h-full flex-col rounded-3xl border border-black/5 bg-[#f5f5f7] p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
                    <cap.icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-[#1d1d1f]">{cap.title}</h2>
                  <p className="mt-2 flex-1 text-[#6e6e73]">{cap.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center lg:py-24">
          <Reveal>
            <h2 className="text-4xl font-semibold tracking-tight text-[#1d1d1f] lg:text-5xl">
              Honest about where it is
            </h2>
            <p className="mt-4 text-lg text-[#6e6e73]">
              RouteTrust runs today as a local-first demo: real flows, real UI, progressive backend.
              No inflated production claims — see the live status on the updates page.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-14 rounded-xl px-7 text-base">
                <Link href="/updates">See current status</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 rounded-xl px-7 text-base">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
