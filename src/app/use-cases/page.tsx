import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Building2, Bike, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicShell } from "@/components/public/PublicShell";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = {
  title: "Use cases · RouteTrust",
  description: "How logistics teams use RouteTrust: last-mile fleets, regional carriers, e-commerce fulfillment and on-demand delivery.",
};

const USE_CASES = [
  {
    icon: Bike,
    title: "Last-mile fleets",
    body: "Coordinate dozens of drivers across a city with live ETA windows, incident handling and customer-facing tracking.",
    points: ["Per-window ETA, not single timestamps", "Driver one-tap status updates", "Customer tracking link per order"],
  },
  {
    icon: Building2,
    title: "Regional carriers",
    body: "Andreani-style trazabilidad across zones: route planning, stop sequencing and SLA projection per region.",
    points: ["Zone-level SLA projection", "Reassignment suggestions", "Audit trail on every decision"],
  },
  {
    icon: Store,
    title: "E-commerce fulfillment",
    body: "Keep customers informed from order prepared to delivered, with clean status and proactive delay alerts.",
    points: ["Amazon-style operations control", "Proactive delay states", "Branded customer experience"],
  },
  {
    icon: Boxes,
    title: "On-demand delivery",
    body: "Uber-clear movement and maps for fast dispatch, with AI suggesting the next best assignment for a human to approve.",
    points: ["Live driver positions", "AI-suggested assignment", "Human approval before dispatch"],
  },
];

export default function UseCasesPage() {
  return (
    <PublicShell>
      <section className="apple-hero-bg">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold text-[#10a37f]">Use cases</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] lg:text-6xl">
              Built for the way logistics teams actually run.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6e6e73]">
              Whatever you move, RouteTrust gives planners control, drivers clarity and customers confidence.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-5 md:grid-cols-2">
            {USE_CASES.map((useCase, index) => (
              <Reveal as="article" key={useCase.title} delay={(index % 2) * 80}>
                <div className="flex h-full flex-col rounded-3xl border border-black/5 bg-[#f5f5f7] p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
                    <useCase.icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-2xl font-semibold text-[#1d1d1f]">{useCase.title}</h2>
                  <p className="mt-2 text-[#6e6e73]">{useCase.body}</p>
                  <ul className="mt-5 space-y-2">
                    {useCase.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-[#1d1d1f]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10a37f]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14 text-center">
            <Button asChild size="lg" className="h-14 rounded-xl px-7 text-base">
              <Link href="/contact">Request a demo for your operation</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
