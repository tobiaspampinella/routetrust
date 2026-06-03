import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Info, CheckCircle2, AlertTriangle, XCircle, FlaskConical } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Inline banner for honest status messaging (demo mode, SLA risk, incidents, config gaps).
 * Tones follow the product palette rule: blue=info, green=success, amber=warning,
 * red=danger, and a distinct "demo" tone so demo data is never mistaken for live data.
 */
const alertBannerVariants = cva("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm", {
  variants: {
    tone: {
      info: "border-blue-200 bg-blue-50 text-blue-900",
      success: "border-emerald-200 bg-emerald-50 text-emerald-900",
      warning: "border-amber-200 bg-amber-50 text-amber-900",
      danger: "border-red-200 bg-red-50 text-red-900",
      demo: "border-violet-200 bg-violet-50 text-violet-900",
    },
  },
  defaultVariants: { tone: "info" },
});

const toneIcon: Record<NonNullable<VariantProps<typeof alertBannerVariants>["tone"]>, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  demo: FlaskConical,
};

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  title?: string;
  icon?: LucideIcon;
}

export function AlertBanner({ className, tone = "info", title, icon, children, ...props }: AlertBannerProps) {
  const Icon = icon ?? toneIcon[tone ?? "info"];
  return (
    <div className={cn(alertBannerVariants({ tone, className }))} role="status" {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div> : null}
      </div>
    </div>
  );
}
