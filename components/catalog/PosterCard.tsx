import { CheckCircle2, Play } from "lucide-react";
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
  accentColor,
  badge = { kind: "none" },
  subtitle,
  entitlement = { kind: "none" },
  progressPct,
  watchHref = "#",
  watchLabel,
}: PosterCardProps) {
  const computedWatchLabel =
    watchLabel ??
    (entitlement.kind === "price"
      ? `Buy · ${entitlement.value}`
      : entitlement.kind === "continue"
        ? "Continue"
        : entitlement.kind === "subscribed"
          ? "Watch"
          : "Watch now");

  const buttonStyle =
    entitlement.kind === "continue"
      ? "bg-surface-elevated border border-border hover:border-border-hover text-text"
      : "bg-brand hover:bg-brand-hover text-white";

  return (
    <div className="group">
      {/* Poster image area */}
      <div
        className={[
          "relative aspect-2/3 overflow-hidden rounded-sm border border-transparent transition-all duration-200 ease-out",
          "group-hover:scale-[1.03] group-hover:border-white/20",
        ].join(" ")}
        style={{ background: posterGradient }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? titleBelow}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={imagePriority}
            loading={imagePriority ? "eager" : "lazy"}
          />
        ) : null}

        {/* Badge */}
        {badge.kind !== "none" ? (
          <div
            className={[
              "absolute right-2 top-2 rounded-sm px-1.5 py-0.75 text-[9px] font-bold tracking-[0.08em] text-white",
              badge.kind === "hd" ? "bg-black/60" : "bg-brand",
            ].join(" ")}
          >
            {badge.label}
          </div>
        ) : null}

        {/* Title + accent line */}
        <div className="absolute inset-x-0 bottom-0">
          {/* Progress bar — shown when in-progress */}
          {typeof progressPct === "number" && (
            <div className="relative h-0.75 w-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-brand"
                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
              />
            </div>
          )}

          <div className="h-px w-7" style={{ background: accentColor }} />
          <div className="px-4 pb-4 pt-3">
            <div
              className="text-[14px] font-extrabold leading-none text-white"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
            >
              {posterTitle}
            </div>
            {subtitle ? (
              <div
                className="mt-1 text-[9px] font-semibold tracking-widest"
                style={{ color: subtitle.color }}
              >
                {subtitle.text}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Below-poster info */}
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="truncate text-[12px] font-semibold text-text">{titleBelow}</div>

          {entitlement.kind === "subscribed" ? (
            <div className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-success">
              <CheckCircle2 size={13} />
              <span>{entitlement.value}</span>
            </div>
          ) : null}

          {entitlement.kind === "continue" ? (
            <div className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-text-muted">
              <Play size={12} />
              <span>{entitlement.value}</span>
            </div>
          ) : null}

          {entitlement.kind === "price" ? (
            <span className="shrink-0 text-[11px] font-medium text-text-muted">
              Own from {entitlement.value}
            </span>
          ) : null}
        </div>

        <Link
          href={watchHref}
          className={[
            "inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-[12px] font-bold transition-colors",
            buttonStyle,
          ].join(" ")}
        >
          {computedWatchLabel}
        </Link>
      </div>
    </div>
  );
}
