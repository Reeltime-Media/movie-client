"use client";

import { AlertCircle, Loader2, LogIn, Lock, Radio, Tv as TvIcon, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { WatchPlayerBand } from "@/components/watch/WatchPageSection";
import { TvChannelCard } from "@/components/tv/TvChannelCard";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { authorizeTvChannel } from "@/lib/api/tv";
import { listMySubscriptions, hasActiveSubscription } from "@/lib/api/subscriptions";
import type { TvChannelRead } from "@/lib/api/types";
import { isAdminUser } from "@/lib/auth/is-admin";
import { loginPathWithNext } from "@/lib/auth-redirect";
import { marketingImages } from "@/lib/marketing-images";
import { swallow } from "@/lib/log";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
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

function LiveBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-brand px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-white">
      <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
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
    <section className="rt-page-fade-up border-b border-border">
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
          <WatchPlayer key={selection.url} hlsSrc={selection.url} title={channel.name} fill />
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
  const [hasSubscription, setHasSubscription] = useState(false);
  const [selection, setSelection] = useState<Selection>({ status: "idle" });
  const selectionGenRef = useRef(0);

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

  const closeBand = useCallback(() => {
    selectionGenRef.current += 1;
    setSelection({ status: "idle" });
  }, []);

  return (
    <PageShell fullWidth>
      <CinematicDecor
        imageSrc={marketingImages.theaterSeats}
        imageDescription="A dark theater with rows of empty seats"
        showBrandGlow
        viewportBleed
      >
        <span
          className={["rt-page-fade-up mb-3 inline-flex", kickerBadgeClassName].join(" ")}
          style={{ "--rt-enter-delay": "40ms" } as CSSProperties}
        >
          <Radio size={12} aria-hidden />
          {t("tvBadge")}
        </span>
        <h1
          className={["rt-page-fade-up max-w-[20ch]", pageTitleOnHeroClassName].join(" ")}
          style={{ "--rt-enter-delay": "80ms" } as CSSProperties}
        >
          {t("tvHeroTitle")}
        </h1>
        <p
          className="rt-page-fade-up mt-2 max-w-lg text-[13px] leading-relaxed text-white/70"
          style={{ "--rt-enter-delay": "140ms" } as CSSProperties}
        >
          {t("tvHeroDesc")}
        </p>
      </CinematicDecor>

      {selection.status !== "idle" ? (
        <StatusBand selection={selection} onClose={closeBand} onRetry={selectChannel} />
      ) : null}

      <section
        className="rt-page-fade-up px-4 py-6 sm:px-6 md:px-8"
        style={{ "--rt-enter-delay": "220ms" } as CSSProperties}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-bold tracking-[-0.01em] text-text">
            {t("tvSectionAllChannels")}
          </h2>
          {selection.status === "idle" && channels.length > 0 ? (
            <p className="text-[12px] text-text-muted">{t("tvSelectPrompt")}</p>
          ) : null}
        </div>

        {channels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <TvIcon size={28} className="text-text-disabled" aria-hidden />
            <p className="text-[14px] font-semibold text-text-muted">{t("tvEmptyTitle")}</p>
            <p className="max-w-sm text-[13px] text-text-disabled">{t("tvEmptyDesc")}</p>
          </div>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {channels.map((channel) => (
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
