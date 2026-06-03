"use client";

import { usePathname } from "next/navigation";
import { APP_VERSION, APP_VERSION_NOTE } from "@/lib/version";

export function VersionFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/track")) return null;

  return (
    <div className="fixed bottom-2 right-3 z-50 hidden rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-[#6e6e73] shadow-sm backdrop-blur-2xl sm:block">
      RouteTrust {APP_VERSION} · {APP_VERSION_NOTE}
    </div>
  );
}
