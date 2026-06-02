"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Radar, Route, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const previewStats = [
  { label: "Active dispatches", value: "20K" },
  { label: "Closed deliveries", value: "100" },
  { label: "New customers", value: "140" },
  { label: "Returns", value: "2K" },
];

const featureCards = [
  {
    icon: Clock3,
    title: "ETA with operational context",
    description: "More than a dot on a map. Show ETA, pause events, risk, and delivery tolerance in one readable layer.",
  },
  {
    icon: Radar,
    title: "Visual control tower",
    description: "Clear hierarchy, compact panels, and fast scan speed across desktop and mobile.",
  },
  {
    icon: ShieldCheck,
    title: "Evidence-first decisions",
    description: "Incidents, approvals, bugs, and beta status stay visible in one operational view.",
  },
];

export function LandingPage() {
  return (
    <div className="ops-shell-bg min-h-screen text-white selection:bg-[#5ea2ff]/35">
      <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#090910]/72 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white/6 ring-1 ring-white/10">
              <Truck className="h-5 w-5 text-[#5ea2ff]" />
            </div>
            <div>
              <p className="font-semibold tracking-wide text-white">RouteTrust</p>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">Operational Intelligence</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Button asChild variant="ghost" className="rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white">
              <Link href="/track/demo">Customer demo</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#5ea2ff] px-6 text-[#090910] hover:bg-[#89bbff]">
              <Link href="/login">Open platform</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-[1500px] gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#5ea2ff]/20 bg-[#5ea2ff]/10 px-4 py-2 text-sm text-[#cbe0ff]">
              <Sparkles className="h-4 w-4" />
              Built for operational scan speed
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
              Operational intelligence that customers and managers can read without friction.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              RouteTrust gives logistics teams a controlled visual layer for ETA, routes, drivers, incidents, and system truth across desktop,
              tablet, and mobile.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="h-14 rounded-full bg-[#5ea2ff] px-7 text-base text-[#090910] hover:bg-[#89bbff]">
                <Link href="/login">
                  Enter dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-14 rounded-full border border-white/10 bg-white/5 px-7 text-base text-white/78 hover:bg-white/10 hover:text-white"
              >
                <Link href="/track/demo">View customer tracking</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {featureCards.map(({ icon: Icon, title, description }) => (
                <div key={title} className="ops-panel-soft rounded-[1.8rem] p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#5ea2ff] ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/56">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ops-panel relative rounded-[2rem] p-4 sm:p-6">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(94,162,255,0.16),transparent_24%)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3 border-b border-white/6 pb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/36">Dashboard</p>
                  <p className="mt-1 text-2xl font-semibold text-white">Command view</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/68">LatAm live</div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {previewStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`ops-card-glow rounded-[1.7rem] border p-5 ${
                      index === 1
                        ? "border-transparent bg-[linear-gradient(135deg,rgba(94,162,255,0.96),rgba(143,198,255,0.84))] text-[#090910]"
                        : "border-white/8 bg-white/[0.035] text-white"
                    }`}
                  >
                    <div className="ops-dot-grid h-14 w-24 rounded-2xl opacity-50" />
                    <p className={`mt-4 text-sm ${index === 1 ? "text-[#163760]/70" : "text-white/48"}`}>{stat.label}</p>
                    <p className="mt-2 text-4xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
                <div className="ops-panel-soft rounded-[1.8rem] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold text-white">Live shipment tracking</p>
                      <p className="mt-1 text-sm text-white/46">Primary view tuned for desktop and mobile summary scanning.</p>
                    </div>
                    <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/65 sm:block">
                      Today
                    </div>
                  </div>
                  <div className="ops-world-grid relative mt-5 h-[320px] overflow-hidden rounded-[1.5rem] border border-white/6 bg-[#0f1020]">
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 720 320" fill="none" aria-hidden="true">
                      <path d="M86 192C162 110 222 95 328 136C401 165 482 116 632 156" className="customer-route-shadow" />
                      <path d="M88 194C162 110 222 95 328 136C401 165 482 116 632 156" className="customer-route-line" />
                      <path d="M330 136C402 224 462 234 584 250" className="customer-route-shadow" />
                      <path d="M332 138C402 224 462 234 584 250" className="customer-route-line" />
                    </svg>
                    {[
                      { left: "11%", top: "57%" },
                      { left: "30%", top: "32%" },
                      { left: "47%", top: "42%" },
                      { left: "69%", top: "34%" },
                      { left: "81%", top: "74%" },
                    ].map((dot) => (
                      <span
                        key={`${dot.left}-${dot.top}`}
                        className="absolute h-3.5 w-3.5 rounded-full bg-[#5ea2ff] shadow-[0_0_0_7px_rgba(94,162,255,0.16)]"
                        style={{ left: dot.left, top: dot.top }}
                      >
                        <span className="absolute -inset-2 rounded-full border border-[#5ea2ff]/30" />
                        <span className="absolute -inset-4 rounded-full border border-[#5ea2ff]/12" />
                      </span>
                    ))}
                    <div className="ops-panel absolute bottom-5 left-5 max-w-[280px] rounded-[1.4rem] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-white/44">Shipment</p>
                          <p className="mt-1 text-xl font-semibold text-white">SHPMT-6373-2537</p>
                        </div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#090910]">Out for delivery</div>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-white/65">
                        <span>Operations hub</span>
                        <Route className="h-4 w-4 text-[#5ea2ff]" />
                        <span>Customer stop</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ops-panel-soft rounded-[1.8rem] p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold text-white">Operational margin</p>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/62">Today</div>
                  </div>
                  <div className="mx-auto mt-8 flex h-56 w-56 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_54%)]">
                    <div
                      className="flex h-48 w-48 items-center justify-center rounded-full"
                      style={{
                        background: "conic-gradient(#5ea2ff 0 65%, rgba(255,255,255,0.08) 65% 100%)",
                      }}
                    >
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#0b0b15] text-5xl font-semibold text-white">
                        65%
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-sm text-white/44">Operational margin (USD)</p>
                  <p className="mt-2 text-center text-4xl font-semibold text-white">$6,000.66</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
