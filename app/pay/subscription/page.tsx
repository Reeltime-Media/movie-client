"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { seriesPricingHref } from "@/lib/series-pricing";

function SubscriptionPayRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    router.replace(
      seriesPricingHref({
        slug: params.get("slug"),
        season: params.get("season"),
        episode: params.get("episode"),
        title: params.get("title"),
      }),
    );
  }, [router, params]);

  return <CheckoutSpinner />;
}

export default function SubscriptionPayPage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <SubscriptionPayRedirect />
    </Suspense>
  );
}
