import * as React from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared empty / loading / error states for data modules. Keep messaging honest:
 * an empty list is not an error, and a "not configured" backend is not "no data".
 */

interface StateShellProps {
  className?: string;
  children: React.ReactNode;
}

function StateShell({ className, children }: StateShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#e5e5ea] bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <StateShell className={className}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#86868b]">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1d1d1f]">{title}</p>
        {description ? <p className="mt-1 text-sm text-[#86868b]">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </StateShell>
  );
}

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading…", className }: LoadingStateProps) {
  return (
    <StateShell className={className}>
      <Loader2 className="h-6 w-6 animate-spin text-[#0071e3]" />
      <p className="text-sm font-medium text-[#6e6e73]">{label}</p>
    </StateShell>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <StateShell className={cn("border-red-200 bg-red-50", className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-800">{title}</p>
        {description ? <p className="mt-1 text-sm text-red-700">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </StateShell>
  );
}
