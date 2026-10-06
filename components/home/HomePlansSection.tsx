"use client";

import { Check, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useDragScroll } from "@/hooks/use-drag-scroll";
import { getCatalogPricing } from "@/lib/api/payments";
import { listSubscriptionPlans } from "@/lib/api/subscriptions";
import type { TranslationKey } from "@/lib/i18n";
import { swallow } from "@/lib/log";
import {
  SUBSCRIPTION_TIERS,
  UNLOCK_TIERS,
  findPlanTier,
  formatUsdAmount,
  type PlanTier,
} from "@/lib/pricing-tiers";

const MINI_TIER_KEY = "mini";

const DURATION_KEYS = new Set<TranslationKey>([
  "pricingPlanBasicDuration",
  "pricingPlanValueDuration",
  "pricingPlanBestValueDuration",
  "pricingPlanPremiumDuration",
]);

function splitPlanCopy(plan: PlanTier) {
  const durationKey = plan.bulletKeys.find((key) => DURATION_KEYS.has(key));
  const featureKeys = plan.bulletKeys.filter((key) => !DURATION_KEYS.has(key)).slice(0, 3);
  return { durationKey, featureKeys };
}

function HomePlanCard({ plan }: { plan: PlanTier; delayMs?: number }) {
  const { t } = useI18n();
  const { durationKey, featureKeys } = splitPlanCopy(plan);
  const recommended = Boolean(plan.recommended);

  return (
    <article
      className={[
        "rt-plan-pass group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl",
        recommended ? "rt-plan-pass--featured" : "rt-plan-pass--standard",
      ].join(" ")}
    >
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 opacity-90",
          recommended
            ? "bg-[radial-gradient(ellipse_90%_70%_at_20%_-10%,rgba(229,9,20,0.45),transparent_55%),linear-gradient(160deg,#1a0507_0%,#12090b_42%,#0d0d0d_100%)]"
            : "bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(255,255,255,0.08),transparent_50%),linear-gradient(165deg,#171717_0%,#101010_55%,#0c0c0c_100%)]",
        ].join(" ")}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />

      {recommended ? (
        <div className="relative z-1 flex items-center justify-between gap-2 px-5 pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_-8px_rgba(229,9,20,0.8)]">
            <Sparkles size={11} aria-hidden />
            {t("pricingRecommended")}
          </span>
          <Ticket size={16} className="text-brand/80" aria-hidden />
        </div>
      ) : (
        <div className="relative z-1 flex items-center justify-end px-5 pt-4">
          <Ticket size={16} className="text-white/30" aria-hidden />
        </div>
      )}

      <div className="relative z-1 flex flex-1 flex-col px-5 pb-5 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
          {t("homePlansPassLabel")}
        </p>
        <h3 className="mt-1 text-[22px] font-extrabold tracking-[-0.03em] text-white">
          {t(plan.nameKey)}
        </h3>

        <div className="mt-4 flex items-end gap-2">
          <span className="text-[13px] font-bold text-brand">$</span>
          <span className="text-[40px] font-black leading-none tracking-[-0.04em] text-white">
            {plan.price}
          </span>
          {durationKey ? (
            <span className="mb-1 rounded-md border border-white/12 bg-white/6 px-2 py-0.5 text-[11px] font-semibold text-white/70">
              {t(durationKey)}
            </span>
          ) : null}
        </div>

        <div
          aria-hidden
          className="rt-plan-pass-perforation my-4"
        />

        <ul className="mb-5 flex-1 space-y-2.5">
          {featureKeys.map((bulletKey) => (
            <li key={bulletKey} className="flex items-start gap-2.5 text-[12px] leading-snug text-white/72">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
                <Check size={10} strokeWidth={3} aria-hidden />
              </span>
              {t(bulletKey)}
            </li>
          ))}
        </ul>

        <Link
          href="/pricing"
          className={[
            "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-[13px] font-extrabold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            recommended
              ? "bg-brand text-white shadow-[0_12px_28px_-10px_rgba(229,9,20,0.75)] hover:bg-brand-hover hover:shadow-[0_16px_32px_-10px_rgba(229,9,20,0.85)]"
              : "border border-white/14 bg-white/8 text-white hover:border-white/25 hover:bg-white/14",
          ].join(" ")}
        >
          {t(plan.ctaKey)}
        </Link>
      </div>
    </article>
  );
}

export function HomePlansSection() {
  const { t } = useI18n();
  const [tierPrices, setTierPrices] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      listSubscriptionPlans().catch(swallow("home plans: load plans", [])),
      getCatalogPricing().catch(swallow("home plans: load catalog pricing", null)),
    ]).then(([plans, catalog]) => {
      if (cancelled) return;
      const prices: Record<string, string> = {};
      if (catalog) {
        const unlock = formatUsdAmount(catalog.series_unlock_usd);
        if (unlock) prices[MINI_TIER_KEY] = unlock;
      }
      for (const plan of plans) {
        const tier = findPlanTier(plan.code);
        if (!tier) continue;
        const amount = formatUsdAmount(plan.price_usd);
        if (amount) prices[tier.key] = amount;
      }
      setTierPrices(prices);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const plans = useMemo(() => {
    const all = [...UNLOCK_TIERS, ...SUBSCRIPTION_TIERS];
    return all.map((plan) => {
      const live = tierPrices[plan.key];
      return live ? { ...plan, price: live } : plan;
    });
  }, [tierPrices]);

  const autoScrollRef = useAutoScroll(0.4, 1800, "left");
  const dragScrollRef = useDragScroll();
  const scrollRef = (node: HTMLDivElement | null) => {
    autoScrollRef.current = node;
    dragScrollRef.current = node;
  };

  const items = [...plans, ...plans];

  return (
    <section className="relative overflow-hidden pt-8 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 h-64 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(229,9,20,0.16),transparent_70%)]"
      />

      <SectionHeader
        title={t("homePlansTitle")}
        showSeeAll
        seeAllHref="/pricing"
        seeAllLabel={t("sectionSeeAll")}
      />
      <p className="relative z-1 mt-3 px-4 text-[13px] leading-relaxed text-text-muted sm:px-6 md:max-w-2xl md:px-8">
        {t("homePlansDesc")}
      </p>

      <div
        ref={scrollRef}
        className="relative z-1 mt-5 overflow-x-auto overflow-y-visible px-4 pb-4 pt-3 sm:px-6 md:px-8 rt-scroll-rail rt-drag-rail"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <ul className="m-0 flex w-max list-none flex-row gap-4 p-0 snap-x snap-mandatory">
          {items.map((plan, i) => {
            const isClone = i >= plans.length;
            return (
              <li
                key={`${plan.key}-${i}`}
                className={[
                  "rt-plan-pass-orbit shrink-0 snap-start",
                  plan.recommended
                    ? "w-[min(300px,82vw)] sm:w-75"
                    : "w-[min(270px,78vw)] sm:w-68",
                ].join(" ")}
                aria-hidden={isClone ? true : undefined}
                style={{ animationDelay: `${(i % plans.length) * 140}ms` }}
              >
                <HomePlanCard plan={plan} delayMs={0} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
