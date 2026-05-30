"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Zap } from "lucide-react";
import { useRoutePulseStore } from "@/store/routePulseStore";
import { Button } from "@/components/ui/button";
import { useShallow } from "zustand/react/shallow";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: { label: string; onClick: () => void };
};

export function CxAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Soy el inbox QA/CX local. Puedo registrar fricciones de la demo, resumir operación y disparar acciones mock seguras como recalcular ETA.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { packages, recalculateRouteEta } = useRoutePulseStore(
    useShallow((state) => ({
      packages: state.packages,
      recalculateRouteEta: state.recalculateRouteEta,
    })),
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setInput("");

    // Simulate AI thinking
    setTimeout(() => {
      processMockAi(userMsg);
    }, 600);
  };

  const processMockAi = (text: string) => {
    const lower = text.toLowerCase();
    const id = Date.now().toString();

    if (lower.includes("trafico") || lower.includes("tráfico") || lower.includes("recalcular") || lower.includes("eta")) {
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: "Detecté una posible fricción de ETA. Puedo recalcular la ruta principal con las reglas locales del tester.",
          action: {
            label: "Recalcular ETA Ruta 1",
            onClick: () => {
              recalculateRouteEta("route-001");
              setMessages((m) => [...m, { id: Date.now().toString(), role: "assistant", content: "ETA recalculado para route-001." }]);
            }
          }
        }
      ]);
    } else if (lower.includes("problema") || lower.includes("bug") || lower.includes("queja")) {
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: "Reporte registrado en la cola QA/CX local. Para cambios de código o integraciones reales, el agente principal debe revisar y aplicar el ajuste en el repo.",
          action: {
            label: "Marcar como P1",
            onClick: () => {
              setMessages((m) => [...m, { id: Date.now().toString(), role: "assistant", content: "Quedó marcado como P1 en esta sesión local." }]);
            }
          }
        }
      ]);
    } else if (lower.includes("resumen") || lower.includes("estado")) {
      const pending = packages.filter(p => p.status === "pending").length;
      const delivered = packages.filter(p => p.status === "delivered").length;
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: `Actualmente tenemos ${pending} paquetes pendientes y ${delivered} entregados a nivel global. El SLA general está estable.`,
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: "assistant",
          content: "Entendido. En esta versión trabajo con reglas locales: reporto bugs, priorizo fricciones y puedo recalcular ETA. Prueba: 'hay un bug en driver' o 'recalcular ETA'.",
        }
      ]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-sky-400" />
              <span className="font-bold">CX Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-sky-500 text-white" : "bg-white border border-slate-200 text-slate-800 shadow-sm"}`}>
                    {msg.content}
                  </div>
                  {msg.action && (
                    <Button size="sm" variant="outline" className="text-xs bg-white text-sky-600 border-sky-200 hover:bg-sky-50" onClick={msg.action.onClick}>
                      {msg.action.label}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white disabled:bg-slate-200"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
