import Image from "next/image";
import type { ReactNode } from "react";
import { posterUrl } from "@/lib/api/client";

export function ContentDetailHero({
  posterKey,
  kicker,
  title,
  description,
  actions,
}: {
  posterKey?: string | null;
  kicker?: ReactNode;
  title: string;
  description?: string | null;
  actions?: ReactNode;
}) {
  const src = posterUrl(posterKey);

  return (
    <section className="relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] shrink-0 overflow-hidden border-b border-border">
      <div className="relative min-h-[min(52vh,520px)] w-full md:min-h-[min(48vh,480px)]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-surface-elevated" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-bg from-20% via-bg/80 to-bg/25" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-bg/95 via-bg/55 to-transparent md:via-bg/40" />

        <div className="relative z-10 flex min-h-[inherit] flex-col justify-end px-6 pb-8 pt-20 md:px-10 lg:px-12">
          {kicker ? (
            <div className="mb-2 text-[12px] font-semibold tracking-[0.12em] text-text-muted">
              {kicker}
            </div>
          ) : null}
          <h1 className="max-w-5xl text-[32px] font-extrabold tracking-[-0.02em] text-text md:text-[40px] lg:text-[46px]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-text-muted md:text-[15px]">
              {description}
            </p>
          ) : null}
          {actions ? <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
