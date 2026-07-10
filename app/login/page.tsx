"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { login } from "@/lib/api/auth";
import { safeRedirectPath } from "@/lib/safe-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeRedirectPath(searchParams.get("next"), "/");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    try {
      await login(email, password);
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1280&q=80')",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 60%, rgba(10,10,10,0.92) 100%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[15px] font-black text-white">
            R
          </div>
          <span className="text-[13px] font-black tracking-[0.06em] text-white">REELTIME</span>
        </div>
        <div className="relative z-10">
          <p className="text-[24px] font-extrabold leading-tight tracking-tight text-white">
            Cambodia&apos;s home<br />for cinema.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
            Stream thousands of movies and series — rent, own, or subscribe.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[15px] font-black text-white">
            R
          </div>
          <span className="text-[13px] font-black tracking-[0.06em] text-white">REELTIME</span>
        </div>

        <div className="w-full max-w-95">
          <h1 className={pageTitleClassName}>Welcome back</h1>
          <p className="mt-1.5 text-[13px] text-text-muted">
            Sign in to your Reeltime account to continue.
          </p>

          <GoogleSignInButton
            disabled={loading}
            onSuccess={() => router.push(nextPath)}
            onError={setError}
          />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-text-disabled">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {error && (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-[12px] font-medium text-danger">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
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

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-text-muted">Password</span>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-medium text-text-muted transition-colors hover:text-text"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
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

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-[13px] text-text-muted">
            New to Reeltime?{" "}
            <Link href="/register" className="font-semibold text-text transition-colors hover:text-white">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg text-text-muted">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
