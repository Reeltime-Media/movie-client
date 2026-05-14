"use client";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  Eye,
  EyeOff,
  Globe,
  LogOut,
  Pencil,
  ShoppingBag,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { useI18n } from "../components/LocaleProvider";
import { libraryContinuePosters } from "../mock/posters";

const user = {
  name: "Bunkheangheng",
  initial: "K",
  email: "bunkheangheng99@gmail.com",
  memberSince: "January 2025",
  plan: "free" as "free" | "subscribed",
  owned: 3,
  subscribed: 1,
  hoursWatched: 14,
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-[14px] font-bold tracking-[-0.01em]">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-disabled">
          {label}
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-text">{value}</div>
      </div>
      {onEdit ? (
        <button
          onClick={onEdit}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
          aria-label={`Edit ${label}`}
        >
          <Pencil size={13} />
        </button>
      ) : null}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useI18n();
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  return (
    <PageShell wide>
      {/* ── Profile hero ── */}
      <div className="relative">
        {/* Cover banner */}
        <div
          className="cinematic-banner h-32 w-full sm:h-40"
          style={{
            background:
              "linear-gradient(120deg, #1a0508 0%, #3d0c12 40%, #0d1a2e 80%, #0a0a0a 100%)",
          }}
        />

        {/* Avatar */}
        <div className="absolute bottom-0 left-6 translate-y-1/2 md:left-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-bg bg-brand text-[22px] font-black text-white sm:h-20 sm:w-20">
            {user.initial}
          </div>
        </div>
      </div>

      {/* Name + meta row */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-5 pt-12 md:px-8 sm:pt-14">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.02em]">{user.name}</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-text-muted">
            <span>{user.email}</span>
            <span className="text-border-hover">·</span>
            <span>Member since {user.memberSince}</span>
            <span className="text-border-hover">·</span>
            {user.plan === "subscribed" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-success">
                <CheckCircle2 size={12} /> Subscribed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-text-muted">
                Free plan
              </span>
            )}
          </div>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
        >
          <LogOut size={13} /> Sign out
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="mx-6 mb-6 grid grid-cols-3 divide-x divide-border rounded-md border border-border bg-surface md:mx-8">
        <div className="flex flex-col items-center gap-1 px-4 py-4">
          <ShoppingBag size={16} className="text-warning" />
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">{user.owned}</div>
          <div className="text-[11px] font-medium text-text-muted">Owned</div>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-4">
          <CheckCircle2 size={16} className="text-success" />
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">{user.subscribed}</div>
          <div className="text-[11px] font-medium text-text-muted">Subscribed</div>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-4">
          <Clock3 size={16} className="text-text-muted" />
          <div className="text-[20px] font-extrabold tracking-[-0.02em]">{user.hoursWatched}h</div>
          <div className="text-[11px] font-medium text-text-muted">Watched</div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 px-6 md:grid-cols-2 md:px-8">
        {/* Personal info */}
        <SectionCard title="Personal info">
          <div className="divide-y divide-border">
            <FieldRow label="Display name" value={user.name} onEdit={() => {}} />
            <FieldRow label="Email" value={user.email} onEdit={() => {}} />
            <FieldRow label="Member since" value={user.memberSince} />
          </div>
        </SectionCard>

        {/* Subscription */}
        <SectionCard title="Subscription">
          {user.plan === "subscribed" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-warning" />
                <span className="text-[13px] font-bold text-text">Reeltime Premium</span>
                <span className="ml-auto rounded-sm bg-success/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  Active
                </span>
              </div>
              <p className="text-[12px] text-text-muted">Renews on June 10, 2026 · $6.99/mo</p>
              <button className="mt-1 w-full rounded-md border border-border py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text">
                Manage subscription
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px] text-text-muted">
                You&apos;re on the free plan. Subscribe to unlock every series with no per-title fees.
              </p>
              <ul className="space-y-2">
                {["Full series seasons", "No per-title fees", "New episodes weekly"].map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-[12px] text-text-muted">
                    <CheckCircle2 size={13} className="shrink-0 text-success" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link
                href="/pay/subscription"
                className="mt-1 flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                Subscribe · $6.99/mo
              </Link>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Change password ── */}
      <div className="mt-4 px-6 md:px-8">
        <SectionCard title="Change password">
          <form className="grid gap-4 sm:grid-cols-2" action="#" method="post">
            <label className="block">
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Current password</div>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2.5 pr-10 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                  aria-label={showCurrentPw ? "Hide" : "Show"}
                >
                  {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
            <label className="block">
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">New password</div>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  className="w-full rounded-md border border-border bg-bg px-3 py-2.5 pr-10 text-[13px] text-text outline-none transition-colors placeholder:text-text-disabled focus:border-border-hover focus:bg-surface-elevated"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
                  aria-label={showNewPw ? "Hide" : "Show"}
                >
                  {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md border border-border bg-surface px-4 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover hover:bg-surface-elevated"
              >
                Update password
              </button>
            </div>
          </form>
        </SectionCard>
      </div>

      {/* ── Preferences ── */}
      <div className="mt-4 px-6 md:px-8">
        <SectionCard title="Preferences">
          <div className="divide-y divide-border">
            {/* Language */}
            <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
              <div className="flex items-center gap-3">
                <Globe size={15} className="text-text-muted" />
                <div>
                  <div className="text-[13px] font-medium">Language</div>
                  <div className="text-[11px] text-text-muted">English</div>
                </div>
              </div>
              <button className="flex items-center gap-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text">
                Change <ChevronRight size={13} />
              </button>
            </div>

            {/* Video quality */}
            <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
              <div className="flex items-center gap-3">
                <Shield size={15} className="text-text-muted" />
                <div>
                  <div className="text-[13px] font-medium">Video quality</div>
                  <div className="text-[11px] text-text-muted">Auto (recommended)</div>
                </div>
              </div>
              <button className="flex items-center gap-1 text-[12px] font-medium text-text-muted transition-colors hover:text-text">
                Change <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── Continue watching ── */}
      <section className="mt-6 pb-10">
        <div className="px-6 md:px-8">
          <SectionHeader
            title={t("homeContinueWatching")}
            showSeeAll
            seeAllHref="/my-library"
            seeAllLabel={t("sectionSeeAll")}
          />
        </div>
        <PosterScrollRail posters={libraryContinuePosters} />
      </section>

    </PageShell>
  );
}
