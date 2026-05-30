import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "border-transparent bg-slate-900 text-white",
      pending: "border-slate-200 bg-slate-100 text-slate-700",
      in_progress: "border-blue-200 bg-blue-100 text-blue-800",
      delivered: "border-emerald-200 bg-emerald-100 text-emerald-800",
      failed: "border-red-200 bg-red-100 text-red-800",
      paused: "border-amber-200 bg-amber-100 text-amber-800",
      risk_low: "border-emerald-200 bg-emerald-100 text-emerald-800",
      risk_medium: "border-amber-200 bg-amber-100 text-amber-800",
      risk_high: "border-red-200 bg-red-100 text-red-800",
      outline: "border-border text-slate-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
