import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { posterUrl } from "@/lib/api/client";

type PayPageHeroProps = {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  subtitle: ReactNode;
  posterKey?: string | null;
  meta?: ReactNode;
};

export function PayPageHero({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  subtitle,
  posterKey,
  meta,
}: PayPageHeroProps) {
  const src = posterUrl(posterKey);

  return (
    <section className="pay-hero relative ml-[calc(50%-50vw)] w-screen max-w-[100vw] shrink-0 overflow-hidden border-b border-border">
      <div className="relative min-h-[300px] w-full sm:min-h-[340px] md:min-h-[380px]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            className="object-cover object-[center_15%]"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#141414]" />
        )}
        {/* Always dark — poster must read in light + dark app theme */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a0a0a] from-10% via-[#0a0a0a]/75 to-[#0a0a0a]/20" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/55 to-transparent md:max-w-[55%] md:via-[#0a0a0a]/70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_85%_30%,rgba(229,9,20,0.22),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-7xl flex-col justify-end px-4 pb-8 pt-16 sm:px-6 md:px-8 md:pb-10">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
            <BadgeIcon size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
            {badgeLabel}
          </div>
          <h1 className="max-w-3xl text-balance text-[28px] font-extrabold tracking-[-0.03em] text-white sm:text-[34px] md:text-[42px]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-white/75 md:text-[15px]">
            {subtitle}
          </p>
          {meta ? <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
      </div>
    </section>
  );
}
