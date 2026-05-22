"use client";

import { BadgeCheck, CheckCircle2, CreditCard, Crown, ShieldCheck, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CinematicDecor } from "../components/CinematicDecor";
import { useI18n } from "../components/LocaleProvider";
import { PageShell } from "../components/PageShell";
import { isLoggedIn } from "@/lib/api/client";
import { listSeries } from "@/lib/api/series";
import { listSubscriptionPlans } from "@/lib/api/subscription-plans";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import type { SubscriptionPlanRead } from "@/lib/api/types";
import { marketingImages } from "@/lib/marketing-images";

const PERK_KEYS = [
  "pricingPerk1",
  "pricingPerk2",
  "pricingPerk3",
  "pricingPerk4",
] as const;

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
  const params = useSearchParams();
  const seriesSlug = params.get("slug");
  const [plans, setPlans] = useState<SubscriptionPlanRead[]>([]);
  const [activePlanCode, setActivePlanCode] = useState<string | null>(null);
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const subsPromise = isLoggedIn()
      ? listMySubscriptions().catch(() => [])
      : Promise.resolve([]);

    Promise.all([listSubscriptionPlans(), listSeries(), subsPromise])
      .then(([planItems, seriesItems, subs]) => {
        setPlans(planItems);
        const active = subs.find((s) => s.status === "active");
        setActivePlanCode(active?.plan ?? null);
        const fromQuery =
          seriesSlug && seriesItems.some((s) => s.slug === seriesSlug) ? seriesSlug : null;
        setCheckoutSlug(fromQuery ?? seriesItems[0]?.slug ?? null);
      })
      .catch(() => setError(t("pricingLoadError")))
      .finally(() => setLoading(false));
  }, [t, seriesSlug]);

  const recommendedCode = useMemo(
    () => (plans.length ? plans[0].code : null),
    [plans],
  );

  function subscribeHref(planName: string): string {
    const pricingReturn = seriesSlug
      ? `/pricing?slug=${encodeURIComponent(seriesSlug)}`
      : "/pricing";
    if (!isLoggedIn()) {
      return `/login?next=${encodeURIComponent(pricingReturn)}`;
    }
    if (!checkoutSlug) return "/series";
    const params = new URLSearchParams({
      slug: checkoutSlug,
      title: planName,
    });
    return `/pay/subscription?${params.toString()}`;
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
          <div
            className="rt-page-fade-up mb-3 inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm"
            style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
          >
            <Sparkles size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
            {t("pricingBadge")}
          </div>
          <h1
            className="rt-page-fade-up text-balance text-[clamp(1.625rem,3.5vw,2.125rem)] font-extrabold leading-[1.08] tracking-tight text-white"
            style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
          >
            {t("pricingTitle")}
          </h1>
          <p
            className="rt-page-fade-up mt-2.5 max-w-lg text-[13px] leading-relaxed text-white/78"
            style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
          >
            {t("pricingDesc")}
          </p>
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
        ) : error ? (
          <p className="text-center text-[13px] text-danger">{error}</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-[13px] text-text-muted">{t("pricingEmpty")}</p>
        ) : (
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

              return (
                <article
                  key={plan.id}
                  className={[
                    "relative flex flex-col rounded-md border bg-surface p-5 transition-colors",
                    isRecommended
                      ? "border-brand shadow-[0_0_0_1px_var(--color-brand)]"
                      : "border-border",
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
                    <Link
                      href={subscribeHref(plan.name)}
                      className="mt-auto inline-flex w-full items-center justify-center rounded-md bg-brand py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                    >
                      {isLoggedIn() ? t("pricingSubscribe") : t("pricingSignIn")}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section
        className="rt-page-fade-up border-t border-border px-6 py-8 md:px-8"
        style={{ "--rt-enter-delay": "320ms" } as CSSProperties}
      >
        <h2 className="text-[14px] font-bold text-text">{t("pricingPerksTitle")}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {PERK_KEYS.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-[13px] text-text-muted">
              <CheckCircle2 size={14} className="shrink-0 text-success" aria-hidden />
              {t(key)}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] font-semibold text-text-muted">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={14} className="shrink-0" aria-hidden />
            {t("pricingSecureNote")}
          </span>
          <span className="inline-flex items-center gap-2">
            <CreditCard size={14} className="shrink-0" aria-hidden />
            Baray
          </span>
        </div>

        <div className="mt-8">
          <Link
            href="/series"
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-border-hover"
          >
            {t("pricingBrowseSeries")}
          </Link>
        </div>
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
