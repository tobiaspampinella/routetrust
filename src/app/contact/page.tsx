"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertBanner } from "@/components/ui/alert-banner";
import { PublicShell } from "@/components/public/PublicShell";
import { Reveal } from "@/components/public/Reveal";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", interest: "demo", message: "" });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitted(true);
  }

  return (
    <PublicShell>
      <section className="apple-hero-bg">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <Reveal>
            <p className="text-sm font-semibold text-[#10a37f]">Contact</p>
            <h1 className="mt-3 text-5xl font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] lg:text-6xl">
              Let&apos;s put your operation on RouteTrust.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#6e6e73]">
              Request a demo or ask anything about the platform. We&apos;ll walk you through the operator
              console, tracking experience and the AI approval workflow.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-[#1d1d1f]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Mail className="h-5 w-5 text-[#10a37f]" />
                </span>
                <span className="text-sm font-medium">Guided demo of the full operator console</span>
              </div>
              <div className="flex items-center gap-3 text-[#1d1d1f]">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <MessageSquare className="h-5 w-5 text-[#10a37f]" />
                </span>
                <span className="text-sm font-medium">Answers on local-first deployment and roadmap</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-apple">
              {submitted ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <h2 className="text-2xl font-semibold text-[#1d1d1f]">Thanks, {form.name.split(" ")[0] || "there"}!</h2>
                  <p className="max-w-sm text-[#6e6e73]">
                    Your request was captured locally. This is a demo build, so nothing was sent to a server —
                    in production this reaches the RouteTrust team.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/track/demo">Explore the tracking demo</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <AlertBanner tone="demo" title="Demo build">
                    This form captures input locally and does not send email yet.
                  </AlertBanner>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name">Name</Label>
                      <Input id="c-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-email">Work email</Label>
                      <Input id="c-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-company">Company</Label>
                    <Input id="c-company" value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-interest">I&apos;m interested in</Label>
                    <Select id="c-interest" value={form.interest} onChange={(e) => set("interest", e.target.value)}>
                      <option value="demo">A guided demo</option>
                      <option value="pricing">Pricing & deployment</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Something else</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-message">Message</Label>
                    <Textarea id="c-message" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us about your operation…" />
                  </div>
                  <Button type="submit" size="lg" className="w-full rounded-xl">
                    Request demo
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
