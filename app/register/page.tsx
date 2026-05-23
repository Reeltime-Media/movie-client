"use client";

import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { login, register } from "@/lib/api/auth";

const perks = [
  "Rent or buy movies to keep forever",
  "Subscribe to unlock full series seasons",
  "Watch on any device, any time",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const confirm = form.get("confirmPassword") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name || undefined);
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
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
              "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1280&q=80')",
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

          <GoogleSignInButton
            disabled={loading}
            onSuccess={() => router.push("/")}
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
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Display name</div>
              <input
                name="name"
                type="text"
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
              disabled={loading}
              className="w-full rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
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
