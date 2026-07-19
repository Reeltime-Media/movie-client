"use client";

import { CheckCircle2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { KhqrCard } from "@/components/pay/KhqrCard";
import { createMovieBakongIntent, getPaymentIntent } from "@/lib/api/payments";
import { invalidatePurchasesCache } from "@/lib/api/purchases";
import { movieWatchHref } from "@/lib/movie-routes";
import { qrStringToDataUrl, warmQrCodeModule } from "@/lib/pay/khqr-image";
import { prefetchPlaybackUrl } from "@/lib/watch/playback-cache";

const BAKONG_POLL_MS = 4000;
const BAKONG_TIMEOUT_MS = 10 * 60 * 1000;

type BakongStatus = "loading" | "waiting" | "succeeded" | "expired" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type BakongCheckoutModalProps = {
  contentId: string;
  title: string;
  /** Display price fallback, e.g. "$2.99" — preferred amount comes from the intent. */
  priceLabel?: string;
  watchSlug: string;
  onClose: () => void;
};

export function BakongCheckoutModal({
  contentId,
  title,
  priceLabel,
  watchSlug,
  onClose,
}: BakongCheckoutModalProps) {
  const router = useRouter();
  const genRef = useRef(0);
  const closedRef = useRef(false);
  const [status, setStatus] = useState<BakongStatus>("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [amountUsd, setAmountUsd] = useState<string>("");
  const [merchantName, setMerchantName] = useState("Reeltime Media");
  const [error, setError] = useState("");

  const pollIntent = useCallback(async (intentId: string, gen: number) => {
    const deadline = Date.now() + BAKONG_TIMEOUT_MS;
    while (Date.now() < deadline) {
      if (closedRef.current || gen !== genRef.current) return;
      await sleep(BAKONG_POLL_MS);
      if (closedRef.current || gen !== genRef.current) return;

      let intent;
      try {
        intent = await getPaymentIntent(intentId);
      } catch {
        continue;
      }
      if (closedRef.current || gen !== genRef.current) return;

      if (intent.status === "succeeded") {
        invalidatePurchasesCache();
        void prefetchPlaybackUrl(contentId);
        setStatus("succeeded");
        return;
      }
      if (intent.status === "failed" || intent.status === "cancelled") {
        setError("Payment was not completed.");
        setStatus("error");
        return;
      }
    }
    if (!closedRef.current && gen === genRef.current) setStatus("expired");
  }, [contentId]);

  useEffect(() => {
    closedRef.current = false;
    const gen = ++genRef.current;
    void warmQrCodeModule();

    (async () => {
      try {
        const intent = await createMovieBakongIntent(contentId);
        if (closedRef.current || gen !== genRef.current) return;
        const dataUrl = await qrStringToDataUrl(intent.qr_string);
        if (closedRef.current || gen !== genRef.current) return;
        setQrDataUrl(dataUrl);
        setAmountUsd(String(intent.amount_usd));
        if (intent.merchant_name?.trim()) setMerchantName(intent.merchant_name.trim());
        setStatus("waiting");
        void pollIntent(intent.intent_id, gen);
      } catch (err: unknown) {
        if (closedRef.current || gen !== genRef.current) return;
        const statusCode =
          err && typeof err === "object" && "status" in err
            ? Number((err as { status: unknown }).status)
            : 0;
        if (statusCode === 429) {
          setError("Too many checkout attempts. Please wait a moment and try again.");
        } else {
          setError(err instanceof Error ? err.message : "Could not start Bakong checkout.");
        }
        setStatus("error");
      }
    })();

    return () => {
      if (gen === genRef.current) genRef.current += 1;
    };
  }, [contentId, pollIntent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      closedRef.current = true;
    };
  }, [onClose]);

  useEffect(() => {
    if (status !== "succeeded") return;
    const id = window.setTimeout(() => {
      router.push(movieWatchHref(watchSlug));
    }, 900);
    return () => window.clearTimeout(id);
  }, [status, router, watchSlug]);

  const amount =
    amountUsd ||
    (priceLabel ? priceLabel.replace(/[^\d.]/g, "") : "");

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Pay for ${title}`}
    >
      <div
        className="relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close checkout"
          className="mb-3 ml-auto flex size-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-colors hover:bg-black/90"
        >
          <X size={16} />
        </button>

        {status === "succeeded" ? (
          <div className="flex w-[260px] flex-col items-center gap-3 rounded-xl border border-border bg-surface p-8 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-success/30 bg-success/10 text-success">
              <CheckCircle2 size={24} aria-hidden />
            </div>
            <p className="text-[14px] font-semibold text-text">Payment successful</p>
            <p className="text-[12px] text-text-muted">Opening your movie…</p>
          </div>
        ) : status === "error" || status === "expired" ? (
          <div className="flex w-[260px] flex-col items-center gap-3 rounded-xl border border-border bg-surface p-6 text-center">
            <p className="text-[13px] text-danger">
              {status === "expired" ? "QR code expired — close and try again." : error}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-brand px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <KhqrCard
              receiverName={merchantName}
              amount={amount}
              currency="USD"
              qrDataUrl={qrDataUrl}
            />
            <p className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-white/90">
              <Loader2 size={14} className="animate-spin" aria-hidden />
              {qrDataUrl ? "Waiting for payment…" : "Generating KHQR…"}
            </p>
            <p className="mt-1 max-w-[260px] text-center text-[12px] text-white/60">
              Scan with Bakong or any banking app to pay for {title}.
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
