import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type TrustItem = {
  icon: LucideIcon;
  label: string;
};

type TrustPanelProps = {
  items: TrustItem[];
  backHref: string;
  backLabel: string;
  footer?: ReactNode;
};

export function TrustPanel({ items, backHref, backLabel, footer }: TrustPanelProps) {
  return (
    <aside className="rounded-2xl border border-border bg-surface/70 p-5">
      <ul className="space-y-3.5">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-[13px] font-medium text-text">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
              <Icon size={16} strokeWidth={2} aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>

      {footer}

      <Link
        href={backHref}
        className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeft size={14} aria-hidden />
        {backLabel}
      </Link>
    </aside>
  );
}
