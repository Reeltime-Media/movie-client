"use client";
"use no memo";

import { Play, Star, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { BakongCheckoutModal } from "@/components/pay/BakongCheckoutModal";
import { CdnImage } from "@/components/ui/CdnImage";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { useI18n } from "@/components/providers/LocaleProvider";
import { isMoviePayHref, movieSlugFromPayHref } from "@/lib/movie-routes";
import { warmQrCodeModule } from "@/lib/pay/khqr-image";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { PosterCardProps } from "@/types/poster-card";

export type { PosterCardProps } from "@/types/poster-card";

/** Normalize Khmer title — treat whitespace/ZWSP-only as missing. */
function kmTitle(titleKm: string | null | undefined): string | null {
  if (typeof titleKm !== "string") return null;
  const trimmed = titleKm.replace(/\u200b/g, "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cardAriaLabel(
  titleKm: string | null | undefined,
  titleBelow: string,
  year?: number | null,
): string {
  const km = kmTitle(titleKm);
  return `${km ? `${km} · ` : ""}${titleBelow}${year ? ` (${year})` : ""}`;
}

/** Only one flip card open at a time across the whole page. */
let activeFlipId: string | null = null;
const flipListeners = new Set<() => void>();

function subscribeActiveFlip(listener: () => void): () => void {
  flipListeners.add(listener);
  return () => {
    flipListeners.delete(listener);
  };
}

function getActiveFlipId(): string | null {
  return activeFlipId;
}

function setActiveFlipId(id: string | null): void {
  if (activeFlipId === id) return;
  activeFlipId = id;
  for (const listener of flipListeners) listener();
}

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
  fill = false,
}: PosterCardProps & { fill?: boolean }) {
  return (
    <div
      className={[
        "rt-card-hover relative overflow-hidden",
        fill ? "h-full w-full" : "aspect-2/3",
      ].join(" ")}
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

      {/* Play overlay — skip for Coming Soon (no watch CTA). */}
      {badge.kind !== "soon" ? (
        <>
          <div
            className="absolute inset-0 z-[5] bg-black/50 opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-[6] flex items-center justify-center scale-[0.85] opacity-0 transition-[opacity,transform] duration-[180ms] ease-out group-hover:scale-100 group-hover:opacity-100"
            aria-hidden="true"
          >
            <Play size={40} className="fill-white text-white ml-2" />
          </div>
        </>
      ) : null}

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
        {badge.kind === "soon" ? (
          <span className="rounded-sm bg-black/70 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
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

function TitleBelow({ titleBelow, titleKm, year, entitlement, rating }: PosterCardProps) {
  const km = kmTitle(titleKm);
  const titleClass =
    "truncate text-[15px] font-semibold leading-snug text-text group-hover:text-text/90";
  return (
    <div className="mt-2 flex min-w-0 items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        {km ? (
          <>
            <p className={titleClass} suppressHydrationWarning>
              {km}
            </p>
            <p className={`mt-0.5 ${titleClass}`} suppressHydrationWarning>
              {titleBelow}
            </p>
          </>
        ) : (
          <p className={titleClass} suppressHydrationWarning>
            {titleBelow}
          </p>
        )}
        {year ? (
          <p className="mt-0.5 text-[11px] font-medium text-text-muted">{year}</p>
        ) : entitlement?.kind === "subscribed" ? (
          <p className="mt-0.5 text-[11px] font-semibold text-success">{entitlement.value}</p>
        ) : null}
      </div>
      {rating ? (
        <p className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-warning">
          <Star size={13} className="fill-warning text-warning" aria-hidden />
          {rating}
        </p>
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
  const { titleBelow, titleKm, watchHref = "#", year } = props;
  const label = cardAriaLabel(titleKm, titleBelow, year);

  return (
    <Link
      href={watchHref}
      aria-label={label}
      suppressHydrationWarning
      className="group block cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <PosterFace {...props} />
      <TitleBelow {...props} />
    </Link>
  );
}

/** Movie card — click flips to a back face with Buy / View-trailer actions. */
function FlipPosterCard(props: PosterCardProps) {
  const {
    contentId,
    titleBelow,
    titleKm,
    watchHref = "#",
    year,
    entitlement,
    trailerUrl,
    badge = { kind: "none" },
  } = props;
  const { t } = useI18n();
  const flipId = contentId ?? watchHref ?? titleBelow;
  const activeId = useSyncExternalStore(
    subscribeActiveFlip,
    getActiveFlipId,
    () => null,
  );
  const flipped = activeId === flipId;
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const isComingSoon = badge.kind === "soon";

  const km = kmTitle(titleKm);
  const cardLabel = cardAriaLabel(titleKm, titleBelow, year);
  const embedUrl = youtubeEmbedUrl(trailerUrl, { autoplay: true });
  const buyLabel =
    entitlement?.kind === "price"
      ? `${t("cardBuy")} · ${entitlement.value}`
      : t("heroWatchNow");
  const trailerTitle = km ? `${km} · ${titleBelow}` : titleBelow;
  const paySlug = isMoviePayHref(watchHref) ? movieSlugFromPayHref(watchHref) : null;
  const needsCheckout = Boolean(contentId && paySlug);
  const priceLabel = entitlement?.kind === "price" ? entitlement.value : undefined;

  useEffect(() => {
    if (flipped && needsCheckout) void warmQrCodeModule();
  }, [flipped, needsCheckout]);

  return (
    <div className={["group", flipped ? "relative z-30" : ""].join(" ")}>
      <div className="rt-flip-scene">
        <div className={["rt-flip-card", flipped ? "is-flipped" : ""].join(" ")}>
          {/* Front — poster; click flips (closes any other open card) */}
          <div
            role="button"
            tabIndex={0}
            aria-label={cardLabel}
            suppressHydrationWarning
            onClick={() => setActiveFlipId(flipId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveFlipId(flipped ? null : flipId);
              }
            }}
            aria-hidden={flipped}
            className={[
              "rt-flip-face rt-flip-face-front cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              flipped ? "pointer-events-none" : "",
            ].join(" ")}
          >
            <PosterFace {...props} fill />
          </div>

          {/* Back — actions; click background flips back */}
          <div
            onClick={() => setActiveFlipId(null)}
            aria-hidden={!flipped}
            className={[
              "rt-flip-face rt-flip-face-back flex cursor-pointer flex-col justify-between gap-2 overflow-hidden border border-border bg-surface p-2.5 sm:p-3",
              flipped ? "" : "pointer-events-none",
            ].join(" ")}
          >
            <div className="min-w-0 shrink">
              {km ? (
                <>
                  <p
                    className="line-clamp-2 text-[12px] font-bold leading-snug text-text sm:text-[13px]"
                    suppressHydrationWarning
                  >
                    {km}
                  </p>
                  <p
                    className="mt-0.5 line-clamp-2 text-[12px] font-bold leading-snug text-text sm:text-[13px]"
                    suppressHydrationWarning
                  >
                    {titleBelow}
                  </p>
                </>
              ) : (
                <p
                  className="line-clamp-3 text-[12px] font-bold leading-snug text-text sm:text-[13px]"
                  suppressHydrationWarning
                >
                  {titleBelow}
                </p>
              )}
              {year ? (
                <p className="mt-0.5 text-[11px] font-medium text-text-muted">{year}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col gap-1.5 sm:gap-2">
              {isComingSoon ? (
                embedUrl ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrailerOpen(true);
                    }}
                    className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-hover sm:px-3 sm:py-2 sm:text-[12px]"
                  >
                    {t("cardViewTrailer")}
                  </button>
                ) : (
                  <span className="inline-flex min-h-9 items-center justify-center rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] font-bold text-text-muted sm:px-3 sm:py-2 sm:text-[12px]">
                    {t("cardComingSoon")}
                  </span>
                )
              ) : needsCheckout && contentId && paySlug ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFlipId(null);
                    setCheckoutOpen(true);
                  }}
                  className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-brand px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-hover sm:px-3 sm:py-2 sm:text-[12px]"
                >
                  <Play size={13} className="fill-white" aria-hidden />
                  {buyLabel}
                </button>
              ) : (
                <Link
                  href={watchHref}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-success px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#16a34a] sm:px-3 sm:py-2 sm:text-[12px]"
                >
                  <Play size={13} className="fill-white" aria-hidden />
                  {buyLabel}
                </Link>
              )}
              {!isComingSoon && embedUrl ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrailerOpen(true);
                  }}
                  className="inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2.5 py-1.5 text-[11px] font-bold text-text transition-colors hover:border-border-hover hover:bg-border sm:px-3 sm:py-2 sm:text-[12px]"
                >
                  {t("cardViewTrailer")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className={flipped ? "invisible" : undefined} aria-hidden={flipped}>
        <TitleBelow {...props} />
      </div>

      {trailerOpen && embedUrl ? (
        <TrailerModal
          embedUrl={embedUrl}
          title={trailerTitle}
          onClose={() => setTrailerOpen(false)}
        />
      ) : null}

      {checkoutOpen && contentId && paySlug ? (
        <BakongCheckoutModal
          contentId={contentId}
          title={trailerTitle}
          priceLabel={priceLabel}
          watchSlug={paySlug}
          onClose={() => setCheckoutOpen(false)}
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
