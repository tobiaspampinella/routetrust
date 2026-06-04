"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Radar, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/types";
import { useRoutePulseStore } from "@/store/routePulseStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useRoutePulseStore((state) => state.login);
  const setCurrentUser = useRoutePulseStore((state) => state.setCurrentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState<string | null | undefined>(undefined);

  const getTargetPath = useCallback(
    (user: SessionUser) => {
      if (nextPath?.startsWith("/admin") && user.role === "admin") return nextPath;
      if (nextPath?.startsWith("/driver") && user.role === "driver") return nextPath;
      return user.role === "admin" ? "/admin" : "/driver";
    },
    [nextPath],
  );

  useEffect(() => {
    setNextPath(new URLSearchParams(window.location.search).get("next"));
  }, []);

  useEffect(() => {
    let active = true;
    if (nextPath === undefined) return;

    async function hydrateSession() {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      }).catch(() => null);
      if (!active || !response?.ok) return;

      const payload = (await response.json().catch(() => null)) as { user?: SessionUser } | null;
      if (!payload?.user) return;

      setCurrentUser(payload.user);
      router.replace(getTargetPath(payload.user));
    }

    hydrateSession();

    return () => {
      active = false;
    };
  }, [getTargetPath, nextPath, router, setCurrentUser]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(getTargetPath(result.user));
  }

  return (
    <main className="ops-shell-bg min-h-screen px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1480px]">
        <nav className="ops-panel flex h-16 items-center justify-between rounded-[1.8rem] px-5 text-sm">
          <Link href="/login" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-[#b49bff] ring-1 ring-white/10">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold">RouteTrust</p>
              <p className="text-xs text-white/40">Operations access</p>
            </div>
          </Link>
          <Link href="/track/demo" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/68 hover:bg-white/10 hover:text-white">
            Ver demo cliente
          </Link>
        </nav>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="ops-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,155,255,0.18),transparent_28%)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#b49bff]/18 bg-[#b49bff]/10 px-4 py-2 text-sm text-[#d7ceff]">
                <Radar className="h-4 w-4" />
                Control Tower Lite
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-6xl">
                Acceso a una plataforma operativa diseñada para lectura rápida y control real.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/58 sm:text-lg">
                El login ahora entra a un entorno visual consistente con el dashboard: oscuro, denso, jerarquizado y usable en desktop y móvil.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <Metric value="20K" label="despachos" />
                <Metric value="65%" label="margen operativo" />
                <Metric value="3" label="rutas activas" />
              </div>
            </div>
          </section>

          <Card className="rounded-[2rem]">
            <CardHeader className="p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#b49bff] ring-1 ring-white/10">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <CardTitle className="mt-4 text-3xl">Login demo</CardTitle>
              <p className="text-sm leading-7 text-white/48">Las credenciales de acceso se generan y gestionan solo en entornos locales autorizados.</p>
            </CardHeader>
            <CardContent className="space-y-5 p-6 pt-0 sm:p-8 sm:pt-0">
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="current-password"
                  />
                </div>
                {error ? <p className="rounded-2xl border border-rose-400/18 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">{error}</p> : null}
                <Button type="submit" size="lg" className="h-14 w-full rounded-xl bg-brand text-white hover:bg-brand-dark" disabled={submitting}>
                  {submitting ? "Validando..." : "Entrar"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <Link
                href="/track/demo"
                className="flex w-full justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/72 hover:bg-white/10 hover:text-white"
              >
                Ver tracking cliente demo
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.035] p-5">
      <p className="text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/44">{label}</p>
    </div>
  );
}
