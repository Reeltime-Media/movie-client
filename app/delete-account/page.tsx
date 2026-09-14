"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/auth/use-user";
import { PageShell } from "@/components/layout/PageShell";
import { pageTitleClassName } from "@/lib/ui/page-title";

const SUPPORT_EMAIL = "support@reeltime.com";

function buildDeletionMailto(email: string | null): string {
  const subject = encodeURIComponent("Delete my Reeltime account");
  const body = encodeURIComponent(
    `Please delete my Reeltime account and associated data.\n\nAccount email: ${
      email ?? "[enter your account email]"
    }`,
  );
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

const DELETED_ITEMS = [
  "Your profile (name, email, password, avatar)",
  "Your watch history, watch progress, and library/favorites",
  "Comments you've posted",
  "Any devices linked to your account",
];

export default function DeleteAccountPage() {
  // refreshIfMissing: false — this page must render the same instructions for a
  // signed-out visitor (incl. an app-store reviewer) as for a signed-in user.
  const { user } = useUser({ refreshIfMissing: false });

  return (
    <PageShell footer>
      <section className="px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-2xl">
          <h1 className={pageTitleClassName}>Delete your account</h1>
          <p className="mt-4 text-[13px] leading-relaxed text-text-muted">
            You can ask us to delete your Reeltime account and the personal data
            associated with it at any time, whether or not you&apos;re currently signed
            in. Follow the steps below to submit a request.
          </p>

          <div className="mt-8 rounded-xl border border-border bg-surface p-5 md:p-6">
            <h2 className="text-[14px] font-bold text-text">How to request deletion</h2>
            <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[13px] leading-relaxed text-text-muted">
              <li>
                Email <span className="text-text">{SUPPORT_EMAIL}</span> from the address
                on your Reeltime account, or include that email address in your message.
              </li>
              <li>Use the subject line &quot;Delete my account&quot; so we can route your request quickly.</li>
              {/* 30-day SLA is a placeholder default — confirm the real turnaround with the business before publishing. */}
              <li>We verify the request and delete your account within 30 days.</li>
            </ol>

            {user?.email ? (
              <p className="mt-4 text-[12px] text-text-disabled">
                Signed in as <span className="text-text-muted">{user.email}</span>
              </p>
            ) : null}

            <a
              href={buildDeletionMailto(user?.email ?? null)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <Mail size={15} aria-hidden />
              Request account deletion
            </a>
          </div>

          <div className="mt-10">
            <h2 className="text-[14px] font-bold text-text">What gets deleted</h2>
            <ul className="mt-3 space-y-2">
              {DELETED_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-muted"
                >
                  <span
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-disabled"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="text-[14px] font-bold text-text">What we retain, and why</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
              We keep records of completed purchases and payments (made via KHQR/Bakong)
              for a limited period after deletion, as required for accounting, tax, and
              legal compliance, and to prevent fraud. These records aren&apos;t used for
              any other purpose and are deleted or anonymized once that retention period
              ends.
            </p>
          </div>

          <p className="mt-10 text-[12px] leading-relaxed text-text-muted">
            For full detail on how we collect, use, and protect your data, see our{" "}
            <Link
              href="/privacy-policy"
              className="text-text-muted underline underline-offset-2 hover:text-text"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
