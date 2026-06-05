"use client";

import { CheckCircle2, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { OrderSummaryPanel } from "@/components/pay/OrderSummaryPanel";
import { PayPageHero } from "@/components/pay/PayPageHero";
import { TrustPanel } from "@/components/pay/TrustPanel";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { getSeries } from "@/lib/api/series";
import { createSeriesSubscriptionIntent } from "@/lib/api/payments";
import { posterUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/use-auth";
import { seriesSubscriptionSuccessUrl, PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
import { metaPillClassName } from "@/lib/ui/surfaces";
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
    return <CheckoutSpinner />;
  }

  if (!series || (error && !series)) {
    return (
      <PageShell wide>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
          <p className="text-[15px] text-danger">{error || "Something went wrong."}</p>
          <Link
            href="/series"
            className="text-[13px] font-medium text-text-muted transition-colors hover:text-text"
          >
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
  const description =
    series.description ??
    "Reeltime Plus unlocks every series on the platform — new episodes weekly, no per-title fees, cancel anytime.";

  return (
    <PageShell wide>
      <PayPageHero
        badgeIcon={Lock}
        badgeLabel="Subscription"
        title="Unlock all series"
        subtitle={
          <>
            Stream <span className="font-semibold text-white">{series.title}</span> and every
            other series with one plan. Cancel anytime.
          </>
        }
        posterKey={series.poster_key}
        meta={
          <>
            <span className={metaPillClassName}>Reeltime Plus</span>
            <span className={metaPillClassName}>{price}/mo</span>
            {series.genres.slice(0, 3).map((genre) => (
              <span key={genre} className={metaPillClassName}>
                {genre}
              </span>
            ))}
          </>
        }
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-6">
            {trailerEmbed ? (
              <TrailerEmbed embedUrl={trailerEmbed} title={series.title} variant="bare" />
            ) : null}

            <div>
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                About this series
              </p>
              <p className="max-w-3xl text-[15px] leading-[1.7] text-text-muted">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            <OrderSummaryPanel
              itemTitle="Reeltime Plus"
              itemSubtitle={`Starting with ${series.title}`}
              posterSrc={poster}
              price={price}
              priceSuffix="/month"
              totalNote="All series · new episodes weekly · cancel anytime"
              payLabel={`Subscribe · ${price}/mo`}
              paying={paying}
              onPay={handleSubscribe}
              error={error || undefined}
            />
            <TrustPanel
              items={[
                { icon: CheckCircle2, label: "Full access to all series" },
                { icon: ShieldCheck, label: "Secure checkout via Baray" },
                { icon: CreditCard, label: "Card · KHQR · ABA Pay" },
              ]}
              backHref="/series"
              backLabel="Back to series"
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default function SubscriptionPayPage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <SubscriptionPayInner />
    </Suspense>
  );
}
