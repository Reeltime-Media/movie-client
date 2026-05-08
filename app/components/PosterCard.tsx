import { CheckCircle2, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Badge =
  | { kind: "hd"; label: "HD" }
  | { kind: "owned"; label: "OWNED" }
  | { kind: "none" };

type Entitlement =
  | { kind: "price"; value: string }
  | { kind: "subscribed"; value: string }
  | { kind: "continue"; value: string }
  | { kind: "none" };

export type PosterCardProps = {
  imageSrc?: string;
  imageAlt?: string;
  imagePriority?: boolean;
  posterTitle: string;
  titleBelow: string;
  posterGradient: string;
  accentColor: string;
  badge?: Badge;
  subtitle?: { text: string; color: string };
  entitlement?: Entitlement;
  watchHref?: string;
  watchLabel?: string;
};

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
  watchHref = "#",
  watchLabel,
}: PosterCardProps) {
  const computedWatchLabel =
    watchLabel ?? (entitlement.kind === "price" ? entitlement.value : "Watch now");

  return (
    <div className="group">
      <div
        className={[
          "relative aspect-2/3 overflow-hidden rounded-[4px] border border-transparent transition-all duration-200 ease-out",
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

        {badge.kind !== "none" ? (
          <div
            className={[
              "absolute right-2 top-2 rounded-[3px] px-[6px] py-[3px] text-[9px] font-bold tracking-[0.08em] text-white",
              badge.kind === "hd" ? "bg-black/60" : "bg-brand",
            ].join(" ")}
          >
            {badge.label}
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0">
          <div className="h-px w-7" style={{ background: accentColor }} />
          <div className="px-4 pb-4 pt-3">
            <div
              className="text-[14px] font-extrabold leading-none text-white"
              style={{
                textShadow: "0 2px 4px rgba(0,0,0,0.8)",
              }}
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

      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-text">{titleBelow}</div>

          {entitlement.kind === "subscribed" ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <CheckCircle2 size={14} />
              <span>{entitlement.value}</span>
            </div>
          ) : null}

          {entitlement.kind === "continue" ? (
            <div className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted">
              <Play size={14} />
              <span>{entitlement.value}</span>
            </div>
          ) : null}
        </div>

        <Link
          href={watchHref}
          className="inline-flex w-full items-center justify-center rounded-[6px] bg-brand px-3 py-[9px] text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
        >
          {computedWatchLabel}
        </Link>
      </div>
    </div>
  );
}

