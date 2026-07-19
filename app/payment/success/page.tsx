"use client";

import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { PageShell } from "@/components/layout/PageShell";
// BARAY DISABLED — success polling was for Baray redirect checkout.
// import { waitForPaymentSucceeded } from "@/lib/api/payments";
import { PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { cardClassName, secondaryButtonClassName } from "@/lib/ui/surfaces";

function PaymentSuccessInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeRedirectPath(params.get("next"), "/");
  const [error, setError] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    // BARAY DISABLED — clear any leftover pending intent and send user onward.
    sessionStorage.removeItem(PENDING_INTENT_KEY);
    setError("Subscription checkout is temporarily unavailable.");
    return;

    /* BARAY DISABLED — original success confirmation kept for later.
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
    */
  }, [next, router]);

  if (error) {
    return (
      <PageShell wide>
        <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
          <div className={["max-w-md p-8 text-center", cardClassName].join(" ")}>
            <p className="text-[15px] font-medium text-danger">{error}</p>
            <button
              type="button"
              onClick={() => router.replace("/")}
              className={[secondaryButtonClassName, "mt-6 w-full"].join(" ")}
            >
              Back to home
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell wide>
      <div className="flex min-h-[50vh] items-center justify-center px-6 py-12">
        <div className={["max-w-md p-8 text-center", cardClassName].join(" ")}>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
            <CheckCircle2 size={28} aria-hidden />
          </div>
          <h1 className="mt-5 text-[20px] font-bold text-text">Confirming your payment</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-text-muted">
            Hang tight — we&apos;re verifying your transaction and unlocking your content.
          </p>
          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </div>
    </PageShell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <PaymentSuccessInner />
    </Suspense>
  );
}
