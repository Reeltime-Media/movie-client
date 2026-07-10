"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { resetPassword } from "@/lib/api/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing its token. Request a new one.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirmPassword") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
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

        {done ? (
          <div>
            <h1 className={pageTitleClassName}>Password updated</h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-5 w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <>
            <h1 className={pageTitleClassName}>Choose a new password</h1>
            <p className="mt-1.5 text-[13px] text-text-muted">
              Enter and confirm your new password below.
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px] font-medium text-danger">
                {error}
              </div>
            )}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <div className="mb-1.5 text-[12px] font-semibold text-text-muted">
                  New password
                </div>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Create a new password"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 pr-10 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              <label className="block">
                <div className="mb-1.5 text-[12px] font-semibold text-text-muted">
                  Confirm password
                </div>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2.5 pr-10 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
              >
                {loading ? "Resetting…" : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
