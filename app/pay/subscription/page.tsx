import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { PageShell } from "../../components/PageShell";

type SearchParams = { title?: string };

function PlanCard({
  label,
  price,
  period,
  highlight = false,
}: {
  label: string;
  price: string;
  period: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[6px] border bg-surface p-4",
        highlight ? "border-brand" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold tracking-[0.12em] text-text-muted">
            {label.toUpperCase()}
          </div>
          <div className="mt-1 text-[18px] font-extrabold text-text">
            {price}
            <span className="ml-2 text-[12px] font-semibold text-text-muted">
              {period}
            </span>
          </div>
        </div>

        {highlight ? (
          <div className="rounded-[3px] bg-brand px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white">
            BEST VALUE
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="mt-4 inline-flex w-full items-center justify-center rounded-[6px] bg-brand px-3 py-[10px] text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
      >
        Subscribe
      </button>
    </div>
  );
}

export default async function SubscriptionPayPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const title = sp.title;

  return (
    <PageShell>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Lock size={14} /> SUBSCRIPTION REQUIRED
          </span>
        }
        title="Subscribe to watch series"
        description={
          <>
            {title ? (
              <>
                You tried to watch{" "}
                <span className="font-semibold text-text">{title}</span>.{" "}
              </>
            ) : null}
            Choose a plan. This is UI only — connect your payment provider later.
          </>
        }
        action={{ href: "/series", label: "Back to series" }}
      />

      <section className="px-6 pb-10 pt-2 md:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <PlanCard label="Weekly" price="$1.99" period="/ week" />
          <PlanCard label="Monthly" price="$5.99" period="/ month" highlight />
          <PlanCard label="3 months" price="$14.99" period="/ 3 months" />
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[6px] border border-border bg-surface p-4">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <ShieldCheck size={14} />
              Cancel anytime
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Your access remains active until the end of your billing period.
            </div>
          </div>
          <div className="rounded-[6px] border border-border bg-surface p-4">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <CreditCard size={14} />
              One checkout
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Set up card payments (or KHQR) when you add backend support.
            </div>
          </div>
          <div className="rounded-[6px] border border-border bg-surface p-4">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <Lock size={14} />
              Unlock full seasons
            </div>
            <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
              Subscribe to watch any series on Reeltime.
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

