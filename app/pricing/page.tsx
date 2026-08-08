"use client";

import { Check, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { useAuth } from "@/hooks/auth/use-auth";
import type { TranslationKey } from "@/lib/i18n";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { cardClassName, cardHighlightClassName, primaryButtonClassName } from "@/lib/ui/surfaces";

const secondaryPlanButtonClassName =
  "inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-border-hover px-4 py-3.5 text-[14px] font-bold text-text transition-colors duration-200 hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type PlanTier = {
  key: string;
  nameKey: TranslationKey;
  price: string;
  bulletKeys: TranslationKey[];
  ctaKey: TranslationKey;
  recommended?: boolean;
};

const UNLOCK_TIERS: PlanTier[] = [
  {
    key: "mini",
    nameKey: "pricingPlanMiniName",
    price: "2.49",
    bulletKeys: ["pricingBulletUnlockEachSeries"],
    ctaKey: "pricingPlanMiniCta",
  },
  {
    key: "basic",
    nameKey: "pricingPlanBasicName",
    price: "3.49",
    bulletKeys: ["pricingPlanBasicDuration", "pricingBulletUnlockAllSeries"],
    ctaKey: "pricingPlanBasicCta",
  },
];

const SUBSCRIPTION_TIERS: PlanTier[] = [
  {
    key: "value",
    nameKey: "pricingPlanValueName",
    price: "4.99",
    bulletKeys: ["pricingPlanValueDuration", "pricingBulletAllSeries", "pricingBulletAllMovies"],
    ctaKey: "pricingPlanValueCta",
    recommended: true,
  },
  {
    key: "best-value",
    nameKey: "pricingPlanBestValueName",
    price: "6.99",
    bulletKeys: ["pricingPlanBestValueDuration", "pricingBulletAllSeries", "pricingBulletAllMovies"],
    ctaKey: "pricingPlanBestValueCta",
  },
  {
    key: "premium",
    nameKey: "pricingPlanPremiumName",
    price: "10.99",
    bulletKeys: ["pricingPlanPremiumDuration", "pricingBulletAllSeries", "pricingBulletAllMovies"],
    ctaKey: "pricingPlanPremiumCta",
  },
];

function PlanCard({
  plan,
  delayMs,
  onChoose,
}: {
  plan: PlanTier;
  delayMs: number;
  onChoose: () => void;
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
        onClick={onChoose}
        className={plan.recommended ? primaryButtonClassName : secondaryPlanButtonClassName}
      >
        {t(plan.ctaKey)}
      </button>
    </article>
  );
}

export default function PricingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { loggedIn } = useAuth();
  const [notice, setNotice] = useState("");

  function handleChoosePlan() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }
    setNotice(t("pricingBarayDisabled"));
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
    </PageShell>
  );
}
