"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Truck } from "lucide-react";
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

  const getTargetPath = useCallback((user: SessionUser) => {
    if (nextPath?.startsWith("/admin") && user.role === "admin") return nextPath;
    if (nextPath?.startsWith("/driver") && user.role === "driver") return nextPath;
    return user.role === "admin" ? "/admin" : "/driver";
  }, [nextPath]);

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
    <main className="apple-hero-bg min-h-screen px-5 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <nav className="mb-10 flex h-11 items-center justify-between rounded-full bg-white/70 px-5 text-sm font-semibold text-[#1d1d1f] shadow-sm backdrop-blur-2xl">
          <Link href="/login" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            RoutePulse AI
          </Link>
          <Link href="/track/demo" className="apple-link">
            Ver demo cliente
          </Link>
        </nav>

        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-[#0066cc]">Control Tower Lite</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-5xl font-semibold tracking-normal text-[#1d1d1f] sm:text-7xl">
            Ultima milla, clara al instante.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#6e6e73]">
            ETA predictivo, pausas, riesgo operativo y KPIs vivos para operadores logisticos en LatAm.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[34px] bg-white shadow-apple lg:grid-cols-[1fr_0.82fr]">
          <section className="relative min-h-[520px] apple-dark-hero p-8 text-white">
            <div className="absolute inset-0 opacity-45 route-grid" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#1d1d1f]">
                  <Truck className="h-6 w-6" />
                </div>
                <h2 className="mt-8 max-w-lg text-5xl font-semibold tracking-normal">RoutePulse AI</h2>
                <p className="mt-4 max-w-md text-lg font-medium leading-8 text-[#f5f5f7]/80">
                  No mostramos solo donde esta el chofer. Calculamos que significa para cada entrega pendiente.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric value="60" label="paquetes" />
                <Metric value="3" label="rutas" />
                <Metric value="0" label="API keys" />
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-10">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f2ff] text-[#0071e3]">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold">Login demo</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
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
                  {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
                  <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                    {submitting ? "Validando..." : "Entrar"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6">
                  <Link href="/track/demo" className="flex w-full justify-center apple-link rounded-2xl bg-white px-4 py-3 text-sm font-semibold border border-slate-200 hover:bg-[#f5f5f7]">
                    Ver tracking cliente demo
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm font-medium text-white/65">{label}</p>
    </div>
  );
}
