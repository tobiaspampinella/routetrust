import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 bg-[#f5f5f7] px-5 pb-4 pt-8 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:pb-6 lg:pt-10">
      <div>
        {eyebrow ? <p className="text-sm font-semibold text-[#0066cc]">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-normal text-[#1d1d1f] lg:text-6xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-[#6e6e73] lg:text-lg">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
