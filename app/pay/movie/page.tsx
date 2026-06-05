"use client";

import { CreditCard, Film, Infinity, ShieldCheck, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { MovieComments } from "@/components/comments/MovieComments";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { OrderSummaryPanel } from "@/components/pay/OrderSummaryPanel";
import { PayPageHero } from "@/components/pay/PayPageHero";
import { TrustPanel } from "@/components/pay/TrustPanel";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { getMovie } from "@/lib/api/movies";
import { createMoviePaymentIntent } from "@/lib/api/payments";
import { posterUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/use-auth";
import { moviePaymentSuccessUrl, PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
import { metaPillClassName } from "@/lib/ui/surfaces";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { ContentRead } from "@/lib/api/types";

function MoviePayInner() {
  const router = useRouter();
  const { loggedIn } = useAuth();
  const params = useSearchParams();
  const slug = params.get("slug") ?? "";

  const [movie, setMovie] = useState<ContentRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("Missing movie slug.");
      setLoading(false);
      return;
    }
    getMovie(slug)
      .then((m) => {
        setMovie(m);
        setLoading(false);
      })
      .catch(() => {
        setError("Movie not found.");
        setLoading(false);
      });
  }, [slug]);

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

  const sidebar = (
    <>
      <OrderSummaryPanel
        itemTitle={movie.title}
        itemSubtitle="Lifetime access · one-time purchase"
        posterSrc={poster}
        price={price}
        totalNote="No subscription. Watch forever on your account."
        payLabel={`Pay ${price}`}
        paying={paying}
        onPay={handlePay}
        error={error || undefined}
        footnote={null}
      />
      <TrustPanel
        items={[
          { icon: Infinity, label: "Watch anytime, forever" },
          { icon: ShieldCheck, label: "Secure checkout via Baray" },
          { icon: CreditCard, label: "Card · KHQR · ABA Pay" },
        ]}
        backHref="/movies"
        backLabel="Back to movies"
      />
    </>
  );

  return (
    <PageShell fullWidth>
      <PayPageHero
        badgeIcon={Film}
        badgeLabel="One-off purchase"
        title="Buy once, watch forever"
        subtitle={
          <>
            Own <span className="font-semibold text-white">{movie.title}</span> and stream it
            anytime on any device.
          </>
        }
        posterKey={movie.poster_key}
        meta={
          <>
            {movie.release_year ? (
              <span className={metaPillClassName}>{movie.release_year}</span>
            ) : null}
            {movie.runtime ? (
              <span className={metaPillClassName}>{movie.runtime}</span>
            ) : null}
            {movie.rating ? (
              <span className={metaPillClassName}>
                <Star size={12} className="fill-warning text-warning" aria-hidden />
                {movie.rating}
              </span>
            ) : null}
            {movie.genres.slice(0, 3).map((genre) => (
              <span key={genre} className={metaPillClassName}>
                {genre}
              </span>
            ))}
          </>
        }
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="min-w-0 space-y-6">
            {trailerEmbed ? (
              <TrailerEmbed embedUrl={trailerEmbed} title={movie.title} variant="bare" />
            ) : null}

            {movie.description ? (
              <div>
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-muted">
                  About this film
                </p>
                <p className="max-w-3xl text-[15px] leading-[1.7] text-text-muted">
                  {movie.description}
                </p>
              </div>
            ) : null}

            {loggedIn ? (
              <MovieComments contentId={movie.id} movieTitle={movie.title} />
            ) : (
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-[13px] leading-relaxed text-text-muted">
                  Sign in to join the discussion and share your thoughts on this film.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/pay/movie?slug=${movie.slug}`)}`}
                  className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-brand-hover"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            {sidebar}
          </div>
        </div>
      </section>

      {/* Mobile sticky pay bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 p-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={handlePay}
          disabled={paying}
          className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-brand px-4 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(229,9,20,0.55)] disabled:opacity-60"
        >
          {paying ? "Redirecting…" : `Pay ${price}`}
        </button>
      </div>
      <div className="h-20 lg:hidden" aria-hidden />
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
