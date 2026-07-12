"use client";

import { BadgeCheck, Crown } from "lucide-react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CinematicDecor } from "@/components/home/CinematicDecor";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import { createSeriesSubscriptionIntent } from "@/lib/api/payments";
import { listSeries } from "@/lib/api/series";
import { listSubscriptionPlans } from "@/lib/api/subscription-plans";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import type { SeriesRead, SubscriptionPlanRead } from "@/lib/api/types";
import { marketingImages } from "@/lib/marketing-images";
import { PENDING_INTENT_KEY, seriesSubscriptionSuccessUrl } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
import { pageTitleOnHeroClassName } from "@/lib/ui/page-title";
import { cardClassName, cardHighlightClassName, primaryButtonClassName } from "@/lib/ui/surfaces";

function formatPrice(priceUsd: string): string {
  const parsed = Number.parseFloat(priceUsd);
  if (Number.isNaN(parsed)) return priceUsd;
  return parsed.toFixed(2);
}

function billingSuffix(
  days: number,
  t: (key: "pricingBillingMonthly" | "pricingBillingYearly" | "pricingBillingDays") => string,
): string {
  if (days === 30) return t("pricingBillingMonthly");
  if (days === 365) return t("pricingBillingYearly");
  return t("pricingBillingDays").replace("{days}", String(days));
}

function PricingPageInner() {
  const { t } = useI18n();
  const router = useRouter();
  const { loggedIn } = useAuth();
  const params = useSearchParams();
  const seriesSlug = params.get("slug");
  const lockedSeason = params.get("season");
  const lockedEpisode = params.get("episode");

  const [plans, setPlans] = useState<SubscriptionPlanRead[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesRead[]>([]);
  const [activePlanCode, setActivePlanCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const subsPromise = loggedIn
      ? listMySubscriptions().catch(() => [])
      : Promise.resolve([]);

    Promise.all([listSubscriptionPlans(), listSeries(), subsPromise])
      .then(([planItems, seriesItems, subs]) => {
        setPlans(planItems);
        setSeriesList(seriesItems);
        const active = subs.find((s) => s.status === "active");
        setActivePlanCode(active?.plan ?? null);
      })
      .catch(() => setError(t("pricingLoadError")))
      .finally(() => setLoading(false));
  }, [t, loggedIn]);

  const checkoutSeries = useMemo(() => {
    if (seriesSlug) {
      const match = seriesList.find((s) => s.slug === seriesSlug);
      if (match) return match;
    }
    return seriesList[0] ?? null;
  }, [seriesList, seriesSlug]);

  const recommendedCode = useMemo(
    () => (plans.length ? plans[0].code : null),
    [plans],
  );

  async function handleSubscribe(planId: string) {
    const pricingReturn = seriesSlug
      ? `/pricing?slug=${encodeURIComponent(seriesSlug)}${
          lockedSeason ? `&season=${encodeURIComponent(lockedSeason)}` : ""
        }${lockedEpisode ? `&episode=${encodeURIComponent(lockedEpisode)}` : ""}`
      : "/pricing";

    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(pricingReturn)}`);
      return;
    }
    if (!checkoutSeries) {
      router.push("/series");
      return;
    }

    setPayingPlanId(planId);
    setError("");
    try {
      const intent = await createSeriesSubscriptionIntent(
        checkoutSeries.id,
        seriesSubscriptionSuccessUrl(checkoutSeries.slug, {
          season: lockedSeason,
          episode: lockedEpisode,
        }),
      );
      sessionStorage.setItem(PENDING_INTENT_KEY, intent.intent_id);
      window.location.href = safeCheckoutUrl(intent.checkout_url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("pricingLoadError");
      setError(msg);
      setPayingPlanId(null);
    }
  }

  return (
    <PageShell wide>
      <CinematicDecor
        imageSrc={marketingImages.cinemaCurtains}
        imageDescription="Classic red cinema curtains and velvet seats"
        showBrandGlow
        minHeightClass="min-h-[200px] sm:min-h-[240px]"
        viewportBleed
      >
        <div className="max-w-2xl">
          <h1
            className={["rt-page-fade-up", pageTitleOnHeroClassName].join(" ")}
            style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
          >
            {t("pricingTitle")}
          </h1>
        </div>
      </CinematicDecor>

      <section
        className="rt-page-fade-up px-6 pb-4 pt-8 md:px-8"
        style={{ "--rt-enter-delay": "180ms" } as CSSProperties}
      >
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        ) : error && plans.length === 0 ? (
          <p className="text-center text-[13px] text-danger">{error}</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-[13px] text-text-muted">{t("pricingEmpty")}</p>
        ) : (
          <>
            {error ? (
              <p className="mb-4 text-center text-[13px] text-danger">{error}</p>
            ) : null}
            <div
              className={[
                "grid gap-4",
                plans.length === 1 ? "mx-auto max-w-md" : "md:grid-cols-2 lg:grid-cols-3",
              ].join(" ")}
            >
              {plans.map((plan, index) => {
                const isRecommended = plan.code === recommendedCode;
                const isCurrent = activePlanCode === plan.code;
                const price = formatPrice(plan.price_usd);
                const isPaying = payingPlanId === plan.id;

                return (
                  <article
                    key={plan.id}
                    className={[
                      "relative flex flex-col p-5 transition-colors duration-200",
                      isRecommended ? cardHighlightClassName : cardClassName,
                    ].join(" ")}
                    style={{ "--rt-enter-delay": `${220 + index * 60}ms` } as CSSProperties}
                  >
                    {isRecommended && !isCurrent ? (
                      <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-sm bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Crown size={11} aria-hidden />
                        {t("pricingRecommended")}
                      </span>
                    ) : null}
                    {isCurrent ? (
                      <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-sm bg-success/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                        <BadgeCheck size={11} aria-hidden />
                        {t("pricingCurrentPlan")}
                      </span>
                    ) : null}

                    <div className="mb-1 text-[12px] font-semibold uppercase tracking-widest text-text-muted">
                      {plan.name}
                    </div>
                    {plan.description ? (
                      <p className="mb-4 text-[12px] leading-relaxed text-text-muted">
                        {plan.description}
                      </p>
                    ) : (
                      <div className="mb-4" />
                    )}

                    <div className="mb-5 flex items-end gap-1">
                      <span className="text-[32px] font-extrabold tracking-[-0.02em] text-text">
                        ${price}
                      </span>
                      <span className="pb-1 text-[12px] text-text-muted">
                        {billingSuffix(plan.billing_interval_days, t)}
                      </span>
                    </div>

                    {isCurrent ? (
                      <Link
                        href="/profile"
                        className="mt-auto inline-flex w-full items-center justify-center rounded-md border border-border py-3 text-[13px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
                      >
                        {t("navProfile")}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled={Boolean(payingPlanId)}
                        onClick={() => void handleSubscribe(plan.id)}
                        className={[primaryButtonClassName, "mt-auto disabled:opacity-60"].join(" ")}
                      >
                        {isPaying
                          ? "…"
                          : loggedIn
                            ? t("pricingSubscribe")
                            : t("pricingSignIn")}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </PageShell>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <PageShell wide>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        </PageShell>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
