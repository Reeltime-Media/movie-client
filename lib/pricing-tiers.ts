import type { TranslationKey } from "@/lib/i18n";

export type PlanTier = {
  key: string;
  nameKey: TranslationKey;
  price: string;
  bulletKeys: TranslationKey[];
  ctaKey: TranslationKey;
  recommended?: boolean;
};

export const UNLOCK_TIERS: PlanTier[] = [
  {
    key: "mini",
    nameKey: "pricingPlanMiniName",
    price: "2.50",
    bulletKeys: ["pricingBulletUnlockEachSeries"],
    ctaKey: "pricingPlanMiniCta",
  },
  {
    key: "basic",
    nameKey: "pricingPlanBasicName",
    price: "3.49",
    bulletKeys: [
      "pricingPlanBasicDuration",
      "pricingBulletAllSeries",
      "pricingBulletAllMovies",
      "pricingBulletAllPodcast",
      "pricingBulletAllNews",
    ],
    ctaKey: "pricingPlanBasicCta",
  },
];

export const SUBSCRIPTION_TIERS: PlanTier[] = [
  {
    key: "value",
    nameKey: "pricingPlanValueName",
    price: "4.99",
    bulletKeys: [
      "pricingPlanValueDuration",
      "pricingBulletAllSeries",
      "pricingBulletAllMovies",
      "pricingBulletAllPodcast",
      "pricingBulletAllNews",
    ],
    ctaKey: "pricingPlanValueCta",
    recommended: true,
  },
  {
    key: "best-value",
    nameKey: "pricingPlanBestValueName",
    price: "6.99",
    bulletKeys: [
      "pricingPlanBestValueDuration",
      "pricingBulletAllSeries",
      "pricingBulletAllMovies",
      "pricingBulletAllPodcast",
      "pricingBulletAllNews",
    ],
    ctaKey: "pricingPlanBestValueCta",
  },
  {
    key: "premium",
    nameKey: "pricingPlanPremiumName",
    price: "10.99",
    bulletKeys: [
      "pricingPlanPremiumDuration",
      "pricingBulletAllSeries",
      "pricingBulletAllMovies",
      "pricingBulletAllPodcast",
      "pricingBulletAllNews",
    ],
    ctaKey: "pricingPlanPremiumCta",
  },
];

const ALL_PLAN_TIERS: PlanTier[] = [...UNLOCK_TIERS, ...SUBSCRIPTION_TIERS];

/** Maps the raw plan codes seeded on the backend (e.g. "premium_annual") to a
 * display tier — the subscription API has no price/copy of its own, so the
 * profile and pricing pages share this one source of display data. */
const PLAN_CODE_ALIASES: Record<string, string> = {
  basic_monthly: "basic",
  standard_monthly: "best-value",
  premium_annual: "premium",
};

export function findPlanTier(planCode: string): PlanTier | undefined {
  const normalized = planCode.toLowerCase();
  const aliasKey = PLAN_CODE_ALIASES[normalized];
  if (aliasKey) return ALL_PLAN_TIERS.find((tier) => tier.key === aliasKey);

  const flattened = normalized.replace(/[_\s]/g, "-");
  return ALL_PLAN_TIERS.find((tier) => flattened.includes(tier.key));
}
