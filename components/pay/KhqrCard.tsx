"use client";

import { Nunito_Sans } from "next/font/google";
import Image from "next/image";

/**
 * KHQR payment card — matched to NBC / Bakong reference widget:
 * rounded white card, red header with bottom-right dog-ear,
 * left-aligned merchant + "$ amount", dashed divider, QR with $ badge.
 */

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const BAKONG_RED = "#E1232E";
const CARD_W = 280;
const CARD_RADIUS = 20;
const HEADER_H = 56;
const PAD_X = 28;
const QR_SIZE = 200;

export type KhqrCardProps = {
  receiverName: string;
  amount?: string | null;
  currency?: "USD" | "KHR";
  qrDataUrl: string | null;
  className?: string;
};

function formatAmount(amount: string, currency: "USD" | "KHR"): string {
  const n = Number(amount.replace(/,/g, ""));
  if (!Number.isFinite(n)) return amount;
  if (currency === "KHR") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  }
  // Match reference spacing: keep decimals only when needed
  const hasCents = Math.round(n * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function parsePriceLabel(priceLabel?: string | null): {
  amount: string;
  currency: "USD" | "KHR";
} {
  if (!priceLabel?.trim()) return { amount: "", currency: "USD" };
  const raw = priceLabel.trim();
  if (/khr/i.test(raw) || raw.includes("៛")) {
    return { amount: raw.replace(/[^\d.]/g, ""), currency: "KHR" };
  }
  return { amount: raw.replace(/[^\d.]/g, ""), currency: "USD" };
}

export function KhqrCard({
  receiverName,
  amount,
  currency = "USD",
  qrDataUrl,
  className = "",
}: KhqrCardProps) {
  const hasAmount = Boolean(amount && amount.trim() && Number(amount) !== 0);
  const displayAmount = hasAmount ? formatAmount(amount!.trim(), currency) : "0";
  const badge = currency === "KHR" ? "៛" : "$";

  return (
    <div
      className={`${nunitoSans.className} box-border flex flex-col overflow-hidden bg-white text-black ${className}`}
      style={{
        width: CARD_W,
        maxWidth: "100%",
        borderRadius: CARD_RADIUS,
        boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
      }}
      aria-label={`KHQR payment for ${receiverName}, ${badge} ${displayAmount}`}
    >
      {/* Red header + dog-ear fold on bottom-right */}
      <div className="relative shrink-0" style={{ height: HEADER_H + 14 }}>
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center"
          style={{
            height: HEADER_H + 14,
            backgroundColor: BAKONG_RED,
            // Flat bottom with diagonal dog-ear pointing down on the right
            clipPath:
              "polygon(0 0, 100% 0, 100% 100%, 86% 72%, 0 72%)",
          }}
        >
          <Image
            src="/asset/payment/khqr.png"
            alt="KHQR"
            width={120}
            height={40}
            style={{ height: 28, width: "auto", marginTop: -10 }}
            unoptimized
            priority
          />
        </div>
      </div>

      {/* Merchant + amount */}
      <div style={{ padding: `8px ${PAD_X}px 0` }}>
        <p
          className="m-0 truncate font-medium leading-snug text-black"
          style={{ fontSize: 14, letterSpacing: 0 }}
        >
          {receiverName}
        </p>
        <p
          className="m-0 font-extrabold leading-none text-black"
          style={{ fontSize: 28, letterSpacing: 0, marginTop: 8 }}
        >
          {currency === "USD" ? (
            <>
              <span style={{ fontWeight: 700 }}>$ </span>
              {displayAmount}
            </>
          ) : (
            <>
              {displayAmount}
              <span style={{ fontSize: 14, fontWeight: 600 }}> {badge}</span>
            </>
          )}
        </p>
      </div>

      {/* Dashed ticket divider */}
      <div
        style={{
          margin: "18px 16px 0",
          borderTop: "1.5px dashed #C8C8C8",
        }}
      />

      {/* QR + center currency badge */}
      <div
        className="relative mx-auto flex items-center justify-center"
        style={{
          width: QR_SIZE,
          height: QR_SIZE,
          marginTop: 18,
          marginBottom: 22,
        }}
      >
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data-URL QR
          <img
            src={qrDataUrl}
            alt="KHQR code"
            width={QR_SIZE}
            height={QR_SIZE}
            style={{
              width: QR_SIZE,
              height: QR_SIZE,
              objectFit: "contain",
              display: "block",
            }}
            draggable={false}
          />
        ) : (
          <div
            className="flex items-center justify-center bg-neutral-100 text-black/40"
            style={{ width: QR_SIZE, height: QR_SIZE, fontSize: 13 }}
          >
            Generating…
          </div>
        )}

        {/* Center mark — matches Bakong USD KHQR badge */}
        {qrDataUrl ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div
              className="flex items-center justify-center rounded-full bg-black"
              style={{ width: 36, height: 36 }}
            >
              <span
                className="font-bold leading-none text-white"
                style={{ fontSize: currency === "KHR" ? 16 : 20 }}
              >
                {badge}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
