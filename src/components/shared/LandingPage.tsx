"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public/PublicShell";
import { Reveal } from "@/components/public/Reveal";

const MODULES: Array<{ icon: LucideIcon; title: string; description: string; href: string; cta: string }> = [
  {
    icon: BarChart3,
    title: "Operations dashboard",
    description: "Active routes, drivers online, SLA at risk and open incidents — readable in under ten seconds.",
    href: "/login",
    cta: "Open console",
  },
  {
    icon: MapPin,
    title: "Customer tracking",
    description: "A clear delivery timeline, live ETA and status your customers actually understand.",
    href: "/track/demo",
    cta: "View tracking demo",
  },
  {
    icon: Navigation,
    title: "Driver portal",
    description: "Mobile-first route, next stop and one-tap actions: start, arrived, delivered, report incident.",
    href: "/login",
    cta: "See driver flow",
  },
  {
    icon: Sparkles,
    title: "AI route approval",
    description: "AI suggests the optimal route and reassignments. A human approves before anything ships.",
    href: "/login",
    cta: "Review approvals",
  },
];

const FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Clock,
    title: "Predictive ETA",
    description: "Traffic, drop-off time and pauses combine into a window-based ETA, not a guess.",
  },
  {
    icon: ShieldCheck,
    title: "Projected SLA",
    description: "See the compliance percentage you will land at by end of day — while you can still act.",
  },
  {
    icon: BarChart3,
    title: "Operational copilot",
    description: "Predictive rules flag risk and suggest reassignments live, for a human to confirm.",
  },
];

export function LandingPage() {
  return (
    <PublicShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="apple-hero-bg absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-1.5 text-sm font-medium text-[#0066cc] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                AI-built, human-orchestrated
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-7 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] sm:text-6xl lg:text-7xl">
                Operational intelligence for logistics teams.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#6e6e73]">
                RouteTrust helps logistics companies coordinate routes, approve AI-suggested decisions,
                track drivers, and keep customers informed in real time.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-14 rounded-full px-7 text-base">
                  <Link href="/contact">
                    Request demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-full px-7 text-base">
                  <Link href="/track/demo">View tracking demo</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={320} className="mx-auto mt-16 max-w-5xl">
            <HeroPreview />
          </Reveal>
        </div>
      </section>

      {/* Value strip */}
      <section className="border-y border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-5 py-10 text-center lg:grid-cols-4 lg:px-8">
          {[
            { value: "Real-time", label: "Driver & customer tracking" },
            { value: "AI + human", label: "Route approval workflow" },
            { value: "Window-based", label: "Predictive ETA & SLA" },
            { value: "Local-first", label: "Runs without map API keys" },
          ].map((item) => (
            <div key={item.label} className="px-3">
              <p className="text-2xl font-semibold text-[#1d1d1f]">{item.value}</p>
              <p className="mt-1 text-sm text-[#6e6e73]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold text-[#0066cc]">One platform, four surfaces</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#1d1d1f] lg:text-5xl">
              Built for everyone in the operation
            </h2>
            <p className="mt-4 text-lg text-[#6e6e73]">
              From the control tower to the customer on the doorstep — one connected operational layer.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {MODULES.map((module, index) => (
              <Reveal as="article" key={module.title} delay={index * 70}>
                <div className="group flex h-full flex-col rounded-3xl border border-black/5 bg-white p-7 shadow-soft transition-shadow hover:shadow-apple">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
                    <module.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-[#1d1d1f]">{module.title}</h3>
                  <p className="mt-2 flex-1 text-[#6e6e73]">{module.description}</p>
                  <Link
                    href={module.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066cc] transition-transform group-hover:translate-x-0.5"
                  >
                    {module.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI suggests, human approves */}
      <section className="bg-[#0b0f14] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="text-sm font-semibold text-[#19c37d]">Decision workflow</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight lg:text-5xl">AI suggests. Human approves.</h2>
              <p className="mt-5 text-lg leading-8 text-white/70">
                RouteTrust never ships an automated decision blindly. The engine proposes the optimal route,
                driver assignment and ETA savings — an operator reviews the trade-offs and approves, modifies
                or rejects. Every decision is auditable.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link href="/contact">Request demo</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-12 rounded-full px-6 text-white hover:bg-white/10">
                  <Link href="/product">How it works</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <ApprovalPreview />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 70}>
                <div className="rounded-3xl border border-black/5 bg-[#f5f5f7] p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0071e3] shadow-sm">
                    <feature.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-[#1d1d1f]">{feature.title}</h3>
                  <p className="mt-2 text-[#6e6e73]">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] bg-[#1d1d1f] px-8 py-16 text-center text-white lg:px-16">
              <h2 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight lg:text-5xl">
                See RouteTrust run your operation
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Explore the live tracking demo, or request a guided walkthrough of the operator console.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="h-14 rounded-full bg-white px-7 text-base text-[#1d1d1f] hover:bg-white/90">
                  <Link href="/contact">Request demo</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-14 rounded-full px-7 text-base text-white hover:bg-white/10">
                  <Link href="/track/demo">
                    View tracking demo
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}

function HeroPreview() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white shadow-apple">
      <div className="flex items-center gap-2 border-b border-black/5 bg-[#f5f5f7] px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs font-medium text-[#86868b]">RouteTrust · Operations dashboard</span>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-4">
        {[
          { label: "Active routes", value: "12", tone: "text-[#1d1d1f]" },
          { label: "Drivers online", value: "9", tone: "text-emerald-600" },
          { label: "SLA at risk", value: "2", tone: "text-amber-600" },
          { label: "Open incidents", value: "1", tone: "text-red-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-black/5 bg-[#f5f5f7] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{kpi.label}</p>
            <p className={`mt-1.5 text-3xl font-semibold ${kpi.tone}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <div className="route-grid flex h-36 items-center justify-center rounded-2xl border border-black/5 bg-[#fbfbfd]">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#6e6e73] shadow-sm">
            <Truck className="h-4 w-4 text-[#0071e3]" />
            Live route map · 12 vehicles tracked
          </span>
        </div>
      </div>
    </div>
  );
}

function ApprovalPreview() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/60">Route RT-22 · suggestion</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#19c37d]/15 px-3 py-1 text-xs font-semibold text-[#19c37d]">
          <Sparkles className="h-3.5 w-3.5" />
          AI proposed
        </span>
      </div>
      <div className="mt-5 space-y-3">
        {[
          { label: "ETA savings", value: "−18 min" },
          { label: "SLA risk", value: "Medium → Low" },
          { label: "Driver", value: "M. Álvarez" },
          { label: "Stops", value: "14" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-3 text-sm">
            <span className="text-white/50">{row.label}</span>
            <span className="font-medium text-white">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-2">
        <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white">
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
          Modify
        </span>
        <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2.5 text-sm font-semibold text-white">
          Reject
        </span>
      </div>
    </div>
  );
}
