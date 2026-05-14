"use client";

import { Check, Layers, ListVideo, Lock, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { PageSearchBar } from "../components/PageSearchBar";
import { PageShell } from "../components/PageShell";
import { PosterScrollRail } from "../components/PosterScrollRail";
import { SectionHeader } from "../components/SectionHeader";
import { seriesPopularPosters, seriesSubscribePosters } from "../mock/posters";

const genres = ["All", "Drama", "Thriller", "Sci-Fi", "Comedy", "Crime", "Action"];

export default function SeriesPage() {
  const [activeGenre, setActiveGenre] = useState("All");

  return (
    <PageShell wide>
      {/* Page intro — depth + hierarchy */}
      <div className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="rt-series-hero-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_0%_-20%,rgba(229,9,20,0.18),transparent_50%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-surface/40 to-transparent" />
        <div className="relative px-6 pb-6 pt-8 md:px-8 md:pb-7 md:pt-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className="rt-series-fade-up mb-3 inline-flex items-center gap-2 rounded-sm border border-border bg-surface/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted backdrop-blur-sm"
                style={{ "--rt-enter-delay": "0ms" } as CSSProperties}
              >
                <Layers size={12} className="text-brand" strokeWidth={2.5} aria-hidden />
                Series
              </div>
              <h1
                className="rt-series-fade-up text-balance text-[clamp(1.625rem,3.5vw,2.125rem)] font-extrabold leading-[1.08] tracking-tight text-text"
                style={{ "--rt-enter-delay": "55ms" } as CSSProperties}
              >
                Full seasons, any time
              </h1>
              <p
                className="rt-series-fade-up mt-2.5 max-w-lg text-[13px] leading-relaxed text-text-muted"
                style={{ "--rt-enter-delay": "110ms" } as CSSProperties}
              >
                Originals, licensed hits, and complete seasons—stream on your schedule with a subscription or
                pick individual shows to own.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                className="rt-series-fade-up inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-border-hover hover:text-text active:translate-y-0"
                style={{ "--rt-enter-delay": "160ms" } as CSSProperties}
              >
                <Sparkles size={14} strokeWidth={2} aria-hidden />
                New this week
              </button>
              <button
                type="button"
                className="rt-series-fade-up inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-muted transition-[transform,colors,border-color] duration-200 ease-out hover:-translate-y-px hover:border-border-hover hover:text-text active:translate-y-0"
                style={{ "--rt-enter-delay": "200ms" } as CSSProperties}
              >
                <ListVideo size={14} strokeWidth={2} aria-hidden />
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Genre filter — segmented control */}
      <div
        className="rt-series-fade-in border-b border-border bg-bg px-6 py-3 md:px-8"
        style={{ "--rt-enter-delay": "240ms" } as CSSProperties}
      >
        <div
          className="flex max-w-full items-center gap-1 overflow-x-auto rounded-md border border-border bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter by genre"
        >
          {genres.map((g, i) => {
            const selected = g === activeGenre;
            return (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveGenre(g)}
                className={[
                  "rt-series-fade-up shrink-0 rounded-sm px-3.5 py-2 text-[12px] font-semibold transition-[transform,colors,background-color] duration-200 ease-out",
                  selected
                    ? "bg-brand text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text active:scale-[0.98]",
                ].join(" ")}
                style={{ "--rt-enter-delay": `${280 + i * 40}ms` } as CSSProperties}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search toolbar */}
      <div
        className="rt-series-fade-up border-b border-border px-6 py-4 md:px-8"
        style={{ "--rt-enter-delay": "320ms" } as CSSProperties}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageSearchBar label="Search series" placeholder="Search series by title or genre" />
          <div className="flex shrink-0 items-center gap-2 text-[12px] text-text-muted">
            <span className="hidden sm:inline">Sort</span>
            <span className="rounded-md border border-border bg-surface px-2.5 py-1.5 font-medium text-text transition-colors duration-200">
              Popular
            </span>
          </div>
        </div>
      </div>

      {/* Subscription upsell — cinematic tokens in light mode */}
      <div
        className="cinematic-banner rt-series-fade-up mx-6 mt-6 overflow-hidden rounded-md border border-border bg-surface-elevated md:mx-8"
        style={{ "--rt-enter-delay": "380ms" } as CSSProperties}
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <div className="h-1 w-full shrink-0 bg-brand sm:h-auto sm:w-1" />
          <div className="flex flex-1 flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand/15 ring-1 ring-brand/25">
                <Lock className="text-brand" size={18} strokeWidth={2} aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold leading-snug tracking-[-0.01em] text-text">
                  Unlock every series
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                  Full seasons, no per-title fees. Subscribe for <span className="font-semibold text-text">$6.99/mo</span>
                  .
                </p>
                <ul className="mt-3 flex flex-col gap-1.5 text-[11px] font-medium text-text-muted sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-1">
                  {["HD streaming", "Cancel anytime", "Offline downloads"].map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      <Check size={13} className="shrink-0 text-success" strokeWidth={2.5} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href="/pay/subscription"
                className="inline-flex items-center justify-center rounded-md bg-brand px-4 py-2.5 text-[12px] font-bold text-white transition-[transform,colors] duration-200 ease-out hover:bg-brand-hover hover:-translate-y-px active:translate-y-0 sm:py-2"
              >
                Subscribe
              </a>
              <a
                href="/pay/subscription"
                className="inline-flex items-center justify-center rounded-md border border-border bg-transparent px-4 py-2.5 text-[12px] font-semibold text-text transition-[transform,colors,border-color,background-color] duration-200 ease-out hover:border-border-hover hover:bg-surface hover:-translate-y-px active:translate-y-0 sm:py-2"
              >
                View plans
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribe to unlock rail */}
      <section
        className="rt-series-fade-up pb-8 pt-8"
        style={{ "--rt-enter-delay": "420ms" } as CSSProperties}
      >
        <div className="space-y-1 px-6 md:px-8">
          <SectionHeader title="Series · Subscribe to unlock" />
          <p className="text-[12px] font-medium text-text-muted">Included with Reeltime subscription</p>
        </div>
        <PosterScrollRail posters={seriesSubscribePosters} imagePriorityCount={2} />
      </section>

      {/* Popular right now rail */}
      <section
        className="rt-series-fade-up pb-12 pt-2"
        style={{ "--rt-enter-delay": "480ms" } as CSSProperties}
      >
        <div className="space-y-1 px-6 md:px-8">
          <SectionHeader title="Popular right now" showSeeAll />
          <p className="text-[12px] font-medium text-text-muted">Trending with viewers in Cambodia</p>
        </div>
        <PosterScrollRail posters={seriesPopularPosters} />
      </section>
    </PageShell>
  );
}
