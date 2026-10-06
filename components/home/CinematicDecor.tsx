import type { ReactNode } from "react";

const overlayVertical =
  "linear-gradient(to bottom, rgba(10,10,10,0.48) 0%, rgba(10,10,10,0.72) 45%, rgba(10,10,10,0.92) 100%)";

/** Lighter stack for centered heroes so the photo still reads through. */
const overlayVerticalCentered =
  "linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.45) 50%, rgba(10,10,10,0.72) 100%)";

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
  /** Horizontal alignment of hero copy. Default keeps left-aligned catalog heroes. */
  contentAlign?: "start" | "center";
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
  contentAlign = "start",
  children,
}: CinematicDecorProps) {
  const bleed = viewportBleed
    ? "relative left-auto rt-full-bleed shrink-0"
    : "relative";
  const centered = contentAlign === "center";

  return (
    <div
      className={`${bleed} overflow-hidden border-b border-border ${minHeightClass}`}
      role="img"
      aria-label={imageDescription}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 scale-105 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageSrc}')` }}
      />
      {showBrandGlow ? (
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0",
            centered
              ? "bg-[radial-gradient(ellipse_80%_70%_at_50%_-10%,rgba(229,9,20,0.22),transparent_55%)]"
              : "bg-[radial-gradient(ellipse_100%_70%_at_0%_-20%,rgba(229,9,20,0.22),transparent_55%)]",
          ].join(" ")}
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: centered ? overlayVerticalCentered : overlayVertical }}
      />
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0",
          centered
            ? "bg-gradient-to-b from-black/35 via-black/25 to-black/65"
            : "bg-gradient-to-r from-black/85 via-black/40 to-black/10 md:from-black/80 md:via-black/35",
        ].join(" ")}
      />
      <div
        className={[
          "relative z-1 flex min-h-[inherit] flex-col px-6 py-8 md:px-8 md:pb-10 md:pt-14",
          centered
            ? "items-center justify-center text-center"
            : "justify-end",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
