"use client";

import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const perks = [
  "Rent or buy movies to keep forever",
  "Subscribe to unlock full series seasons",
  "Watch on any device, any time",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="relative hidden w-[45%] flex-col justify-between overflow-hidden p-10 lg:flex"
      >
        {/* Background photo — red cinema curtains */}
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1280&q=80')",
          }}
        />
        {/* Dark overlay for text legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 60%, rgba(10,10,10,0.92) 100%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[15px] font-black text-white">
            R
          </div>
          <span className="text-[13px] font-black tracking-[0.06em] text-white">REELTIME</span>
        </div>

        {/* Bottom perks */}
        <div className="relative z-10">
          <p className="text-[24px] font-extrabold leading-tight tracking-tight text-white">
            Join Reeltime today.
          </p>
          <p className="mt-2 text-[13px] text-text-muted">
            Your account unlocks everything.
          </p>
          <ul className="mt-5 space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-[13px] text-text-muted">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-6.5 w-6.5 items-center justify-center rounded-sm bg-brand text-[15px] font-black text-white">
            R
          </div>
          <span className="text-[13px] font-black tracking-[0.06em] text-white">REELTIME</span>
        </div>

        <div className="w-full max-w-95">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em]">Create your account</h1>
          <p className="mt-1.5 text-[13px] text-text-muted">
            Free to join. Rent, own, or subscribe at your pace.
          </p>

          {/* Google SSO */}
          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-md border border-border bg-surface py-2.5 text-[13px] font-semibold text-text transition-colors hover:border-border-hover hover:bg-surface-elevated"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-text-disabled">or continue with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Form */}
          <form className="space-y-4" action="#" method="post">
            <label className="block">
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Display name</div>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
              />
            </label>

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
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Password</div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
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
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Confirm password</div>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
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

            <p className="text-[11px] leading-relaxed text-text-disabled">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-text-muted underline underline-offset-2 hover:text-text">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-text-muted underline underline-offset-2 hover:text-text">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              className="w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-[13px] text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-text transition-colors hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
