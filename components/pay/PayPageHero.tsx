import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { posterUrl } from "@/lib/api/client";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

type PayPageHeroProps = {
  title: string;
  subtitle: ReactNode;
  posterKey?: string | null;
  bannerKey?: string | null;
  meta?: ReactNode;
  badgeIcon?: LucideIcon;
  badgeLabel?: string;
};

export function PayPageHero({
  title,
  subtitle,
  posterKey,
  bannerKey,
  meta,
  badgeIcon: BadgeIcon,
  badgeLabel,
}: PayPageHeroProps) {
  const bgImage = posterUrl(bannerKey) ?? posterUrl(posterKey);
  const hasImage = Boolean(bgImage);

  return (
    <div
      className="relative left-auto ml-[calc(50%-50vw)] w-screen max-w-none shrink-0 overflow-hidden border-b border-border min-h-[220px] sm:min-h-[260px] md:min-h-[300px]"
      role="img"
      aria-label={title}
    >
      {hasImage ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center blur-[2px]"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-surface-elevated" />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_-20%,rgba(229,9,20,0.28),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.42) 0%, rgba(10,10,10,0.72) 50%, rgba(10,10,10,0.94) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20 md:from-black/85 md:via-black/45"
      />

      <div className="relative z-[1] mx-auto flex min-h-[inherit] max-w-6xl flex-col justify-end px-6 py-8 md:px-8 md:pb-10 md:pt-12">
        {BadgeIcon && badgeLabel ? (
          <div
            className={["rt-page-fade-up", kickerBadgeClassName].join(" ")}
            style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
          >
            <BadgeIcon size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
            {badgeLabel}
          </div>
        ) : null}
        <h1
          className={[
            "rt-page-fade-up",
            BadgeIcon && badgeLabel ? "mt-4" : "",
            pageTitleOnHeroClassName,
          ].join(" ")}
          style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
        >
          {title}
        </h1>
        <p
          className="rt-page-fade-up mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/78"
          style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
        >
          {subtitle}
        </p>
        {meta ? (
          <div
            className="rt-page-fade-up mt-4 flex flex-wrap gap-2"
            style={{ "--rt-enter-delay": "165ms" } as CSSProperties}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
