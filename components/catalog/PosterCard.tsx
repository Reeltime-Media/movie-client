import Image from "next/image";
import Link from "next/link";
import type { PosterCardProps } from "@/types/poster-card";

export type { PosterCardProps } from "@/types/poster-card";

export function PosterCard({
  imageSrc,
  imageAlt,
  imagePriority = false,
  posterTitle,
  titleBelow,
  posterGradient,
  badge = { kind: "none" },
  subtitle,
  entitlement,
  progressPct,
  watchHref = "#",
  year,
}: PosterCardProps) {
  const cardLabel = `${titleBelow}${year ? ` (${year})` : ""}`;

  return (
    <Link
      href={watchHref}
      aria-label={cardLabel}
      className="group block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {/* Poster image */}
      <div
        className="relative aspect-2/3 overflow-hidden transition-transform duration-200 ease-out group-hover:scale-[1.03]"
        style={{ background: posterGradient }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? titleBelow}
            fill
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 200px, 42vw"
            className="object-cover object-[center_20%]"
            priority={imagePriority}
            loading={imagePriority ? "eager" : "lazy"}
          />
        ) : null}

        {/* Badges — top row */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {badge.kind === "owned" ? (
            <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
              {badge.label}
            </span>
          ) : null}
          {subtitle ? (
            <span
              className="rounded-sm px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              {subtitle.text}
            </span>
          ) : null}
        </div>

        {/* HD badge — top right */}
        {badge.kind === "hd" ? (
          <div className="absolute right-2 top-2 rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
            {badge.label}
          </div>
        ) : null}

        {/* Entitlement pill — bottom left */}
        {entitlement?.kind === "price" ? (
          <div className="absolute bottom-2 left-2 rounded-sm bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {entitlement.value}
          </div>
        ) : null}

        {/* Watch progress bar */}
        {typeof progressPct === "number" ? (
          <div className="absolute inset-x-0 bottom-0 h-0.75 bg-white/15">
            <div
              className="absolute inset-y-0 left-0 bg-brand"
              style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
            />
          </div>
        ) : null}
      </div>

      {/* Title + year below poster */}
      <div className="mt-2 min-w-0">
        <p className="truncate text-[13px] font-semibold leading-snug text-text group-hover:text-text/90">
          {titleBelow}
        </p>
        {year ? (
          <p className="mt-0.5 text-[11px] font-medium text-text-muted">{year}</p>
        ) : entitlement?.kind === "subscribed" ? (
          <p className="mt-0.5 text-[11px] font-semibold text-success">{entitlement.value}</p>
        ) : null}
      </div>
    </Link>
  );
}
