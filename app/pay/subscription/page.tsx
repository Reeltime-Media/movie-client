"use client";

import { CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { getSeries } from "@/lib/api/series";
import { createSeriesSubscriptionIntent } from "@/lib/api/payments";
import { posterUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/use-auth";
import { seriesSubscriptionSuccessUrl, PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { SeriesRead } from "@/lib/api/types";

function SubscriptionPayInner() {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";
  const lockedSeason = params.get("season");
  const lockedEpisode = params.get("episode");

  const [series, setSeries] = useState<SeriesRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  useEffect(() => {
    if (!slug) {
      setError("Missing series slug.");
      setLoading(false);
      return;
    }
    getSeries(slug)
      .then((s) => {
        setSeries(s);
        setLoading(false);
      })
      .catch(() => {
        setError("Series not found.");
        setLoading(false);
      });
  }, [slug]);

  async function handleSubscribe() {
    if (!series) return;
    if (!loggedIn) {
      const next = `/pay/subscription?slug=${encodeURIComponent(series.slug)}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setPaying(true);
    setError("");
    try {
      const intent = await createSeriesSubscriptionIntent(
        series.id,
        seriesSubscriptionSuccessUrl(series.slug, {
          season: lockedSeason,
          episode: lockedEpisode,
        }),
      );
      sessionStorage.setItem(PENDING_INTENT_KEY, intent.intent_id);
      window.location.href = safeCheckoutUrl(intent.checkout_url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(msg);
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (!series || error) {
    return (
      <PageShell>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-[14px] text-danger">{error || "Something went wrong."}</p>
          <Link href="/series" className="text-[13px] text-text-muted hover:text-text">
            ← Back to series
          </Link>
        </div>
      </PageShell>
    );
  }

  const price = series.monthly_price_usd
    ? `$${parseFloat(series.monthly_price_usd).toFixed(2)}`
    : "$6.99";
  const poster = posterUrl(series.poster_key);
  const trailerEmbed = youtubeEmbedUrl(series.trailer_url);

  return (
    <PageShell>
      {/* Kicker */}
      <div className="px-6 pt-8 md:px-8">
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          <Lock size={13} />
          Subscription required
        </div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-text md:text-[34px]">
          Unlock all series
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          One subscription gives you access to{" "}
          <span className="font-semibold text-text">every series</span> on Reeltime —
          including <span className="font-semibold text-text">{series.title}</span>.
          Cancel anytime.
        </p>
      </div>

      <section className="px-6 pb-10 pt-6 md:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Main checkout card */}
          <div className="rounded-md border border-brand bg-surface p-5 md:col-span-2">
            {/* What you're unlocking */}
            {poster && (
              <div className="mb-4 flex gap-3 rounded-sm border border-border bg-bg p-3">
                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-sm border border-border">
                  <Image src={poster} alt={series.title} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">Starting with</div>
                  <div className="mt-0.5 truncate text-[14px] font-bold text-text">{series.title}</div>
                  {series.genres.length > 0 && (
                    <div className="mt-0.5 text-[11px] text-text-muted">{series.genres.join(" · ")}</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-end justify-between gap-2">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">
                  Reeltime Plus
                </div>
                <div className="mt-0.5 text-[11px] text-text-disabled">
                  All series · new episodes weekly · cancel anytime
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[28px] font-extrabold tracking-[-0.02em] text-text">
                  {price}
                </span>
                <span className="ml-1 text-[12px] text-text-muted">/mo</span>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-[12px] text-danger">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubscribe}
              disabled={paying}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand px-3 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Redirecting to checkout…
                </span>
              ) : (
                `Subscribe · ${price}/mo`
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-text-disabled">
              You will be redirected to our secure payment partner to complete the transaction.
            </p>
          </div>

          {/* Trust signals + perks */}
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <div className="mb-1 text-[12px] font-bold text-text">What&apos;s included</div>
            {[
              "Full access to all series",
              "New episodes every week",
              "No per-title fees",
              "Cancel anytime",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-2 text-[12px] text-text-muted">
                <CheckCircle2 size={13} className="shrink-0 text-success" />
                {perk}
              </div>
            ))}
            <div className="mt-2 border-t border-border pt-3 space-y-2">
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted">
                <ShieldCheck size={14} className="shrink-0" />
                Secure checkout via Baray
              </div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted">
                <CreditCard size={14} className="shrink-0" />
                Card · KHQR · ABA Pay
              </div>
            </div>
            <div className="mt-auto border-t border-border pt-3">
              <Link
                href="/series"
                className="text-[12px] text-text-muted transition-colors hover:text-text"
              >
                ← Back to series
              </Link>
            </div>
          </div>
        </div>

        {trailerEmbed && (
          <TrailerEmbed embedUrl={trailerEmbed} title={series.title} />
        )}
      </section>
    </PageShell>
  );
}

export default function SubscriptionPayPage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    }>
      <SubscriptionPayInner />
    </Suspense>
  );
}
