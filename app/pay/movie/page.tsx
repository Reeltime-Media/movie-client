"use client";

import { CreditCard, Infinity, ShieldCheck, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CdnImage } from "@/components/ui/CdnImage";
import Image from "next/image";
import { MovieComments } from "@/components/comments/MovieComments";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { OrderSummaryPanel } from "@/components/pay/OrderSummaryPanel";
import { PayPageHero } from "@/components/pay/PayPageHero";
import { TrustPanel } from "@/components/pay/TrustPanel";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { getMovie, listMovies } from "@/lib/api/movies";
import { listPurchases } from "@/lib/api/purchases";
import { createMoviePaymentIntent } from "@/lib/api/payments";
import { posterUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUser } from "@/hooks/auth/use-user";
import { isAdminUser } from "@/lib/auth/is-admin";
import { movieCardHref, movieWatchHref } from "@/lib/movie-routes";
import { moviePaymentSuccessUrl, PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
import { metaPillClassName } from "@/lib/ui/surfaces";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { BannerCard } from "@/components/catalog/BannerCard";
import { PosterScrollRail } from "@/components/catalog/PosterScrollRail";
import { movieToPoster } from "@/lib/api/to-poster";
import type { PosterCardProps } from "@/types/poster-card";
import type { ContentRead, ContentListItemRead } from "@/lib/api/types";

function MoviePayInner() {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = isAdminUser(user);
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  const [movie, setMovie] = useState<ContentRead | null>(null);
  const [topMovies, setTopMovies] = useState<ContentListItemRead[]>([]);
  const [recommendedPosters, setRecommendedPosters] = useState<PosterCardProps[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("Missing movie slug.");
      setLoading(false);
      return;
    }
    
    let cancelled = false;
    const purchasesPromise = loggedIn ? listPurchases().catch(() => []) : Promise.resolve([]);

    Promise.all([getMovie(slug), listMovies(), purchasesPromise])
      .then(([m, all, purchases]) => {
        if (cancelled) return;
        setMovie(m);
        const userOwnedIds = new Set(purchases.map(p => p.content_id));
        setOwnedIds(userOwnedIds);
        
        const others = all.filter((x) => x.slug !== m.slug);
        setTopMovies(others.slice(0, 10));
        setRecommendedPosters(others.slice(10, 22).map((x, i) => movieToPoster(x, i, userOwnedIds, isAdmin)));
        setLoading(false);
      })
      .catch(() => {
        setError("Movie not found.");
        setLoading(false);
      });
  }, [slug, loggedIn, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !movie || !loggedIn) return;
    router.replace(movieWatchHref(movie.slug));
  }, [isAdmin, movie, loggedIn, router]);

  async function handlePay() {
    if (!movie) return;
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(`/pay/movie?slug=${movie.slug}`)}`);
      return;
    }
    setPaying(true);
    setError("");
    try {
      const intent = await createMoviePaymentIntent(
        movie.id,
        moviePaymentSuccessUrl(movie.slug),
      );
      sessionStorage.setItem(PENDING_INTENT_KEY, intent.intent_id);
      window.location.href = safeCheckoutUrl(intent.checkout_url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(msg);
      setPaying(false);
    }
  }

  if (loading) {
    return <CheckoutSpinner fullWidth />;
  }

  if (!movie || (error && !movie)) {
    return (
      <PageShell fullWidth>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6">
          <p className="text-[15px] text-danger">{error || "Something went wrong."}</p>
          <Link
            href="/movies"
            className="text-[13px] font-medium text-text-muted transition-colors hover:text-text"
          >
            ← Back to movies
          </Link>
        </div>
      </PageShell>
    );
  }

  const price = movie.price_usd
    ? `$${parseFloat(movie.price_usd).toFixed(2)}`
    : "$0.00";
  const poster = posterUrl(movie.poster_key);
  const trailerEmbed = youtubeEmbedUrl(movie.trailer_url);

  const banner = posterUrl(movie.banner_key) ?? poster;

  return (
    <PageShell fullWidth>
      {/* 1. Top Section: Trailer & Top 10 */}
      <section className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-8 items-start">
          {/* Left: Trailer */}
          <div className="w-full">
            {trailerEmbed ? (
              <div className="w-full aspect-video overflow-hidden bg-black border border-border">
                <TrailerEmbed embedUrl={trailerEmbed} title={movie.title} variant="frame-only" />
              </div>
            ) : null}
          </div>

          {/* Right: Top 10 Movies */}
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-text mb-4">Top 10 Movies of the Week</h2>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-[min(600px,70vh)] custom-scrollbar pr-2 pb-4">
              {topMovies.map((tm) => {
                const bgImage =
                  posterUrl(tm.banner_key) ?? posterUrl(tm.poster_key) ?? undefined;
                const isFree = !tm.price_usd || parseFloat(tm.price_usd) === 0;
                const isOwned = isFree || ownedIds.has(tm.id) || isAdmin;
                return (
                  <BannerCard
                    key={tm.id}
                    imageSrc={bgImage}
                    title={tm.title}
                    year={tm.release_year}
                    badgeLabel="រឿងកុន"
                    watchHref={movieCardHref(tm, isOwned, isAdmin)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[minmax(0,1fr)_360px]">
          
          {/* Left Column: Overview (Poster + Details) */}
          <div className="flex flex-col md:flex-row gap-8">
            {poster ? (
              <div className="relative aspect-2/3 w-40 shrink-0 overflow-hidden border border-border sm:w-48 md:w-56">
                <CdnImage src={poster} alt={movie.title} fill className="object-cover" sizes="(max-width: 768px) 160px, 224px" />
              </div>
            ) : null}
            
            <div className="flex-1 min-w-0 flex flex-col pt-2">
              <h1 className="text-[32px] font-extrabold tracking-tight text-text sm:text-[40px] leading-[1.1] text-balance">
                {movie.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[13px] font-medium text-text-muted">
                {movie.release_year ? <span>{movie.release_year}</span> : null}
                {movie.runtime ? <span>{movie.runtime}</span> : null}
                {movie.rating ? (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="fill-warning text-warning" aria-hidden />
                    {movie.rating}
                  </span>
                ) : null}
                {movie.genres.length > 0 ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                    <span>{movie.genres.slice(0, 3).join(", ")}</span>
                  </>
                ) : null}
              </div>

              {movie.description ? (
                <p className="mt-6 text-[15px] leading-relaxed text-text-muted md:text-[16px]">
                  {movie.description}
                </p>
              ) : null}
            </div>
          </div>

          {/* Right Column: Payment Box */}
          <div className="sticky top-24 rounded-xl border border-border bg-surface p-6">
            <h2 className="text-[18px] font-bold text-text mb-6">Payment</h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={handlePay}
                disabled={paying}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-brand px-6 py-4 text-[16px] font-bold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying ? "Processing..." : `Buy Now for ${price}`}
              </button>
              <div className="flex flex-col items-center justify-center gap-2 text-[12px] text-text-muted mt-2">
                <span className="flex items-center gap-1.5"><Infinity size={14} /> Lifetime Access</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> Secure checkout</span>
              </div>

              <div className="mt-2 pt-6 border-t border-border flex flex-col items-center">
                <div className="relative aspect-[1/1.1] w-full max-w-[60px] overflow-hidden">
                  <Image src="/asset/payment/khqr.png" alt="KHQR Payment" fill className="object-contain" />
                </div>
                <p className="mt-3 text-[12px] font-medium text-text-muted">Pay with KHQR</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section below the main layout */}
        <div className="mt-16 border-t border-border pt-16">
          <h2 className="text-[24px] font-bold text-text mb-8">Comments</h2>
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
            <MovieComments contentId={movie.id} movieTitle={movie.title} />
          </div>
        </div>

        {/* Recommended Section */}
        {recommendedPosters.length > 0 && (
          <div className="mt-16 border-t border-border pt-16">
            <h2 className="text-[24px] font-bold text-text mb-8">Recommended from Reeltime Media</h2>
            <div className="-mx-4 sm:-mx-6 md:-mx-8">
              <PosterScrollRail posters={recommendedPosters} gutter="sm" autoScroll direction="left" />
            </div>
          </div>
        )}
      </section>

      {/* Mobile sticky pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted">
              Lifetime Access
            </p>
            <p className="text-[19px] font-extrabold leading-none tracking-tight text-text">
              {price}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={paying}
            className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-3.5 text-[14px] font-bold text-white transition-colors duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying ? "Processing…" : "Buy Now"}
          </button>
        </div>
      </div>
      <div className="h-24 sm:hidden" aria-hidden />
    </PageShell>
  );
}

export default function MoviePayPage() {
  return (
    <Suspense fallback={<CheckoutSpinner fullWidth />}>
      <MoviePayInner />
    </Suspense>
  );
}
