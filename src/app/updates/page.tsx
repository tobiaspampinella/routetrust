"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleCheck, CircleDot, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicShell } from "@/components/public/PublicShell";
import { Reveal } from "@/components/public/Reveal";
import { APP_VERSION, APP_VERSION_NOTE } from "@/lib/version";

interface HealthPayload {
  status?: string;
  version?: string;
  database?: string;
  storageMode?: string;
  authMode?: string;
  serverReady?: boolean;
  betaBlockers?: string[];
}

const READINESS: Array<{ label: string; state: "yes" | "partial" | "no" }> = [
  { label: "Local demo ready", state: "yes" },
  { label: "Server ready", state: "partial" },
  { label: "Beta stable ready", state: "no" },
  { label: "Staging ready", state: "no" },
  { label: "SaaS implementable", state: "no" },
];

const CHANGELOG = [
  {
    date: "2026-06-02",
    title: "Public website & operational drivers module",
    items: [
      "New RouteTrust public site: landing, product, use cases, contact, updates.",
      "Operational Drivers CMS module with search, filters and create/edit.",
      "Shared UI primitives: table, tabs, drawer, states, alert banner.",
    ],
  },
  {
    date: "2026-06-02",
    title: "Base stabilization",
    items: [
      "Fixed production build coupling to stale dev type artifacts.",
      "Hardened session secret: no silent forgeable fallback.",
      "Added Playwright public smoke tests and lint ignore for vendored tooling.",
    ],
  },
  {
    date: "2026-06-01",
    title: "Honest readiness gate",
    items: [
      "beta-check now requires real build + non-500 routes + clean tree for stable.",
      "Health endpoint reports database and storage readiness honestly.",
    ],
  },
];

const stateMeta = {
  yes: { icon: CircleCheck, cls: "text-emerald-600", badge: "delivered" as const, label: "Yes" },
  partial: { icon: CircleDot, cls: "text-amber-600", badge: "paused" as const, label: "Partial" },
  no: { icon: CircleSlash, cls: "text-[#86868b]", badge: "pending" as const, label: "Not yet" },
};

export default function UpdatesPage() {
  const [health, setHealth] = useState<HealthPayload | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) setHealth(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <PublicShell>
      <section className="apple-hero-bg">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold text-[#10a37f]">Updates</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] lg:text-6xl">
              What&apos;s shipping, and where we honestly are.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6e6e73]">
              RouteTrust is {APP_VERSION} — {APP_VERSION_NOTE}. We don&apos;t claim production readiness we
              don&apos;t have. Here is the live status and recent changes.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_1.4fr] lg:px-8 lg:py-20">
          {/* Live status */}
          <Reveal>
            <div className="rounded-3xl border border-black/5 bg-[#f5f5f7] p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#1d1d1f]">Live status</h2>
                <Badge variant={health?.status === "healthy" ? "delivered" : health?.status ? "paused" : "pending"}>
                  {health?.status ?? "checking…"}
                </Badge>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <Row label="Version" value={health?.version ?? APP_VERSION} />
                <Row label="Database" value={health?.database ?? "—"} />
                <Row label="Storage" value={health?.storageMode ?? "—"} />
                <Row label="Auth" value={health?.authMode ?? "—"} />
                <Row label="Server ready" value={health?.serverReady ? "yes" : "no"} />
              </dl>
              {health?.betaBlockers && health.betaBlockers.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open blockers</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-amber-900">
                    {health.betaBlockers.map((blocker) => (
                      <li key={blocker}>• {blocker}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-6 space-y-2">
                {READINESS.map((item) => {
                  const meta = stateMeta[item.state];
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                      <span className="flex items-center gap-2 text-sm font-medium text-[#1d1d1f]">
                        <meta.icon className={`h-4 w-4 ${meta.cls}`} />
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-[#6e6e73]">{meta.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Changelog */}
          <Reveal delay={100}>
            <h2 className="text-2xl font-semibold text-[#1d1d1f]">Changelog</h2>
            <div className="mt-6 space-y-6">
              {CHANGELOG.map((entry) => (
                <div key={`${entry.date}-${entry.title}`} className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{entry.date}</span>
                    <h3 className="text-lg font-semibold text-[#1d1d1f]">{entry.title}</h3>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {entry.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[#6e6e73]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#10a37f]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/contact">Request a walkthrough</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
      <dt className="text-[#6e6e73]">{label}</dt>
      <dd className="font-medium text-[#1d1d1f]">{value}</dd>
    </div>
  );
}
