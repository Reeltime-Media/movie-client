"use client";

import {
  Check,
  CheckCircle2,
  ChevronRight,
  Crown,
  Eye,
  EyeOff,
  Globe,
  LogOut,
  Pencil,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/components/providers/LocaleProvider";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { pageTitleClassName } from "@/lib/ui/page-title";
import { getMe, updateMe } from "@/lib/api/auth";
import { saveUserSnapshot } from "@/lib/user-session";
import { findPlanTier } from "@/lib/pricing-tiers";
import { listMySubscriptions } from "@/lib/api/subscriptions";
import { listWatchProgress } from "@/lib/api/playback";
import { useAuth } from "@/hooks/auth/use-auth";
import { clearToken } from "@/lib/auth/token";
import type { UserRead, SubscriptionRead, WatchProgressRead } from "@/lib/api/types";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
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
        <div className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled">
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

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatRenewalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { loggedIn } = useAuth();

  const [user, setUser] = useState<UserRead | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRead[]>([]);
  const [watchProgress, setWatchProgress] = useState<WatchProgressRead[]>([]);
  const [loading, setLoading] = useState(true);

  // name edit state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // password form state
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      router.replace("/login");
      return;
    }
    Promise.all([
      getMe(),
      listMySubscriptions().catch(() => [] as SubscriptionRead[]),
      listWatchProgress().catch(() => [] as WatchProgressRead[]),
    ]).then(([me, subs, progress]) => {
      setUser(me);
      saveUserSnapshot(me);
      setSubscriptions(subs);
      setWatchProgress(progress);
      setLoading(false);
    }).catch(() => {
      clearToken();
      router.replace("/login");
    });
  }, [router, loggedIn]);

  useEffect(() => {
    if (editingName && nameRef.current) nameRef.current.focus();
  }, [editingName]);

  const activeSub = subscriptions.find((s) => s.status === "active");
  const planTier = activeSub ? findPlanTier(activeSub.plan) : undefined;

  async function handleSaveName() {
    if (!nameInput.trim() || !user) return;
    setNameSaving(true);
    try {
      const updated = await updateMe({ full_name: nameInput.trim() });
      setUser(updated);
      setEditingName(false);
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);
    if (!newPw.trim()) { setPwError("New password is required."); return; }
    if (newPw.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    setPwSaving(true);
    try {
      await updateMe({ password: newPw });
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
    } catch {
      setPwError("Failed to update password. Please try again.");
    } finally {
      setPwSaving(false);
    }
  }

  function handleSignOut() {
    clearToken();
    router.push("/login");
  }

  if (loading) {
    return (
      <PageShell wide>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (!user) return null;

  return (
    <PageShell wide>
      {/* ── Profile header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pb-8 pt-10 md:px-8">
        <div className="flex flex-col items-start gap-3">
          <UserAvatar
            name={user.full_name}
            email={user.email}
            avatarUrl={user.avatar_url}
            size="lg"
          />
          <div>
            <h1 className={`${pageTitleClassName} uppercase`}>
              {user.full_name ?? user.email}
            </h1>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-text-muted">
              <span>{user.email}</span>
              <span className="text-border-hover">·</span>
              <span>Member since {formatMemberSince(user.created_at)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-colors hover:border-border-hover hover:text-text"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-4 px-6 md:grid-cols-2 md:px-8">
        {/* Personal info */}
        <SectionCard title="Personal info">
          <div className="divide-y divide-border">
            {editingName ? (
              <div className="flex items-center gap-2 py-3 first:pt-0">
                <div className="flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-text-disabled mb-1">
                    Display name
                  </div>
                  <input
                    ref={nameRef}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none transition-colors focus:border-border-hover"
                  />
                </div>
                <div className="flex shrink-0 gap-2 pt-5">
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {nameSaving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-text-muted transition-colors hover:text-text"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <FieldRow
                label="Display name"
                value={user.full_name ?? "—"}
                onEdit={() => {
                  setNameInput(user.full_name ?? "");
                  setEditingName(true);
                }}
              />
            )}
            <FieldRow label="Email" value={user.email} />
            <FieldRow label="Bank account name" value={user.full_name ?? "—"} />
            <FieldRow label="Bank account number" value="—" />
            <FieldRow label="Member since" value={formatMemberSince(user.created_at)} />
          </div>
        </SectionCard>

        {/* Current plan */}
        <SectionCard title="Current Plan">
          {activeSub ? (
            <div
              className="cinematic-banner -mx-5 -my-4 space-y-3 rounded-b-md p-5"
              style={{
                background:
                  "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 22px, rgba(0,0,0,0.35) 22px, rgba(0,0,0,0.35) 26px), linear-gradient(120deg, #1a0508 0%, #3d0c12 40%, #0d1a2e 80%, #0a0a0a 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-warning" />
                <span className="text-[13px] font-bold text-text">
                  {planTier ? `${t(planTier.nameKey)} Plan` : "Member Plan"}
                </span>
                <span className="ml-auto rounded-sm bg-success/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                  Active
                </span>
              </div>
              {planTier ? (
                <div className="text-[24px] font-extrabold tracking-[-0.02em] text-text">
                  ${planTier.price}
                  <span className="text-[13px] font-semibold text-text-muted">
                    /{t(planTier.bulletKeys[0])}
                  </span>
                </div>
              ) : null}
              <p className="text-[12px] text-text-muted">
                Expire : {formatRenewalDate(activeSub.current_period_end)}
              </p>
              {planTier ? (
                <ul className="space-y-1.5 border-t border-border pt-3">
                  {planTier.bulletKeys.map((bulletKey) => (
                    <li
                      key={bulletKey}
                      className="flex items-center gap-2 text-[12px] text-text-muted"
                    >
                      <Check size={13} className="shrink-0 text-success" />
                      {t(bulletKey)}
                    </li>
                  ))}
                </ul>
              ) : null}
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
                href="/pricing"
                className="mt-1 flex w-full items-center justify-center rounded-md bg-brand py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover"
              >
                Subscribe · $6.99/mo
              </Link>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Password ── */}
      <div className="mt-4 px-6 md:px-8">
        <SectionCard title={user.has_password ? "Change password" : "Set a password"}>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleChangePassword}>
            {user.has_password && (
              <label className="block">
                <div className="mb-1.5 text-[12px] font-semibold text-text-muted">Current password</div>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
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
            )}
            <label className={`block ${user.has_password ? "" : "sm:col-span-2"}`}>
              <div className="mb-1.5 text-[12px] font-semibold text-text-muted">New password</div>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
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
            <div className="flex items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={pwSaving}
                className="rounded-md border border-border bg-surface px-4 py-2 text-[12px] font-semibold text-text transition-colors hover:border-border-hover hover:bg-surface-elevated disabled:opacity-50"
              >
                {pwSaving ? "Updating…" : "Update password"}
              </button>
              {pwError && <span className="text-[12px] text-danger">{pwError}</span>}
              {pwSuccess && <span className="text-[12px] text-success">Password updated.</span>}
            </div>
          </form>
        </SectionCard>
      </div>

      {/* ── Preferences ── */}
      {/* <div className="mt-4 px-6 md:px-8">
        <SectionCard title="Preferences">
          <div className="divide-y divide-border">
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
      </div> */}

      {/* ── Continue watching ── */}
      {watchProgress.length > 0 && (
        <section className="mt-6 pb-10">
          <div className="px-6 md:px-8">
            <SectionHeader
              title={t("homeContinueWatching")}
              showSeeAll
              seeAllHref="/my-library"
              seeAllLabel={t("sectionSeeAll")}
            />
          </div>
          <PosterScrollRail posters={[]} />
        </section>
      )}
    </PageShell>
  );
}
