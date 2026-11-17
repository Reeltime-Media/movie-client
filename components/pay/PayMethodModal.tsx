"use client";

import { CreditCard, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { safePaypalUrl } from "@/lib/safe-redirect";
import type { PaypalFunding, PaypalIntentRead } from "@/lib/api/payments";

export type PayMethodModalProps = {
  title: string;
  /** Display price, e.g. "$2.99" — optional (subscriptions show none). */
  priceLabel?: string;
  /** `true` while we are still asking the API whether PayPal is available. */
  loading?: boolean;
  onClose: () => void;
  onChooseBakong: () => void;
  /** Creates the PayPal order; the buyer is then sent to PayPal (card = card page first). */
  startPaypal: (funding: PaypalFunding) => Promise<PaypalIntentRead>;
  /** Called instead of redirecting when the API says the buyer already owns it (409). */
  onAlreadyOwned: () => void;
};

function statusOf(err: unknown): number {
  return err && typeof err === "object" && "status" in err
    ? Number((err as { status: unknown }).status)
    : 0;
}

export function PayMethodModal({
  title,
  priceLabel,
  loading = false,
  onClose,
  onChooseBakong,
  startPaypal,
  onAlreadyOwned,
}: PayMethodModalProps) {
  const [busy, setBusy] = useState<PaypalFunding | null>(null);
  const [error, setError] = useState("");
  const startedRef = useRef(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function handlePaypal(funding: PaypalFunding) {
    if (startedRef.current) return;
    startedRef.current = true;
    setBusy(funding);
    setError("");
    try {
      const intent = await startPaypal(funding);
      // Full-page redirect: PayPal sends the buyer back to /pay/paypal/return.
      window.location.assign(safePaypalUrl(intent.approve_url));
    } catch (err: unknown) {
      startedRef.current = false;
      setBusy(null);
      const code = statusOf(err);
      if (code === 409) {
        onAlreadyOwned();
        return;
      }
      if (code === 429) {
        setError("Too many checkout attempts. Please wait a moment and try again.");
      } else if (code === 503) {
        setError("PayPal is not available right now. Please pay with Bakong instead.");
      } else {
        setError(err instanceof Error ? err.message : "Could not start PayPal checkout.");
      }
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={busy ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Choose how to pay for ${title}`}
    >
      <div
        className="relative w-full max-w-[320px] rounded-xl border border-border bg-surface p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy !== null}
          aria-label="Close checkout"
          className="absolute right-3 top-3 flex size-7 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-colors hover:bg-black/90 disabled:opacity-50"
        >
          <X size={14} />
        </button>

        <p className="pr-8 text-[14px] font-semibold text-text">{title}</p>
        {priceLabel ? (
          <p className="mt-0.5 text-[12px] text-text-muted">{priceLabel}</p>
        ) : null}

        {loading ? (
          <div className="mt-6 flex justify-center py-4" aria-live="polite">
            <Loader2 size={18} className="animate-spin text-text-muted" aria-hidden />
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => void handlePaypal("paypal")}
              disabled={busy !== null}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#FFC439] text-[13px] font-bold text-[#111] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
            >
              {busy === "paypal" ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  Opening PayPal…
                </>
              ) : (
                "Pay with PayPal"
              )}
            </button>
            <button
              type="button"
              onClick={() => void handlePaypal("card")}
              disabled={busy !== null}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface-elevated text-[13px] font-semibold text-text transition-colors hover:border-border-hover disabled:cursor-wait disabled:opacity-70"
            >
              {busy === "card" ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                  Opening secure card page…
                </>
              ) : (
                <>
                  <CreditCard size={15} aria-hidden />
                  Pay by card (Visa / Mastercard)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onChooseBakong}
              disabled={busy !== null}
              className="h-11 cursor-pointer rounded-md border border-border bg-surface-elevated text-[13px] font-semibold text-text transition-colors hover:border-border-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Pay with Bakong KHQR
            </button>
            {error ? (
              <p role="alert" className="text-[12px] text-danger">
                {error}
              </p>
            ) : null}
            <p className="text-center text-[11px] text-text-muted">
              Card and PayPal payments are completed securely on PayPal, then you come back here.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
