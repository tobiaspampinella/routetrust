"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Clock, Globe2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-sky-500/30">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-sky-500" />
            <span className="text-lg font-bold tracking-tight">RoutePulse <span className="text-sky-500">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-slate-300 hover:text-white">
              <Link href="/track/demo">Demo Cliente</Link>
            </Button>
            <Button asChild className="bg-white text-slate-950 hover:bg-slate-200">
              <Link href="/login">Acceso Operador</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="absolute inset-0 apple-dark-hero -z-10" />
          <div className="mx-auto max-w-7xl px-6 text-center">
            <div className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-300 opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
              <Zap className="h-4 w-4" />
              <span>La revolución de última milla en LatAm</span>
            </div>
            <h1 className="mt-8 animate-fade-in-up text-5xl font-black tracking-tight text-white sm:text-7xl opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Control Tower Lite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">para logística moderna</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-lg text-slate-400 opacity-0" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
              No somos solo un tracking. Calculamos ETA predictivo por ventana, riesgo operativo en vivo e insights para operadores logísticos de pequeñas y medianas empresas.
            </p>
            <div className="mt-10 flex animate-fade-in-up flex-wrap justify-center gap-4 opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              <Button asChild size="lg" className="h-14 px-8 text-base bg-white text-slate-950 hover:bg-slate-200 rounded-full">
                <Link href="/login">
                  Ingresar al Web Tester
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard
                icon={Clock}
                title="ETA Predictivo Real"
                description="Analizamos tráfico, tiempo de drop-off y pausas para calcular el cierre del día."
              />
              <FeatureCard
                icon={BarChart3}
                title="Copiloto Operativo"
                description="Reglas predictivas que alertan riesgos y sugieren reasignaciones en vivo."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="SLA Proyectado"
                description="Visualiza el porcentaje de cumplimiento que tendrás al final del día."
              />
            </div>
          </div>
        </section>

        {/* Demo Teaser */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Experimenta la visibilidad total</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
              Usa nuestra demo interactiva para ver el tracking de clientes con simulación de avance, cálculo de ETA en ventanas y mapa isométrico.
            </p>
            <Button asChild size="lg" variant="outline" className="mt-8 h-14 px-8 text-base rounded-full border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white">
              <Link href="/track/demo">Abrir simulación cliente</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>RoutePulse AI Tester © 2026. Versión 0.06.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-colors hover:bg-white/10">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-slate-400">{description}</p>
    </div>
  );
}
