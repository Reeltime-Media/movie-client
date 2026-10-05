"use client";

import { CheckCircle2, Loader2, Lock, Play } from "lucide-react";
import { CdnImage } from "@/components/ui/CdnImage";
import { useI18n } from "@/components/providers/LocaleProvider";
import { posterUrl } from "@/lib/api/core";
import type { TvChannelRead } from "@/lib/api/types";

/** Deterministic fallback tile color when a channel has no logo yet. */
function hueFromId(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h + seed.charCodeAt(i) * 17) % 360;
  }
  return h;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export type TvChannelCardProps = {
  channel: TvChannelRead;
  /** True when this viewer can actually watch a paid channel (subscribed / admin). Ignored for free channels. */
  isEntitled: boolean;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (channel: TvChannelRead) => void;
};

export function TvChannelCard({
  channel,
  isEntitled,
  isSelected,
  isLoading,
  onSelect,
}: TvChannelCardProps) {
  const { t } = useI18n();
  const isLive = channel.status === "live";
  const logoSrc = posterUrl(channel.logo_key);
  const locked = !channel.is_free && !isEntitled;

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={!isLive}
        aria-pressed={isSelected}
        aria-label={channel.name}
        onClick={() => onSelect(channel)}
        className={[
          "rt-card-hover group relative block aspect-video w-full overflow-hidden rounded-md border bg-surface-elevated transition-colors",
          isSelected ? "border-brand ring-1 ring-brand/40" : "border-border hover:border-border-hover",
          isLive ? "cursor-pointer" : "cursor-not-allowed opacity-50",
        ].join(" ")}
      >
        {logoSrc ? (
          <CdnImage
            src={logoSrc}
            alt=""
            fill
            sizes="(min-width: 1024px) 220px, (min-width: 640px) 200px, 42vw"
            className="object-contain p-5 transition-transform duration-200 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-[20px] font-extrabold text-white"
            style={{ backgroundColor: `hsl(${hueFromId(channel.id)} 42% 22%)` }}
            aria-hidden
          >
            {initials(channel.name)}
          </div>
        )}

        {/* Bottom gradient for selected / hover affordance */}
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-200",
            isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          ].join(" ")}
        />

        {/* Live/offline — top left */}
        <div className="absolute left-2 top-2 z-10">
          {isLive ? (
            <span className="inline-flex items-center gap-1 rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
              {t("tvLive")}
            </span>
          ) : (
            <span className="rounded-sm bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white/70">
              {t("tvOffline")}
            </span>
          )}
        </div>

        {/* Entitlement — top right */}
        <div className="absolute right-2 top-2 z-10">
          {channel.is_free ? (
            <span className="rounded-sm bg-success px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
              {t("tvFree").toUpperCase()}
            </span>
          ) : locked ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-black/60 text-white/80">
              <Lock size={11} aria-hidden />
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-success/90 text-white">
              <CheckCircle2 size={12} aria-hidden />
            </span>
          )}
        </div>

        {/* Play / now-playing affordance */}
        {isLive && !isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {isSelected ? (
              <span className="rounded-sm bg-brand px-2 py-1 text-[10px] font-bold tracking-[0.06em] text-white uppercase">
                {t("tvNowPlaying")}
              </span>
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Play size={16} fill="currentColor" aria-hidden />
                <span className="sr-only">{t("tvPlayChannel")}</span>
              </span>
            )}
          </div>
        ) : null}

        {isLoading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <Loader2 size={22} className="animate-spin text-white" aria-hidden />
          </div>
        ) : null}
      </button>

      <p className="mt-2 truncate text-[13px] font-semibold text-text">{channel.name}</p>
      <p className="mt-0.5 text-[11px] font-medium text-text-muted">
        {isSelected
          ? t("tvNowPlaying")
          : channel.is_free
            ? t("tvFree")
            : locked
              ? t("tvSubscriptionRequired")
              : t("tvSubscribed")}
      </p>
    </div>
  );
}
