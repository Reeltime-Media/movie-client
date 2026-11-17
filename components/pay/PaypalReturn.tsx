"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { capturePaypalOrder, getPaymentIntent } from "@/lib/api/payments";
import { invalidatePurchasesCache } from "@/lib/api/purchases";
import { invalidateSubscriptionsCache } from "@/lib/api/subscriptions";
import { parsePaypalReturn } from "@/lib/pay/paypal-return";

type View =
  | { kind: "working" }
  | { kind: "success" }
  | { kind: "confirming" }
  | { kind: "cancelled" }
  | { kind: "error"; message: string };

const CONFIRM_POLL_MS = 3000;
const CONFIRM_POLL_ATTEMPTS = 40;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Landing page after PayPal: captures the payment, then opens what the buyer paid for. */
export function PaypalReturn() {
  const searchParams = useSearchParams();
  const ret = parsePaypalReturn(searchParams);
  const startedRef = useRef(false);
  const [view, setView] = useState<View>(() => {
    if (ret.cancelled) return { kind: "cancelled" };
    if (!ret.orderId) return { kind: "error", message: "This payment link is not valid." };
    return { kind: "working" };
  });

  useEffect(() => {
    if (ret.cancelled || !ret.orderId || startedRef.current) return;
    startedRef.current = true;
    const orderId = ret.orderId;

    function unlocked() {
      invalidatePurchasesCache();
      invalidateSubscriptionsCache();
      setView({ kind: "success" });
      if (ret.client === "web") {
        // Hard navigation, like the Bakong flow: access data must be re-read.
        window.setTimeout(() => window.location.replace(ret.next), 900);
      }
    }

    void (async () => {
      try {
        const intent = await capturePaypalOrder(orderId);
        if (intent.status === "succeeded" || intent.status === "superseded") {
          unlocked();
          return;
        }
        if (intent.status === "failed" || intent.status === "expired") {
          setView({ kind: "error", message: "The payment was not completed. You were not charged." });
          return;
        }
        // Still pending on PayPal's side (e.g. under review): the webhook finishes it.
        setView({ kind: "confirming" });
        if (ret.client !== "web") return; // the app polls on its own
        for (let attempt = 0; attempt < CONFIRM_POLL_ATTEMPTS; attempt += 1) {
          await sleep(CONFIRM_POLL_MS);
          const latest = await getPaymentIntent(intent.intent_id);
          if (latest.status === "succeeded" || latest.status === "superseded") {
            unlocked();
            return;
          }
          if (latest.status === "failed" || latest.status === "expired") {
            setView({ kind: "error", message: "The payment was not completed." });
            return;
          }
        }
      } catch (err: unknown) {
        const status =
          err && typeof err === "object" && "status" in err
            ? Number((err as { status: unknown }).status)
            : 0;
        setView({
          kind: "error",
          message:
            status === 404
              ? "We could not find this payment."
              : err instanceof Error
                ? err.message
                : "We could not confirm your PayPal payment.",
        });
      }
    })();
  }, [ret.cancelled, ret.orderId, ret.client, ret.next]);

  return (
    <PageShell>
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
        <div className="flex w-full max-w-[340px] flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center">
          {view.kind === "working" ? (
            <>
              <Loader2 size={26} className="animate-spin text-text-muted" aria-hidden />
              <p className="text-[14px] font-semibold text-text">Confirming your PayPal payment…</p>
              <p className="text-[12px] text-text-muted">Please keep this page open.</p>
            </>
          ) : null}

          {view.kind === "confirming" ? (
            <>
              <Loader2 size={26} className="animate-spin text-text-muted" aria-hidden />
              <p className="text-[14px] font-semibold text-text">PayPal is still confirming</p>
              <p className="text-[12px] text-text-muted">
                {ret.client === "app"
                  ? "You can close this window and go back to the REELTIME app. It unlocks as soon as PayPal confirms."
                  : "This can take a minute. Your purchase unlocks automatically."}
              </p>
            </>
          ) : null}

          {view.kind === "success" ? (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
                <CheckCircle2 size={24} aria-hidden />
              </div>
              <p className="text-[14px] font-semibold text-text">Payment successful</p>
              <p className="text-[12px] text-text-muted">
                {ret.client === "app"
                  ? "You can close this window and go back to the REELTIME app."
                  : "Opening your purchase…"}
              </p>
              {ret.client === "web" ? (
                <Link href={ret.next} className="text-[12px] font-semibold text-brand hover:underline">
                  Continue
                </Link>
              ) : null}
            </>
          ) : null}

          {view.kind === "cancelled" ? (
            <>
              <XCircle size={26} className="text-text-muted" aria-hidden />
              <p className="text-[14px] font-semibold text-text">Payment cancelled</p>
              <p className="text-[12px] text-text-muted">You were not charged.</p>
              {ret.client === "web" ? (
                <Link
                  href={ret.next}
                  className="mt-1 rounded-md bg-brand px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  Go back
                </Link>
              ) : (
                <p className="text-[12px] text-text-muted">You can close this window.</p>
              )}
            </>
          ) : null}

          {view.kind === "error" ? (
            <>
              <XCircle size={26} className="text-danger" aria-hidden />
              <p role="alert" className="text-[13px] text-danger">
                {view.message}
              </p>
              <p className="text-[12px] text-text-muted">
                If PayPal charged you, contact support with the time of payment.
              </p>
              {ret.client === "web" ? (
                <Link
                  href={ret.next}
                  className="mt-1 rounded-md bg-brand px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  Go back
                </Link>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
