import Link from "next/link";
import { ReactNode } from "react";

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
    <section className="px-6 pb-6 pt-7 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker ? (
            <div className="text-[12px] font-semibold tracking-[0.12em] text-text-muted">
              {kicker}
            </div>
          ) : null}
          <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.02em]">
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

