"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { requestPasswordReset } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    setLoading(true);
    try {
      await requestPasswordReset(email);
      // Generic outcome regardless of whether the email matched an account —
      // the API never reveals account existence.
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12 text-text">
      <div className="w-full max-w-95">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[15px] font-black text-white">
            R
          </div>
          <span className="text-[13px] font-black tracking-[0.06em] text-white">REELTIME</span>
        </div>

        {sent ? (
          <div>
            <MailCheck size={28} className="mb-3 text-success" />
            <h1 className={pageTitleClassName}>Check your email</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
              If an account exists for that email, we&apos;ve sent a link to reset your
              password. It expires in 30 minutes.
            </p>
          </div>
        ) : (
          <>
            <h1 className={pageTitleClassName}>Forgot your password?</h1>
            <p className="mt-1.5 text-[13px] text-text-muted">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px] font-medium text-danger">
                {error}
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Email</div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-[13px] text-text-muted">
          <Link href="/login" className="font-semibold text-text transition-colors hover:text-white">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
