"use client";

import { Play, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CdnImage } from "@/components/ui/CdnImage";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { useI18n } from "@/components/providers/LocaleProvider";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { PosterCardProps } from "@/types/poster-card";

export type { PosterCardProps } from "@/types/poster-card";

/** Poster artwork + badges — shared by the flat card and the flip card front. */
function PosterFace({
  contentId,
  imageSrc,
  imageAlt,
  imagePriority = false,
  titleBelow,
  posterGradient,
  badge = { kind: "none" },
  subtitle,
  entitlement,
  progressPct,
}: PosterCardProps) {
  return (
    <div
      className="rt-card-hover relative aspect-2/3 overflow-hidden"
      style={{ background: posterGradient, viewTransitionName: contentId ? `poster-${contentId}` : undefined }}
    >
      {imageSrc ? (
        <CdnImage
          src={imageSrc}
          alt={imageAlt ?? titleBelow}
          fill
          sizes="(min-width: 1024px) 220px, (min-width: 640px) 200px, 42vw"
          className="object-cover object-[center_20%]"
          priority={imagePriority}
          loading={imagePriority ? "eager" : "lazy"}
        />
      ) : null}

      {/* Play overlay — scrim */}
      <div
        className="absolute inset-0 z-[5] bg-black/50 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100"
        aria-hidden="true"
      />
      {/* Play overlay — icon */}
      <div
        className="absolute inset-0 z-[6] flex items-center justify-center scale-[0.85] opacity-0 transition-[opacity,transform] duration-[180ms] ease-out group-hover:scale-100 group-hover:opacity-100"
        aria-hidden="true"
      >
        <Play size={40} className="fill-white text-white ml-2" />
      </div>

      {/* Badges — top row */}
      <div className="absolute left-2 top-2 z-[10] flex flex-col gap-1">
        {badge.kind === "owned" ? (
          <span className="rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
            {badge.label}
          </span>
        ) : null}
        {badge.kind === "free" ? (
          <span className="rounded-sm bg-success px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
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
        <div className="absolute right-2 top-2 z-[10] rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
          {badge.label}
        </div>
      ) : null}

      {/* Entitlement pill — bottom left */}
      {entitlement?.kind === "price" ? (
        <div className="absolute bottom-2 left-2 z-[10] rounded-sm bg-white px-2 py-0.5 text-[13px] font-bold text-brand">
          {entitlement.value}
        </div>
      ) : null}

      {/* Watch progress bar */}
      {typeof progressPct === "number" ? (
        <div className="absolute inset-x-0 bottom-0 z-[10] h-0.75 bg-white/15">
          <div
            className="absolute inset-y-0 left-0 bg-brand"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function TitleBelow({ titleBelow, year, entitlement }: PosterCardProps) {
  return (
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
  );
}

function TrailerModal({
  embedUrl,
  title,
  onClose,
}: {
  embedUrl: string;
  title: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
    >
      <div
        className="w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="truncate pr-3 text-[14px] font-semibold text-white">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trailer"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/20 bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X size={16} />
          </button>
        </div>
        <TrailerEmbed embedUrl={embedUrl} title={title} variant="frame-only" />
      </div>
    </div>,
    document.body,
  );
}

/** Classic card — whole poster is a link (series and other non-flip uses). */
function FlatPosterCard(props: PosterCardProps) {
  const { titleBelow, watchHref = "#", year } = props;
  const cardLabel = `${titleBelow}${year ? ` (${year})` : ""}`;

  return (
    <Link
      href={watchHref}
      aria-label={cardLabel}
      className="group block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <PosterFace {...props} />
      <TitleBelow {...props} />
    </Link>
  );
}

/** Movie card — click flips to a back face with Buy / View-trailer actions. */
function FlipPosterCard(props: PosterCardProps) {
  const { titleBelow, watchHref = "#", year, entitlement, trailerUrl } = props;
  const { t } = useI18n();
  const [flipped, setFlipped] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const cardLabel = `${titleBelow}${year ? ` (${year})` : ""}`;
  const embedUrl = youtubeEmbedUrl(trailerUrl, { autoplay: true });
  const buyLabel =
    entitlement?.kind === "price"
      ? `${t("cardBuy")} · ${entitlement.value}`
      : t("heroWatchNow");

  return (
    <div className="group">
      <div className="perspective-[1000px]">
        <div
          className={[
            "relative transition-transform duration-500 transform-3d",
            flipped ? "transform-[rotateY(180deg)]" : "",
          ].join(" ")}
        >
          {/* Front — poster; click flips */}
          <div
            role="button"
            tabIndex={0}
            aria-label={cardLabel}
            onClick={() => setFlipped(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFlipped((f) => !f);
              }
            }}
            aria-hidden={flipped}
            className={[
              "cursor-pointer backface-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              flipped ? "pointer-events-none" : "",
            ].join(" ")}
          >
            <PosterFace {...props} />
          </div>

          {/* Back — actions; click background flips back */}
          <div
            onClick={() => setFlipped(false)}
            aria-hidden={!flipped}
            className={[
              "absolute inset-0 flex cursor-pointer flex-col justify-between border border-border bg-surface p-3 backface-hidden transform-[rotateY(180deg)]",
              flipped ? "" : "pointer-events-none",
            ].join(" ")}
          >
            <div className="min-w-0">
              <p className="line-clamp-3 text-[13px] font-bold leading-snug text-text">
                {titleBelow}
              </p>
              {year ? (
                <p className="mt-0.5 text-[11px] font-medium text-text-muted">{year}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href={watchHref}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                <Play size={13} className="fill-white" aria-hidden />
                {buyLabel}
              </Link>
              {embedUrl ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrailerOpen(true);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-surface-elevated px-3 py-2 text-[12px] font-bold text-text transition-colors hover:border-border-hover hover:bg-border"
                >
                  {t("cardViewTrailer")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <TitleBelow {...props} />

      {trailerOpen && embedUrl ? (
        <TrailerModal
          embedUrl={embedUrl}
          title={titleBelow}
          onClose={() => setTrailerOpen(false)}
        />
      ) : null}
    </div>
  );
}

export function PosterCard(props: PosterCardProps) {
  if (props.flipActions) {
    return <FlipPosterCard {...props} />;
  }
  return <FlatPosterCard {...props} />;
}
