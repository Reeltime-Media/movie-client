"use client";

import {
  AlertCircle,
  Loader2,
  LogIn,
  Lock,
  PlayCircle,
  Tv as TvIcon,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { WatchPlayerBand } from "@/components/watch/WatchPageSection";
import { TvChannelCard } from "@/components/tv/TvChannelCard";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { authorizeTvChannel, prefetchTvChannels } from "@/lib/api/tv";
import { listMySubscriptions, hasActiveSubscription } from "@/lib/api/subscriptions";
import type { TvChannelRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { loginPathWithNext } from "@/lib/auth-redirect";
import { marketingImages } from "@/lib/marketing-images";
import { swallow } from "@/lib/log";
import { kickerBadgeClassName } from "@/lib/ui/surfaces";

const importWatchPlayer = () => import("@/components/watch/WatchPlayer");

const WatchPlayerSkeleton = dynamic(
  () => importWatchPlayer().then((m) => m.WatchPlayerSkeleton),
  { ssr: false },
);

const WatchPlayer = dynamic(() => importWatchPlayer().then((m) => m.WatchPlayer), {
  ssr: false,
  loading: () => <WatchPlayerSkeleton fill />,
});

type Selection =
  | { status: "idle" }
  | { status: "authorizing"; channel: TvChannelRead }
  | { status: "playing"; channel: TvChannelRead; url: string }
  | { status: "locked"; channel: TvChannelRead; reason: "signin" | "subscribe" }
  | { status: "offline"; channel: TvChannelRead }
  | { status: "error"; channel: TvChannelRead; message: string };

type ChannelFilter = "all" | "live" | "free";

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
      {label}
    </span>
  );
}

function StatusPanel({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/5 text-white/80">
        {icon}
      </div>
      <p className="text-[15px] font-bold text-white">{title}</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-white/60">{desc}</p>
      {action}
    </div>
  );
}

function StatusBand({
  selection,
  onClose,
  onRetry,
}: {
  selection: Exclude<Selection, { status: "idle" }>;
  onClose: () => void;
  onRetry: (channel: TvChannelRead) => void;
}) {
  const { t } = useI18n();
  const { channel } = selection;

  return (
    <section
      id="tv-player"
      className="rt-page-fade-up scroll-mt-16 border-b border-border"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[14px] font-bold text-text">{channel.name}</span>
          {channel.status === "live" ? <LiveBadge label={t("tvLive")} /> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <WatchPlayerBand>
        {selection.status === "authorizing" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/70">
            <Loader2 size={32} className="animate-spin" aria-hidden />
            <p className="text-[13px] font-medium">{t("tvConnecting")}</p>
          </div>
        ) : selection.status === "playing" ? (
          <WatchPlayer key={selection.url} hlsSrc={selection.url} title={channel.name} fill live />
        ) : selection.status === "locked" ? (
          <StatusPanel
            icon={
              selection.reason === "signin" ? (
                <LogIn size={20} aria-hidden />
              ) : (
                <Lock size={20} aria-hidden />
              )
            }
            title={selection.reason === "signin" ? t("tvSignInTitle") : t("tvSubscribeTitle")}
            desc={selection.reason === "signin" ? t("tvSignInDesc") : t("tvSubscribeDesc")}
            action={
              <Link
                href={selection.reason === "signin" ? loginPathWithNext("/tv") : "/pricing"}
                className="mt-1 inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                {selection.reason === "signin" ? t("tvSignInCta") : t("tvSubscribeCta")}
              </Link>
            }
          />
        ) : selection.status === "offline" ? (
          <StatusPanel
            icon={<TvIcon size={20} aria-hidden />}
            title={t("tvChannelOfflineTitle")}
            desc={t("tvChannelOfflineDesc")}
          />
        ) : (
          <StatusPanel
            icon={<AlertCircle size={20} className="text-danger" aria-hidden />}
            title={t("tvErrorTitle")}
            desc={selection.message}
            action={
              <button
                type="button"
                onClick={() => onRetry(channel)}
                className="mt-1 rounded-md border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-white/20"
              >
                {t("tvRetry")}
              </button>
            }
          />
        )}
      </WatchPlayerBand>
    </section>
  );
}

export function TvView({ channels }: { channels: TvChannelRead[] }) {
  const { t } = useI18n();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const searchParams = useSearchParams();
  const channelParam = searchParams.get("channel");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selection, setSelection] = useState<Selection>({ status: "idle" });
  const [filter, setFilter] = useState<ChannelFilter>("all");
  const selectionGenRef = useRef(0);
  const deepLinkedParamRef = useRef<string | null>(null);
  const channelGridRef = useRef<HTMLElement | null>(null);

  const liveCount = useMemo(
    () => channels.filter((c) => c.status === "live").length,
    [channels],
  );
  const freeCount = useMemo(
    () => channels.filter((c) => c.is_free).length,
    [channels],
  );
  const firstFreeLive = useMemo(
    () => channels.find((c) => c.is_free && c.status === "live") ?? null,
    [channels],
  );

  const filteredChannels = useMemo(() => {
    if (filter === "live") return channels.filter((c) => c.status === "live");
    if (filter === "free") return channels.filter((c) => c.is_free);
    return channels;
  }, [channels, filter]);

  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    listMySubscriptions()
      .catch(swallow("tv: load subscriptions", []))
      .then((subs) => {
        if (!cancelled) setHasSubscription(hasActiveSubscription(subs));
      });
    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  // Warm the player chunk (hls.js, ~200KB) so the first channel click doesn't
  // wait on it — this page's whole purpose is clicking a channel to watch.
  useEffect(() => {
    void importWatchPlayer();
  }, []);

  const isEntitled = useCallback(
    (channel: TvChannelRead) => channel.is_free || (loggedIn && hasSubscription) || isAdmin,
    [loggedIn, hasSubscription, isAdmin],
  );

  useEffect(() => {
    prefetchTvChannels(channels, isEntitled);
  }, [channels, isEntitled]);

  const selectChannel = useCallback(
    (channel: TvChannelRead) => {
      const gen = ++selectionGenRef.current;

      if (channel.status !== "live") {
        setSelection({ status: "offline", channel });
        return;
      }

      setSelection({ status: "authorizing", channel });
      authorizeTvChannel(channel.id)
        .then((url) => {
          if (gen !== selectionGenRef.current) return;
          setSelection({ status: "playing", channel, url });
        })
        .catch((err: unknown) => {
          if (gen !== selectionGenRef.current) return;
          const statusCode =
            err && typeof err === "object" && "status" in err
              ? Number((err as { status: unknown }).status)
              : 0;
          if (statusCode === 403) {
            setSelection({ status: "locked", channel, reason: loggedIn ? "subscribe" : "signin" });
          } else if (statusCode === 409) {
            setSelection({ status: "offline", channel });
          } else {
            setSelection({
              status: "error",
              channel,
              message: err instanceof Error ? err.message : t("tvErrorDesc"),
            });
          }
        });
    },
    [loggedIn, t],
  );

  // Home rail deep-links with `/tv?channel={slug}` — auto-select once per param.
  useEffect(() => {
    if (!channelParam || channels.length === 0) return;
    if (deepLinkedParamRef.current === channelParam) return;
    const match = channels.find(
      (channel) => channel.slug === channelParam || channel.id === channelParam,
    );
    if (!match) return;
    deepLinkedParamRef.current = channelParam;
    // Defer so the effect doesn't synchronously cascade setState (React Compiler).
    const timer = window.setTimeout(() => selectChannel(match), 0);
    return () => window.clearTimeout(timer);
  }, [channelParam, channels, selectChannel]);

  const selectedChannelId = selection.status === "idle" ? null : selection.channel.id;

  // Bring the player into view when a channel is selected.
  useEffect(() => {
    if (!selectedChannelId) return;
    document.getElementById("tv-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedChannelId]);

  const closeBand = useCallback(() => {
    selectionGenRef.current += 1;
    setSelection({ status: "idle" });
  }, []);

  const browseChannels = useCallback(() => {
    channelGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filters: { id: ChannelFilter; label: string; count: number }[] = [
    { id: "all", label: t("tvFilterAll"), count: channels.length },
    { id: "live", label: t("tvFilterLive"), count: liveCount },
    { id: "free", label: t("tvFilterFree"), count: freeCount },
  ];

  return (
    <PageShell fullWidth>
      <CinematicDecor
        imageSrc={marketingImages.liveTvHero}
        imageDescription="A glowing media wall of video thumbnails in a dark theater"
        showBrandGlow
        viewportBleed
        contentAlign="center"
        minHeightClass="min-h-[280px] sm:min-h-[320px] md:min-h-[360px]"
      >
        <span
          className={["rt-page-fade-up mb-3 w-fit", kickerBadgeClassName].join(" ")}
          style={{ "--rt-enter-delay": "40ms" } as CSSProperties}
        >
          {t("tvBadge")}
        </span>
        <h1
          className="rt-page-fade-up max-w-[20ch] text-balance text-[28px] font-extrabold tracking-[-0.02em] text-brand md:text-[32px]"
          style={{ "--rt-enter-delay": "80ms" } as CSSProperties}
        >
          {t("tvHeroTitle")}
        </h1>
        <p
          className="rt-page-fade-up mx-auto mt-2 max-w-lg text-[13px] leading-relaxed text-white/70"
          style={{ "--rt-enter-delay": "140ms" } as CSSProperties}
        >
          {t("tvHeroDesc")}
        </p>

        {channels.length > 0 ? (
          <div
            className="rt-page-fade-up mt-5 flex flex-col items-center gap-4"
            style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
          >
            <div className="flex flex-wrap items-center justify-center gap-2">
              {firstFreeLive ? (
                <button
                  type="button"
                  onClick={() => selectChannel(firstFreeLive)}
                  className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  <PlayCircle size={15} aria-hidden />
                  {t("tvHeroWatchFree")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={browseChannels}
                className="inline-flex items-center justify-center rounded-md border border-white/18 bg-white/12 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-white/20"
              >
                {t("tvHeroBrowse")}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[12px] font-medium text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
                {t("tvHeroLiveCount").replace("{count}", String(liveCount))}
              </span>
              <span className="text-white/25" aria-hidden>
                ·
              </span>
              <span>{t("tvHeroFreeCount").replace("{count}", String(freeCount))}</span>
            </div>
          </div>
        ) : null}
      </CinematicDecor>

      {selection.status !== "idle" ? (
        <StatusBand selection={selection} onClose={closeBand} onRetry={selectChannel} />
      ) : null}

      <section
        ref={channelGridRef}
        id="tv-channels"
        className="rt-page-fade-up scroll-mt-20 px-4 py-6 sm:px-6 md:px-8"
        style={{ "--rt-enter-delay": "220ms" } as CSSProperties}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">
              {t("tvSectionAllChannels")}
            </h2>
            {selection.status === "idle" && channels.length > 0 ? (
              <p className="mt-1 text-[12px] text-text-muted">{t("tvSelectPrompt")}</p>
            ) : null}
          </div>

          {channels.length > 0 ? (
            <div
              role="tablist"
              aria-label={t("tvFilterAria")}
              className="flex flex-wrap gap-1.5"
            >
              {filters.map((item) => {
                const active = filter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilter(item.id)}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                      active
                        ? "bg-brand text-white"
                        : "border border-border bg-surface text-text-muted hover:border-border-hover hover:text-text",
                    ].join(" ")}
                  >
                    {item.label}
                    <span
                      className={[
                        "rounded-sm px-1 text-[10px] font-bold tabular-nums",
                        active ? "bg-white/20 text-white" : "bg-surface-elevated text-text-disabled",
                      ].join(" ")}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {channels.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-surface px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-border bg-surface-elevated text-text-muted">
              <TvIcon size={22} aria-hidden />
            </div>
            <p className="text-[14px] font-semibold text-text">{t("tvEmptyTitle")}</p>
            <p className="max-w-sm text-[13px] leading-relaxed text-text-muted">{t("tvEmptyDesc")}</p>
          </div>
        ) : filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-border bg-surface px-6 py-12 text-center">
            <p className="text-[14px] font-semibold text-text">{t("tvFilterEmptyTitle")}</p>
            <p className="max-w-sm text-[13px] text-text-muted">{t("tvFilterEmptyDesc")}</p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-2 rounded-md border border-border bg-surface-elevated px-4 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover"
            >
              {t("tvFilterAll")}
            </button>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filteredChannels.map((channel) => (
              <li key={channel.id}>
                <TvChannelCard
                  channel={channel}
                  isEntitled={isEntitled(channel)}
                  isSelected={selection.status !== "idle" && selection.channel.id === channel.id}
                  isLoading={
                    selection.status === "authorizing" && selection.channel.id === channel.id
                  }
                  onSelect={selectChannel}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
