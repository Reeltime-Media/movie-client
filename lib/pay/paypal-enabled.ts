"use client";

import { useEffect, useState } from "react";
import { getCatalogPricing } from "@/lib/api/payments";

let cached: Promise<boolean> | null = null;

/** Does the API accept PayPal right now? Asked once per page load; any failure = no. */
function loadPaypalEnabled(): Promise<boolean> {
  cached ??= getCatalogPricing()
    .then((pricing) => pricing.paypal_enabled === true)
    .catch(() => {
      // Don't remember a failure: the next checkout may succeed.
      cached = null;
      return false;
    });
  return cached;
}

/** `null` while the answer is loading, then true/false. */
export function usePaypalEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    void loadPaypalEnabled().then((value) => {
      if (alive) setEnabled(value);
    });
    return () => {
      alive = false;
    };
  }, []);
  return enabled;
}
