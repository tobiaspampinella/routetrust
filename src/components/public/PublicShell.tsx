"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_VERSION } from "@/lib/version";

const NAV = [
  { href: "/product", label: "Product" },
  { href: "/use-cases", label: "Use cases" },
  { href: "/updates", label: "Updates" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_GROUPS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: "Product",
    links: [
      { href: "/product", label: "Platform" },
      { href: "/use-cases", label: "Use cases" },
      { href: "/track/demo", label: "Tracking demo" },
      { href: "/updates", label: "Updates" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/updates", label: "Changelog" },
    ],
  },
  {
    title: "Access",
    links: [
      { href: "/login", label: "Operator login" },
      { href: "/track/demo", label: "Customer tracking" },
    ],
  },
];

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="RouteTrust home">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
              <Truck className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">RouteTrust</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium text-[#424245] transition-colors hover:bg-black/5 hover:text-[#1d1d1f]",
                  pathname === item.href && "text-[#1d1d1f]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Operator login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/contact">Request demo</Link>
            </Button>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-[#1d1d1f] hover:bg-black/5 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-black/5 bg-white px-5 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-[#424245] hover:bg-black/5"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href="/contact">Request demo</Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="pt-16">{children}</main>

      <footer className="border-t border-black/5 bg-[#f5f5f7]">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1d1d1f] text-white">
                  <Truck className="h-5 w-5" />
                </span>
                <span className="text-lg font-semibold tracking-tight">RouteTrust</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-[#6e6e73]">
                Operational intelligence for logistics teams. AI-built, human-orchestrated.
              </p>
            </div>
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-[#1d1d1f]">{group.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link href={link.href} className="text-sm text-[#6e6e73] transition-colors hover:text-[#1d1d1f]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-black/5 pt-6 text-xs text-[#86868b] sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RouteTrust · {APP_VERSION} · Local demo build</p>
            <p>AI-built, human-orchestrated operational intelligence platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
