import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
}

const toneClasses = {
  blue: "bg-[#6ee7f9]/12 text-[#6ee7f9]",
  green: "bg-emerald-400/12 text-emerald-300",
  amber: "bg-amber-400/12 text-amber-300",
  red: "bg-rose-400/12 text-rose-300",
  slate: "bg-white/6 text-[#b49bff]",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "slate" }: StatCardProps) {
  return (
    <Card className="ops-card-glow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/52">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
            {detail ? <p className="mt-1 text-xs font-medium text-white/36">{detail}</p> : null}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
