"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { waitForPaymentSucceeded } from "@/lib/api/payments";
import { PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeRedirectPath } from "@/lib/safe-redirect";

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeRedirectPath(params.get("next"), "/");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const intentId = sessionStorage.getItem(PENDING_INTENT_KEY);
    if (!intentId) {
      router.replace(next);
      return;
    }

    waitForPaymentSucceeded(intentId)
      .then(() => {
        sessionStorage.removeItem(PENDING_INTENT_KEY);
        router.replace(next);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Could not confirm payment.";
        setError(msg);
      });
  }, [next, router]);

  if (error) {
    return (
      <PageShell>
        <div className="flex h-64 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-[14px] text-danger">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/")}
            className="text-[13px] text-text-muted hover:text-text"
          >
            Back to home
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        <p className="text-[13px] text-text-muted">Confirming your payment…</p>
      </div>
    </PageShell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        </PageShell>
      }
    >
      <PaymentSuccessInner />
    </Suspense>
  );
}
