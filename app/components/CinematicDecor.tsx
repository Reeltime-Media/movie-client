import type { ReactNode } from "react";

const overlayVertical =
  "linear-gradient(to bottom, rgba(10,10,10,0.48) 0%, rgba(10,10,10,0.72) 45%, rgba(10,10,10,0.92) 100%)";

type CinematicDecorProps = {
  imageSrc: string;
  /** Short description for screen readers (photo is decorative but we expose context). */
  imageDescription: string;
  minHeightClass?: string;
  /** Subtle brand radial, works well on series / home. */
  showBrandGlow?: boolean;
  /**
   * Span the full viewport width when this strip sits inside a max-width shell
   * (e.g. movies/series hero). Ignored when the strip is already in an inset card.
   */
  viewportBleed?: boolean;
  children: ReactNode;
};

/**
 * Full-width hero strip: background photo + dark gradients (same idea as login/register side panels).
 */
export function CinematicDecor({
  imageSrc,
  imageDescription,
  minHeightClass = "min-h-[220px] sm:min-h-[260px] md:min-h-[300px]",
  showBrandGlow = false,
  viewportBleed = false,
  children,
}: CinematicDecorProps) {
  const bleed = viewportBleed
    ? "relative left-auto ml-[calc(50%-50vw)] w-screen max-w-none shrink-0"
    : "relative";

  return (
    <div
      className={`${bleed} overflow-hidden border-b border-border ${minHeightClass}`}
      role="img"
      aria-label={imageDescription}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />
      {showBrandGlow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_-20%,rgba(229,9,20,0.22),transparent_55%)]"
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: overlayVertical }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/10 md:from-black/80 md:via-black/35"
      />
      <div className="relative z-[1] flex min-h-[inherit] flex-col justify-end px-6 py-8 md:px-8 md:pb-10 md:pt-14">
        {children}
      </div>
    </div>
  );
}
