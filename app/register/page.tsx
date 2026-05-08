import Link from "next/link";
import { PageShell } from "../components/PageShell";

export default function RegisterPage() {
  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] rounded-[6px] border border-border bg-surface p-6">
          <h1 className="text-[20px] font-extrabold tracking-[-0.02em]">
            Create your account
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
            UI only. Hook up registration when your backend is ready.
          </p>

          <form className="mt-6 space-y-4" action="#" method="post">
            <label className="block">
              <div className="text-[12px] font-semibold text-text-muted">
                Display name
              </div>
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                className="mt-2 w-full rounded-[6px] border border-border bg-bg px-3 py-[10px] text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover"
              />
            </label>

            <label className="block">
              <div className="text-[12px] font-semibold text-text-muted">
                Email
              </div>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-[6px] border border-border bg-bg px-3 py-[10px] text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover"
              />
            </label>

            <label className="block">
              <div className="text-[12px] font-semibold text-text-muted">
                Password
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Create a password"
                className="mt-2 w-full rounded-[6px] border border-border bg-bg px-3 py-[10px] text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover"
              />
            </label>

            <label className="block">
              <div className="text-[12px] font-semibold text-text-muted">
                Confirm password
              </div>
              <input
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="mt-2 w-full rounded-[6px] border border-border bg-bg px-3 py-[10px] text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover"
              />
            </label>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-[6px] bg-brand px-4 py-[10px] text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Create account
            </button>
          </form>

          <div className="mt-5 text-[13px] text-text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-text transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

