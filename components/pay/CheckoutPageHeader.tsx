import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { sectionKickerClassName } from "@/lib/ui/surfaces";

type CheckoutPageHeaderProps = {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: ReactNode;
};

export function CheckoutPageHeader({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
}: CheckoutPageHeaderProps) {
  return (
    <header className="border-b border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-8">
        <div className={`inline-flex items-center gap-2 ${sectionKickerClassName}`}>
          <BadgeIcon size={13} className="text-brand" aria-hidden />
          {badgeLabel}
        </div>
        <h1 className={["mt-3", pageTitleClassName].join(" ")}>{title}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text-muted">
          {description}
        </p>
      </div>
    </header>
  );
}
