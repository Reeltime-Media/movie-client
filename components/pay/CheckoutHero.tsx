import type { LucideIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

type CheckoutHeroProps = {
  badgeIcon: LucideIcon;
  badgeLabel: string;
  title: string;
  description: ReactNode;
  /** Movie/series poster — blurred behind hero when set. */
  posterSrc?: string | null;
  /** Fallback ambience when no poster (Unsplash / marketing). */
  fallbackImageSrc: string;
  imageDescription: string;
};

export function CheckoutHero({
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  posterSrc,
  fallbackImageSrc,
  imageDescription,
}: CheckoutHeroProps) {
  const bgImage = posterSrc ?? fallbackImageSrc;
  const usesPoster = Boolean(posterSrc);

  return (
    <div
      className="relative left-auto ml-[calc(50%-50vw)] w-screen max-w-none shrink-0 overflow-hidden border-b border-border min-h-[220px] sm:min-h-[260px] md:min-h-[300px]"
      role="img"
      aria-label={imageDescription}
    >
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 bg-cover bg-center",
          usesPoster ? "scale-105 blur-[2px]" : "",
        ].join(" ")}
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
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
        <div
          className={["rt-page-fade-up", kickerBadgeClassName].join(" ")}
          style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
        >
          <BadgeIcon size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
          {badgeLabel}
        </div>
        <h1
          className={["rt-page-fade-up mt-4", pageTitleOnHeroClassName].join(" ")}
          style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
        >
          {title}
        </h1>
        <p
          className="rt-page-fade-up mt-2.5 max-w-xl text-[14px] leading-relaxed text-white/78"
          style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
