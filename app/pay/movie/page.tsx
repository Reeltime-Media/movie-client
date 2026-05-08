import { CreditCard, Film, Infinity, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/PageHeader";
import { PageShell } from "../../components/PageShell";

type SearchParams = { title?: string; price?: string };

export default async function MoviePayPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const title = sp.title ?? "Movie";
  const price = sp.price ?? "$0.00";

  return (
    <PageShell>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <Film size={14} /> ONE-OFF PURCHASE
          </span>
        }
        title="Buy once, watch forever"
        description={
          <>
            You’re purchasing <span className="font-semibold text-text">{title}</span>.
            {" "}This is UI only — connect your payment provider later.
          </>
        }
        action={{ href: "/movies", label: "Back to movies" }}
      />

      <section className="px-6 pb-10 pt-2 md:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-[6px] border border-brand bg-surface p-5 md:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[12px] font-semibold tracking-[0.12em] text-text-muted">
                  TOTAL
                </div>
                <div className="mt-1 text-[26px] font-extrabold text-text">
                  {price}
                </div>
                <div className="mt-2 text-[13px] text-text-muted">
                  Lifetime access to this movie on your account.
                </div>
              </div>
              <div className="rounded-[3px] bg-brand px-2 py-1 text-[10px] font-bold tracking-[0.12em] text-white">
                BUY ONCE
              </div>
            </div>

            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center rounded-[6px] bg-brand px-3 py-[10px] text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Pay now
            </button>
          </div>

          <div className="rounded-[6px] border border-border bg-surface p-5">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
                <Infinity size={14} />
                Watch anytime
              </div>
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
                <ShieldCheck size={14} />
                Secure checkout
              </div>
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-text-muted">
                <CreditCard size={14} />
                Card / KHQR ready
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-[6px] border border-border bg-surface p-5">
          <div className="text-[12px] font-semibold tracking-[0.12em] text-text-muted">
            NOTE
          </div>
          <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
            When you implement real payments, store an “owned” entitlement for the
            user + movie id. Then keep the CTA as “Watch now” for both owned and
            unowned movies, while showing the price only when it’s unowned.
          </div>
        </div>
      </section>
    </PageShell>
  );
}

