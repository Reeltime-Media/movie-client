import Link from "next/link";
import { ReactNode } from "react";
import { pageTitleClassName } from "@/lib/ui/page-title";

export function PageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section className="box-border ml-[calc(50%-50vw)] w-screen max-w-none shrink-0 pb-6 pl-6 pr-6 pt-7 md:pl-8 md:pr-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker ? (
            <div className="text-[12px] font-semibold tracking-[0.12em] text-text-muted">
              {kicker}
            </div>
          ) : null}
          <h1 className={["mt-2", pageTitleClassName].join(" ")}>
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-text-muted">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <Link
            href={action.href}
            className="rounded-[6px] border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

