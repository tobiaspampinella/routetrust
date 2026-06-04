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
  blue: "bg-brand-50 text-brand",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-[#f5f5f7] text-[#1d1d1f]",
};

export function StatCard({ label, value, detail, icon: Icon, tone = "slate" }: StatCardProps) {
  return (
    <Card className="border-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#6e6e73]">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-[#1d1d1f]">{value}</p>
            {detail ? <p className="mt-1 text-xs font-medium text-[#86868b]">{detail}</p> : null}
          </div>
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
