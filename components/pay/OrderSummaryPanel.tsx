import Image from "next/image";
import type { ReactNode } from "react";
import { CheckoutPayButton } from "@/components/pay/CheckoutPayButton";

type OrderSummaryPanelProps = {
  itemTitle: string;
  itemSubtitle?: string;
  posterSrc?: string | null;
  price: string;
  priceSuffix?: string;
  totalNote?: string;
  payLabel: string;
  paying: boolean;
  onPay: () => void;
  error?: string;
  footnote?: ReactNode;
};

export function OrderSummaryPanel({
  itemTitle,
  itemSubtitle,
  posterSrc,
  price,
  priceSuffix,
  totalNote,
  payLabel,
  paying,
  onPay,
  error,
  footnote,
}: OrderSummaryPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_16px_48px_-24px_rgba(0,0,0,0.55)]">
      <div className="border-b border-border bg-surface-elevated/50 px-5 py-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">
          Order summary
        </h2>
      </div>

      <div className="p-5">
        <div className="flex gap-3">
          {posterSrc ? (
            <div className="relative h-[72px] w-[48px] shrink-0 overflow-hidden rounded-md ring-1 ring-border">
              <Image src={posterSrc} alt="" fill className="object-cover" sizes="48px" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-text">{itemTitle}</p>
            {itemSubtitle ? (
              <p className="mt-0.5 text-[12px] text-text-muted">{itemSubtitle}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[22px] font-extrabold tracking-tight text-text">{price}</span>
            {priceSuffix ? (
              <span className="block text-[11px] text-text-muted">{priceSuffix}</span>
            ) : null}
          </div>
        </div>

        {totalNote ? (
          <p className="mt-4 text-[12px] leading-relaxed text-text-disabled">{totalNote}</p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-5">
          <CheckoutPayButton label={payLabel} paying={paying} onClick={onPay} />
        </div>

        {footnote ? (
          <p className="mt-3 text-center text-[11px] leading-relaxed text-text-disabled">
            {footnote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
