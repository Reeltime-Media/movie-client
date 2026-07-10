import { CdnImage } from "@/components/ui/CdnImage";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { CheckoutPayButton } from "@/components/pay/CheckoutPayButton";
import { PaymentBadges } from "@/components/pay/PaymentBadges";

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
  const isRecurring = Boolean(priceSuffix);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-surface-elevated/40 px-5 py-3.5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
          Order summary
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
          <Lock size={12} strokeWidth={2.5} aria-hidden />
          Secure
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3.5">
          {posterSrc ? (
            <div className="relative h-[60px] w-[40px] shrink-0 overflow-hidden ring-1 ring-border">
              <CdnImage src={posterSrc} alt="" fill className="object-cover" sizes="40px" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold text-text">{itemTitle}</p>
            {itemSubtitle ? (
              <p className="mt-0.5 truncate text-[12px] text-text-muted">{itemSubtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-text-muted">{isRecurring ? "Plan" : "Subtotal"}</span>
            <span className="font-medium text-text">
              {price}
              {priceSuffix ? (
                <span className="text-text-muted">{priceSuffix}</span>
              ) : null}
            </span>
          </div>
<div className="flex items-end justify-between border-t border-border pt-3">
            <span className="text-[13px] font-bold uppercase tracking-widest text-text">
              Total {isRecurring ? "due today" : null}
            </span>
            <span className="text-[26px] font-extrabold leading-none tracking-tight text-text">
              {price}
              {priceSuffix ? (
                <span className="text-[13px] font-semibold text-text-muted">{priceSuffix}</span>
              ) : null}
            </span>
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

        <div className="mt-4 flex flex-col items-center gap-2.5 border-t border-border pt-4">
          <PaymentBadges className="justify-center" />
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
