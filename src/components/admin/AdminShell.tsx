"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Activity, BarChart3, Bug, FileText, LayoutDashboard, LogOut, Palette, Route, Settings, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/routes", label: "Rutas", icon: Route },
  { href: "/admin/kpis", label: "KPIs", icon: BarChart3 },
  { href: "/admin/cms", label: "CMS", icon: FileText },
  { href: "/admin/project-status", label: "Estado", icon: Activity },
  { href: "/admin/bug-reports", label: "Bugs", icon: Bug },
  { href: "/admin/design-system", label: "Design System", icon: Palette },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      }).catch(() => null);
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
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Cargando panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/70 bg-white/70 backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="flex h-20 items-center gap-3 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1d1d1f]">RoutePulse AI</p>
            <p className="text-xs font-medium text-[#86868b]">Control Tower Lite</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  "rounded-full text-[#424245] hover:bg-black/5 hover:text-[#1d1d1f]",
                  active && "bg-[#1d1d1f] text-white hover:bg-[#1d1d1f] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/70 p-4">
          <div className="mb-3 rounded-3xl bg-[#f5f5f7] p-4">
            <p className="text-sm font-semibold text-[#1d1d1f]">{currentUser.name}</p>
            <p className="text-xs font-medium text-[#86868b]">{currentUser.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/70 bg-white/80 px-4 backdrop-blur-2xl lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold text-[#1d1d1f]">
            <Truck className="h-5 w-5" />
            RoutePulse AI
          </Link>
          <div className="flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="rounded-full p-2 text-[#424245] hover:bg-black/5" aria-label={item.label}>
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
