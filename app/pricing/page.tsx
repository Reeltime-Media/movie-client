"use client";

import { Check, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { PageShell } from "@/components/layout/PageShell";
import { SeriesPickerModal } from "@/components/pay/SeriesPickerModal";
import { SeriesUnlockBakongCheckoutModal } from "@/components/pay/SeriesUnlockBakongCheckoutModal";
import { SubscriptionBakongCheckoutModal } from "@/components/pay/SubscriptionBakongCheckoutModal";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import { listSubscriptionPlans } from "@/lib/api/subscriptions";
import type { SeriesRead } from "@/lib/api/types";
import { UNLOCK_TIERS, SUBSCRIPTION_TIERS, findPlanTier, type PlanTier } from "@/lib/pricing-tiers";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { cardClassName, cardHighlightClassName, primaryButtonClassName } from "@/lib/ui/surfaces";

const MINI_TIER_KEY = "mini";

const secondaryPlanButtonClassName =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-border-hover px-4 py-3.5 text-[14px] font-bold text-text transition-colors duration-200 hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function PlanCard({
  plan,
  delayMs,
  onChoose,
}: {
  plan: PlanTier;
  delayMs: number;
  onChoose: (plan: PlanTier) => void;
}) {
  const { t } = useI18n();

  return (
    <article
      className={[
        "rt-page-fade-up relative flex flex-col p-5 transition-colors duration-200 md:p-6",
        plan.recommended ? cardHighlightClassName : cardClassName,
      ].join(" ")}
      style={{ "--rt-enter-delay": `${delayMs}ms` } as CSSProperties}
    >
      {plan.recommended ? (
        <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold text-white">
          <Star size={11} className="fill-current" aria-hidden />
          {t("pricingRecommended")}
        </span>
      ) : null}

      <div className="mb-3 text-[15px] font-semibold text-text-muted">{t(plan.nameKey)}</div>

      <div className="mb-4 text-[28px] font-extrabold tracking-[-0.02em] text-brand md:text-[32px]">
        ${plan.price}
      </div>

      <ul className="mb-6 flex-1 space-y-2">
        {plan.bulletKeys.map((bulletKey) => (
          <li key={bulletKey} className="flex items-start gap-2 text-[12px] text-text-muted">
            <Check size={13} className="mt-0.5 shrink-0" aria-hidden />
            {t(bulletKey)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChoose(plan)}
        className={plan.recommended ? primaryButtonClassName : secondaryPlanButtonClassName}
      >
        {t(plan.ctaKey)}
      </button>
    </article>
  );
}

function PricingPageInner() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { loggedIn } = useAuth();
  const [notice, setNotice] = useState("");
  const [pickingSeries, setPickingSeries] = useState(false);
  const [checkoutPlanCode, setCheckoutPlanCode] = useState<string | null>(null);
  const [checkoutSeries, setCheckoutSeries] = useState<{
    slug: string;
    title: string;
    watchHref: string;
  } | null>(null);
  // Maps a pricing-card tier key (e.g. "basic", "value") to the live plan code
  // the admin actually has active — the card that gets a real checkout vs. the
  // "unavailable" notice depends on whether a plan is currently configured for it.
  const [tierPlanCodes, setTierPlanCodes] = useState<Record<string, string>>({});

  // Set when this page was reached from a specific series' "subscribe to
  // unlock" CTA (see seriesPricingHref) — that's the only context in which
  // the Mini (per-series unlock) card has anything to purchase.
  const seriesSlug = params.get("slug");
  const seriesTitle = params.get("title") || seriesSlug || "this series";
  const seriesSeason = params.get("season") || "1";
  const seriesEpisode = params.get("episode") || "1";

  useEffect(() => {
    let cancelled = false;
    listSubscriptionPlans()
      .then((plans) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const plan of plans) {
          const tier = findPlanTier(plan.code);
          if (tier) map[tier.key] = plan.code;
        }
        setTierPlanCodes(map);
      })
      .catch(() => {
        // Leave the map empty — every card falls back to the unavailable notice.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleChoosePlan(plan: PlanTier) {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    if (plan.key === MINI_TIER_KEY) {
      setNotice("");
      if (!seriesSlug) {
        setPickingSeries(true);
        return;
      }
      setCheckoutSeries({
        slug: seriesSlug,
        title: seriesTitle,
        watchHref: `/watch/series/${seriesSlug}/${seriesSeason}/${seriesEpisode}`,
      });
      return;
    }

    const planCode = tierPlanCodes[plan.key];
    if (!planCode) {
      setNotice(t("pricingBarayDisabled"));
      return;
    }
    setNotice("");
    setCheckoutPlanCode(planCode);
  }

  function handlePickSeries(series: SeriesRead) {
    setPickingSeries(false);
    setCheckoutSeries({
      slug: series.slug,
      title: series.title,
      watchHref: `/watch/series/${series.slug}/1/1`,
    });
  }

  return (
    <PageShell wide>
      <section className="px-6 pb-16 pt-14 md:px-8 md:pt-16">
        <div
          className="rt-page-fade-up mx-auto max-w-lg text-center"
          style={{ "--rt-enter-delay": "20ms" } as CSSProperties}
        >
          <h1 className={[pageTitleClassName, "text-center"].join(" ")}>{t("pricingTitle")}</h1>
          <p className="mt-3 text-[13px] leading-relaxed text-text-muted">{t("pricingDesc")}</p>
        </div>

        {notice ? (
          <p className="mx-auto mt-4 max-w-lg text-center text-[13px] text-danger">{notice}</p>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          {UNLOCK_TIERS.map((plan, index) => (
            <PlanCard key={plan.key} plan={plan} delayMs={80 + index * 60} onChoose={handleChoosePlan} />
          ))}
        </div>

        <div className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUBSCRIPTION_TIERS.map((plan, index) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              delayMs={200 + index * 60}
              onChoose={handleChoosePlan}
            />
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-text-muted">{t("pricingSecureNote")}</p>
      </section>

      {checkoutPlanCode ? (
        <SubscriptionBakongCheckoutModal
          planCode={checkoutPlanCode}
          onClose={() => setCheckoutPlanCode(null)}
        />
      ) : null}

      {checkoutSeries ? (
        <SeriesUnlockBakongCheckoutModal
          seriesSlug={checkoutSeries.slug}
          title={checkoutSeries.title}
          watchHref={checkoutSeries.watchHref}
          onClose={() => setCheckoutSeries(null)}
        />
      ) : null}

      {pickingSeries ? (
        <SeriesPickerModal onSelect={handlePickSeries} onClose={() => setPickingSeries(false)} />
      ) : null}
    </PageShell>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<CheckoutSpinner fullWidth />}>
      <PricingPageInner />
    </Suspense>
  );
}
