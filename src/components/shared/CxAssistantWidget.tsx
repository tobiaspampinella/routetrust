"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageSquare, Send, Shield, User, X, Zap } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import { useRoutePulseStore } from "@/store/routePulseStore";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tone?: "default" | "critical";
  action?: { label: string; onClick: () => void };
};

type AgentStatus = {
  id: string;
  name: string;
  status: string;
  mode: string;
};

function initialCopy(pathname: string) {
  if (pathname.startsWith("/admin")) return "Admin context active. I classify real bugs, UX defects, QA validation requests, and security risks for this admin surface.";
  if (pathname.startsWith("/driver")) return "Driver context active. I focus on route progression, stop actions, ETA trust, and execution blockers.";
  if (pathname.startsWith("/track")) return "Tracking context active. I focus on ETA clarity, tracking confidence, map issues, and customer-facing friction.";
  return "Local website assistant active. I answer from page context and only open a ticket when the message is actionable.";
}

export function CxAssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "intro",
      role: "assistant",
      content: initialCopy(pathname),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { currentUser, packages, recalculateRouteEta } = useRoutePulseStore(
    useShallow((state) => ({
      currentUser: state.currentUser,
      packages: state.packages,
      recalculateRouteEta: state.recalculateRouteEta,
    })),
  );

  useEffect(() => {
    setMessages([
      {
        id: `intro-${pathname}`,
        role: "assistant",
        content: initialCopy(pathname),
      },
    ]);
  }, [pathname]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    let active = true;

    async function loadAgentStatuses() {
      const response = await fetch("/api/agents", { credentials: "include" }).catch(() => null);
      const payload = (await response?.json().catch(() => null)) as { agents?: AgentStatus[] } | null;
      if (!active || !payload?.agents) return;
      setAgentStatuses(payload.agents);
    }

    void loadAgentStatuses();

    return () => {
      active = false;
    };
  }, []);

  function appendAssistantMessage(content: string, tone: Message["tone"] = "default", action?: Message["action"]) {
    setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", content, tone, action }]);
  }

  async function handleAssistantRequest(text: string) {
    const lower = text.toLowerCase();

    if (lower.includes("eta") || lower.includes("trafico") || lower.includes("recalcular")) {
      appendAssistantMessage(
        "ETA workflow detected. The local model can recalculate the primary route immediately, but that is operational support, not bug triage.",
        "default",
        pathname.startsWith("/admin") || pathname.startsWith("/driver")
          ? {
              label: "Recalculate route-001",
              onClick: () => {
                recalculateRouteEta("route-001");
                appendAssistantMessage("ETA recalculated for route-001.");
              },
            }
          : undefined,
      );
      return;
    }

    if (lower.includes("estado") || lower.includes("resumen")) {
      const pending = packages.filter((item) => item.status === "pending").length;
      const delivered = packages.filter((item) => item.status === "delivered").length;
      const activeAgents = agentStatuses.filter((agent) => agent.status === "running" || agent.status === "pending").length;
      appendAssistantMessage(`Context snapshot: ${pending} pending packages, ${delivered} delivered, ${activeAgents} active critical agents. Page: ${pathname}.`);
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        message: text,
        pathname,
        createTicket: true,
      }),
    }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as
      | {
          reply?: string;
          decision?: {
            category: string;
            severity: string;
            module: string;
            assignedAgents: string[];
            pageContext: { pageLabel: string };
            primaryAgent: string;
            shouldCreateTicket: boolean;
            confidence: number;
            triageNotes: string[];
          };
          ticket?: { id: string; status: string };
          routing?: { primaryAgent: string; collaboratingAgents: string[]; notifyTelegram: boolean; escalationLane: string };
        }
      | null;
    setIsSubmitting(false);

    if (!response?.ok || !payload?.reply || !payload.decision) {
      appendAssistantMessage("Assistant routing failed. No reliable classification or persistence was produced.", "critical");
      return;
    }

    const lines = [
      payload.reply,
      `Category: ${payload.decision.category}. Severity: ${payload.decision.severity}. Module: ${payload.decision.module}. Confidence: ${(payload.decision.confidence * 100).toFixed(0)}%.`,
    ];

    if (payload.ticket && payload.routing) {
      lines.push(`Ticket: ${payload.ticket.id} (${payload.ticket.status}). Primary agent: ${payload.routing.primaryAgent}. Lane: ${payload.routing.escalationLane}.`);
      if (payload.routing.collaboratingAgents.length > 0) {
        lines.push(`Collaborators: ${payload.routing.collaboratingAgents.join(", ")}.`);
      }
      if (payload.routing.notifyTelegram) {
        lines.push("High severity alert flagged for escalation.");
      }
    } else if (!payload.decision.shouldCreateTicket) {
      lines.push("No ticket created because the message looks informational or too weakly specified.");
    } else if (!currentUser) {
      lines.push("No authenticated operator session. Guidance is contextual, but no durable ticket was created.");
    }

    if (payload.decision.triageNotes.length > 0) {
      lines.push(`Triage: ${payload.decision.triageNotes[0]}`);
    }

    appendAssistantMessage(lines.join(" "), payload.decision.severity === "P0" || payload.decision.severity === "P1" ? "critical" : "default");
  }

  function handleSend() {
    if (!input.trim() || isSubmitting) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, role: "user", content: userMsg }]);
    setInput("");
    void handleAssistantRequest(userMsg);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
        aria-label="Open local assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {isOpen ? (
        <div className="fixed bottom-6 right-6 z-50 flex h-[540px] w-[380px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-sky-400" />
              <span className="font-bold">Local Ops Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-slate-800" aria-label="Close local assistant">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
            Path: {pathname} {currentUser ? `| Role: ${currentUser.role}` : "| Public session"}
          </div>
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Critical agents</p>
            <p className="mt-1 text-xs text-slate-600">
              {agentStatuses.length > 0
                ? agentStatuses.map((agent) => `${agent.name}: ${agent.status}`).join(" | ")
                : "Agent runtime status unavailable."}
            </p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-sky-500 text-white" : msg.tone === "critical" ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : msg.tone === "critical" ? <Shield className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex max-w-[82%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-sky-500 text-white"
                        : msg.tone === "critical"
                          ? "border border-rose-200 bg-rose-50 text-rose-950 shadow-sm"
                          : "border border-slate-200 bg-white text-slate-800 shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.action ? (
                    <Button size="sm" variant="outline" className="border-sky-200 bg-white text-xs text-sky-600 hover:bg-sky-50" onClick={msg.action.onClick}>
                      {msg.action.label}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Describe bug, UX issue, QA validation, or security risk..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSubmitting}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white disabled:bg-slate-200"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
