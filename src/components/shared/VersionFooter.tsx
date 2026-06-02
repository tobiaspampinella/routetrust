"use client";

import { ChevronUp, History, Rocket } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { APP_VERSION, APP_VERSION_HISTORY, APP_VERSION_NOTE } from "@/lib/version";

export function VersionFooter() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname.startsWith("/track")) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 hidden w-[22rem] sm:block">
      <div
        id="site-version-history"
        className={`absolute bottom-full right-0 mb-3 w-full overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#070811]/94 text-white shadow-[0_24px_80px_rgba(0,0,0,0.46)] backdrop-blur-3xl transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(94,234,212,0.18),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">RouteTrust status</p>
              <p className="mt-1 text-sm font-semibold text-white">Sitio en {APP_VERSION}</p>
              <p className="mt-1 text-xs text-white/62">{APP_VERSION_NOTE}</p>
            </div>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
              actual
            </span>
          </div>
        </div>

        <div className="ops-scrollbar max-h-[22rem] space-y-3 overflow-y-auto px-4 py-4">
          {APP_VERSION_HISTORY.map((entry) => (
            <section key={entry.version} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{entry.version}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">{entry.date}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {entry.title}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/70">{entry.summary}</p>
              <div className="mt-3">
                <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/88">
                  <Rocket className="h-3.5 w-3.5" />
                  Aplicaciones realizadas
                </p>
                <ul className="mt-2 space-y-2 text-xs text-white/68">
                  {entry.applied.map((item) => (
                    <li key={item} className="rounded-xl border border-white/7 bg-black/20 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="ml-auto flex w-full items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0c0c14]/88 px-4 py-3 text-left shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition hover:border-cyan-300/30 hover:bg-[#10101a]"
        aria-expanded={isOpen}
        aria-controls="site-version-history"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">Version del sitio</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">RoutePulse AI {APP_VERSION}</p>
          <p className="mt-0.5 truncate text-[11px] text-white/54">{APP_VERSION_NOTE}</p>
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <History className="h-4 w-4" />
          <ChevronUp
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
          />
        </div>
      </button>
    </div>
  );
}
