"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ClipboardList, LogOut, MapPinned, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

const nav = [
  { href: "/driver", label: "Resumen", icon: ClipboardList },
  { href: "/driver/route", label: "Ruta", icon: MapPinned },
];

export function DriverShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const currentUser = useRoutePulseStore((state) => state.currentUser);
  const logout = useRoutePulseStore((state) => state.logout);
  const setCurrentUser = useRoutePulseStore((state) => state.setCurrentUser);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let active = true;

    async function verifySession() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      }).catch(() => null);
      const payload = response?.ok ? ((await response.json().catch(() => null)) as { user?: SessionUser } | null) : null;

      if (!active) return;
      if (payload?.user?.role === "driver") {
        setCurrentUser(payload.user);
        return;
      }

      setCurrentUser(null);
      router.replace("/login");
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [mounted, router, setCurrentUser]);

  if (!mounted || !currentUser || currentUser.role !== "driver") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Cargando ruta...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <div className="mx-auto min-h-screen max-w-md bg-[#f5f5f7] shadow-2xl">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 px-5 py-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <Link href="/driver" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1d1d1f]">RoutePulse AI</p>
                <p className="text-xs font-medium text-[#86868b]">{currentUser.name}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Salir"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="pb-24">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-white/70 bg-white/80 px-4 py-3 backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-semibold text-slate-600",
                    "rounded-full text-[#424245]",
                    active && "bg-[#1d1d1f] text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
