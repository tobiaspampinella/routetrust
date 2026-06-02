"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Bug,
  FileText,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/routes", label: "Rutas", icon: Route },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/kpis", label: "KPIs", icon: BarChart3 },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/project-status", label: "Estado", icon: Activity },
  { href: "/admin/bug-reports", label: "Bugs", icon: Bug },
  { href: "/admin/settings", label: "Ajustes", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
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
      const response = await fetch("/api/auth/me", { credentials: "include" }).catch(() => null);
      const payload = response?.ok ? ((await response.json().catch(() => null)) as { user?: SessionUser } | null) : null;

      if (!active) return;
      if (payload?.user?.role === "admin") {
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

  if (!mounted || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="ops-shell-bg flex min-h-screen items-center justify-center">
        <div className="ops-panel rounded-[2rem] px-6 py-4 text-sm text-white/70">Cargando panel operativo...</div>
      </div>
    );
  }

  return (
    <div className="ops-shell-bg min-h-screen text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] gap-4 px-3 py-3 md:px-4 lg:gap-6 lg:px-6 lg:py-6">
        <aside className="ops-panel hidden w-[104px] shrink-0 rounded-[2rem] lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-24 items-center justify-center border-b border-white/6">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-white/5 ring-1 ring-white/10">
                <Truck className="h-6 w-6 text-[#b49bff]" />
              </div>
            </div>
            <nav className="flex flex-col items-center gap-3 px-3 py-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-transparent text-white/50 transition-all hover:border-white/10 hover:bg-white/6 hover:text-white",
                      active && "bg-[#17172a] text-[#b49bff] ring-1 ring-[#b49bff]/40",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-white/6 p-3">
            <div className="ops-panel-soft rounded-[1.4rem] p-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#b49bff] to-[#6ee7f9] text-sm font-bold text-[#0b0b13]">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="mt-3 text-xs font-semibold text-white">{currentUser.name}</p>
              <p className="mt-1 text-[11px] text-white/45">{currentUser.email}</p>
              <Button
                variant="ghost"
                className="mt-3 h-10 w-full justify-start rounded-xl border border-white/8 bg-white/4 text-white/72 hover:bg-white/8 hover:text-white"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="ops-panel mb-4 flex items-center justify-between rounded-[1.75rem] px-4 py-3 lg:hidden">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-[#b49bff] ring-1 ring-white/10">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">RouteTrust</p>
                <p className="text-xs text-white/50">Operations Center</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white/75 hover:bg-white/8 hover:text-white"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </header>

          <main className="pb-24 lg:pb-0">{children}</main>

          <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
            <div className="ops-panel grid grid-cols-5 rounded-[1.6rem] px-2 py-2">
              {navigation.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-[1rem] px-2 py-2 text-[11px] font-medium text-white/46",
                      active && "bg-white/8 text-[#c7b7ff]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
