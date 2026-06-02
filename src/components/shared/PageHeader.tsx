import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 px-5 pb-5 pt-8 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:pb-6 lg:pt-8">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#cdbfff]">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-4xl text-4xl font-semibold tracking-tight text-white lg:text-6xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-base leading-7 text-white/56 lg:text-lg">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
