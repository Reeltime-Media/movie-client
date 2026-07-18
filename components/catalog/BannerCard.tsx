import Link from "next/link";
import { CdnImage } from "@/components/ui/CdnImage";

export type BannerCardProps = {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  /** Khmer title shown above the English title when present. */
  titleKm?: string | null;
  year?: number | null;
  badgeLabel?: string;
  watchHref?: string;
  imagePriority?: boolean;
  /** Show the whole image (object-contain, may letterbox) instead of cropping. */
  imageContain?: boolean;
};

export function BannerCard({
  imageSrc,
  imageAlt,
  title,
  titleKm,
  year,
  badgeLabel,
  watchHref = "#",
  imagePriority = false,
  imageContain = false,
}: BannerCardProps) {
  const hasKm = Boolean(titleKm?.trim());
  const cardLabel = `${hasKm ? `${titleKm} · ` : ""}${title}${year ? ` (${year})` : ""}`;

  return (
    <Link
      href={watchHref}
      aria-label={cardLabel}
      className="group block cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="rt-card-hover relative overflow-hidden rounded-md border border-transparent group-hover:border-white/20 bg-surface-elevated">
        {imageSrc ? (
          <CdnImage
            src={imageSrc}
            alt={imageAlt ?? (hasKm ? `${titleKm} · ${title}` : title)}
            width={720}
            height={300}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 340px, 80vw"
            className={[
              // Match uploaded banners (~12:5 ultrawide), not 16:9 — avoids side crop.
              "w-full aspect-[12/5] block",
              imageContain ? "object-contain" : "object-cover object-center",
            ].join(" ")}
            priority={imagePriority}
            loading={imagePriority ? "eager" : "lazy"}
          />
        ) : (
          <div className="aspect-video w-full" />
        )}

        {/* Bottom gradient for text legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 45%, transparent 75%)",
          }}
        />

        {/* Title + year bottom-left, badge bottom-right */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0">
            {hasKm ? (
              <>
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-white">
                  {titleKm}
                </p>
                <p className="mt-0.5 line-clamp-1 text-[13px] font-bold leading-snug text-white">
                  {title}
                </p>
              </>
            ) : (
              <p className="line-clamp-2 text-[13px] font-bold leading-snug text-white">
                {title}
              </p>
            )}
            {year ? (
              <p className="mt-0.5 text-[11px] font-medium text-white/65">{year}</p>
            ) : null}
          </div>
          {badgeLabel ? (
            <span className="shrink-0 rounded-sm bg-brand px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
