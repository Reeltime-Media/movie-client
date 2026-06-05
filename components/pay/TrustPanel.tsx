import type { LucideIcon } from "lucide-react";
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
    <aside className="rounded-xl border border-border bg-surface/80 p-5">
      <ul className="space-y-3">
        {items.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-[13px] text-text-muted">
            <Icon size={16} className="shrink-0 text-brand" aria-hidden />
            {label}
          </li>
        ))}
      </ul>

      {footer}

      <Link
        href={backHref}
        className="mt-4 inline-flex cursor-pointer text-[13px] font-medium text-text-muted transition-colors hover:text-text"
      >
        ← {backLabel}
      </Link>
    </aside>
  );
}
