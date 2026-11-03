"use client";

import { AlertCircle, Headphones, Loader2, Lock, LogIn, Mic, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { CdnImage } from "@/components/ui/CdnImage";
import { posterThumbUrl, posterUrl } from "@/lib/api/core";
import type { ContentListItemRead } from "@/lib/api/types";
import { loginPathWithNext } from "@/lib/auth-redirect";
import { formatPodcastClock, podcastHeadline } from "@/lib/podcast-access";

export type PodcastSelection =
  | { status: "idle" }
  | { status: "authorizing"; podcast: ContentListItemRead }
  | { status: "playing"; podcast: ContentListItemRead; url: string }
  | { status: "locked"; podcast: ContentListItemRead; reason: "signin" | "subscribe" }
  | { status: "not-ready"; podcast: ContentListItemRead }
  | { status: "error"; podcast: ContentListItemRead; message: string };

const SKIP_SECONDS = 10;
const SPEEDS = [1, 1.25, 1.5, 2] as const;

function Notice({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md bg-surface-elevated px-4 py-5 text-center">
      <div className="text-text-muted">{icon}</div>
      <p className="text-[14px] font-bold text-text">{title}</p>
      {desc ? <p className="max-w-xs text-[12px] leading-relaxed text-text-muted">{desc}</p> : null}
      {action}
    </div>
  );
}

const primaryButtonClass =
  "mt-1 inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover";

function SkipButton({
  direction,
  onClick,
}: {
  direction: "back" | "forward";
  onClick: () => void;
}) {
  const Icon = direction === "back" ? RotateCcw : RotateCw;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${direction === "back" ? "Back" : "Forward"} ${SKIP_SECONDS} seconds`}
      className="relative grid h-11 w-11 place-items-center rounded-full text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-brand"
    >
      <Icon size={30} strokeWidth={1.6} aria-hidden />
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center pt-0.5 text-[9px] font-extrabold tabular-nums"
      >
        {SKIP_SECONDS}
      </span>
    </button>
  );
}

/** The listening controls. Remounted per episode (keyed by URL) so state resets. */
function AudioControls({
  url,
  headline,
  artwork,
  onError,
}: {
  url: string;
  headline: { eyebrow: string | null; title: string };
  artwork: string | null;
  onError: () => void;
}) {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const max = Number.isFinite(audio.duration) ? audio.duration : seconds;
    audio.currentTime = Math.min(Math.max(seconds, 0), max);
    setTime(audio.currentTime);
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (audio) seekTo(audio.currentTime + delta);
    },
    [seekTo],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => undefined);
    else audio.pause();
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIndex((i) => {
      const next = (i + 1) % SPEEDS.length;
      if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
      return next;
    });
  }, []);

  // Lock-screen / headset controls: episode name, cover, and transport keys.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: headline.title,
      artist: headline.eyebrow ?? "Reeltime",
      artwork: artwork ? [{ src: artwork, sizes: "800x1200" }] : [],
    });
    session.setActionHandler("play", () => audioRef.current?.play().catch(() => undefined));
    session.setActionHandler("pause", () => audioRef.current?.pause());
    session.setActionHandler("seekbackward", () => skip(-SKIP_SECONDS));
    session.setActionHandler("seekforward", () => skip(SKIP_SECONDS));
    session.setActionHandler("seekto", (d) => {
      if (typeof d.seekTime === "number") seekTo(d.seekTime);
    });
    return () => {
      session.metadata = null;
      for (const action of ["play", "pause", "seekbackward", "seekforward", "seekto"] as const) {
        session.setActionHandler(action, null);
      }
    };
  }, [headline.title, headline.eyebrow, artwork, skip, seekTo]);

  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <audio
        ref={audioRef}
        src={url}
        autoPlay
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onCanPlay={() => setBuffering(false)}
        onPlaying={() => setBuffering(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={onError}
      />

      <div>
        <div className="group relative h-6">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" aria-hidden />
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-text transition-transform group-hover:scale-110 group-focus-within:ring-2 group-focus-within:ring-brand"
            style={{ left: `${progress}%` }}
            aria-hidden
          />
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 0}
            step={1}
            value={Math.min(time, duration > 0 ? duration : 0)}
            disabled={duration <= 0}
            onChange={(e) => seekTo(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatPodcastClock(time)} of ${formatPodcastClock(duration)}`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
          />
        </div>
        <div className="mt-0.5 flex justify-between text-[11px] font-medium tabular-nums text-text-muted">
          <span>{formatPodcastClock(time)}</span>
          <span>{formatPodcastClock(duration)}</span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${SPEEDS[speedIndex]}x`}
          className="w-14 justify-self-start rounded-md border border-border px-2 py-1 text-[12px] font-bold tabular-nums text-text-muted transition-colors hover:border-border-hover hover:text-text"
        >
          {SPEEDS[speedIndex]}×
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <SkipButton direction="back" onClick={() => skip(-SKIP_SECONDS)} />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? t("podcastPause") : t("podcastPlay")}
            className="grid h-14 w-14 place-items-center rounded-full bg-text text-bg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {buffering && !playing ? (
              <Loader2 size={22} className="animate-spin" aria-hidden />
            ) : playing ? (
              <Pause size={22} fill="currentColor" aria-hidden />
            ) : (
              <Play size={22} fill="currentColor" className="translate-x-px" aria-hidden />
            )}
          </button>
          <SkipButton direction="forward" onClick={() => skip(SKIP_SECONDS)} />
        </div>
        <span aria-hidden />
      </div>
    </div>
  );
}

/**
 * The player card. Below `lg` it sits above the list while an episode is
 * selected; from `lg` up it is the sticky column beside the list and shows a
 * prompt while idle.
 */
export function PodcastPlayerPanel({
  selection,
  onClose,
  onRetry,
  onAudioError,
}: {
  selection: PodcastSelection;
  onClose: () => void;
  onRetry: (podcast: ContentListItemRead) => void;
  onAudioError: (podcast: ContentListItemRead) => void;
}) {
  const { t } = useI18n();

  if (selection.status === "idle") {
    return (
      <div className="hidden flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-14 text-center lg:flex">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-surface-elevated text-text-muted">
          <Headphones size={24} aria-hidden />
        </div>
        <p className="text-[15px] font-bold text-text">{t("podcastIdleTitle")}</p>
        <p className="max-w-[16rem] text-[13px] leading-relaxed text-text-muted">{t("podcastIdleDesc")}</p>
      </div>
    );
  }

  const { podcast } = selection;
  const headline = podcastHeadline(podcast);
  const cover = posterThumbUrl(podcast.poster_key, 400, podcast.updated_at);
  const artwork = posterUrl(podcast.poster_key, podcast.updated_at) ?? null;

  let body: ReactNode;
  if (selection.status === "authorizing") {
    body = (
      <div className="flex items-center justify-center gap-2 py-6 text-[13px] font-medium text-text-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden />
        {t("podcastConnecting")}
      </div>
    );
  } else if (selection.status === "playing") {
    body = (
      <AudioControls
        key={selection.url}
        url={selection.url}
        headline={headline}
        artwork={artwork}
        onError={() => onAudioError(podcast)}
      />
    );
  } else if (selection.status === "locked") {
    const signin = selection.reason === "signin";
    body = (
      <Notice
        icon={signin ? <LogIn size={22} aria-hidden /> : <Lock size={22} aria-hidden />}
        title={signin ? t("podcastSignInTitle") : t("podcastSubscribeTitle")}
        desc={signin ? t("podcastSignInDesc") : t("podcastSubscribeDesc")}
        action={
          <Link href={signin ? loginPathWithNext("/podcasts") : "/pricing"} className={primaryButtonClass}>
            {signin ? t("podcastSignInCta") : t("podcastSubscribeCta")}
          </Link>
        }
      />
    );
  } else if (selection.status === "not-ready") {
    body = (
      <Notice
        icon={<Mic size={22} aria-hidden />}
        title={t("podcastNotReadyTitle")}
        desc={t("podcastNotReadyDesc")}
      />
    );
  } else {
    body = (
      <Notice
        icon={<AlertCircle size={22} className="text-danger" aria-hidden />}
        title={t("podcastErrorTitle")}
        desc={selection.message}
        action={
          <button
            type="button"
            onClick={() => onRetry(podcast)}
            className="mt-1 rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-bold text-text transition-colors hover:border-border-hover"
          >
            {t("podcastRetry")}
          </button>
        }
      />
    );
  }

  return (
    <section
      id="podcast-player"
      aria-label={t("podcastNowPlaying")}
      className="rt-page-fade-up relative scroll-mt-24 rounded-md border border-border bg-surface p-4 sm:p-5"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
      >
        <X size={16} aria-hidden />
      </button>

      <div className="flex items-start gap-4 pr-7 lg:flex-col lg:items-center lg:pr-0 lg:text-center">
        <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-[4px] bg-surface-elevated sm:w-24 lg:w-36">
          {cover ? (
            <CdnImage src={cover} alt="" fill sizes="(min-width: 1024px) 144px, 96px" className="object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-text-muted" aria-hidden>
              <Mic size={28} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 lg:w-full lg:flex-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand">{t("podcastNowPlaying")}</p>
          <h2 className="mt-1 text-balance text-[17px] font-bold leading-snug text-text">{headline.title}</h2>
          {headline.eyebrow ? (
            <p className="mt-0.5 text-[12px] font-medium text-text-muted">{headline.eyebrow}</p>
          ) : null}
          {podcast.runtime ? <p className="mt-1 text-[12px] text-text-disabled">{podcast.runtime}</p> : null}
        </div>
      </div>

      <div className="mt-4">{body}</div>
    </section>
  );
}
