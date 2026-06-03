"use client";

import { CreditCard, Film, Infinity, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { TrailerEmbed } from "@/components/shared/TrailerEmbed";
import { getMovie } from "@/lib/api/movies";
import { createMoviePaymentIntent } from "@/lib/api/payments";
import { posterUrl } from "@/lib/api/client";
import { useAuth } from "@/hooks/auth/use-auth";
import { moviePaymentSuccessUrl, PENDING_INTENT_KEY } from "@/lib/payment-success-urls";
import { safeCheckoutUrl } from "@/lib/safe-redirect";
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
    return (
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    );
  }

  if (!movie || error) {
    return (
      <PageShell fullWidth>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-[14px] text-danger">{error || "Something went wrong."}</p>
          <Link href="/movies" className="text-[13px] text-text-muted hover:text-text">
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

  return (
    <PageShell fullWidth>
      {/* Kicker */}
      <div className="box-border ml-[calc(50%-50vw)] w-screen max-w-none px-6 pt-8 md:px-10 lg:px-12">
        <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          <Film size={13} />
          One-off purchase
        </div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-text md:text-[34px]">
          Buy once, watch forever
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
          You&apos;re purchasing{" "}
          <span className="font-semibold text-text">{movie.title}</span>.
          Lifetime access on your account.
        </p>
      </div>

      <section className="box-border ml-[calc(50%-50vw)] w-screen max-w-none px-6 pb-10 pt-6 md:px-10 lg:px-12">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Main checkout card */}
          <div className="rounded-md border border-brand bg-surface p-5 md:col-span-2">
            <div className="flex gap-4">
              {/* Poster thumbnail */}
              {poster && (
                <div className="relative h-27 w-18 shrink-0 overflow-hidden rounded-sm border border-border">
                  <Image src={poster} alt={movie.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-[16px] font-bold text-text">{movie.title}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-muted">
                  {movie.release_year && <span>{movie.release_year}</span>}
                  {movie.runtime && <><span className="text-border">·</span><span>{movie.runtime}</span></>}
                  {movie.rating && (
                    <>
                      <span className="text-border">·</span>
                      <span className="inline-flex items-center gap-1">
                        <Star size={11} className="fill-warning text-warning" />
                        {movie.rating}
                      </span>
                    </>
                  )}
                </div>
                {movie.genres.length > 0 && (
                  <div className="mt-1 text-[11px] text-text-muted">
                    {movie.genres.join(" · ")}
                  </div>
                )}
                {movie.description ? (
                  <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
                    {movie.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">
                  Total
                </span>
                <span className="text-[28px] font-extrabold tracking-[-0.02em] text-text">
                  {price}
                </span>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-[12px] text-danger">{error}</p>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={paying}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-brand px-3 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Redirecting to checkout…
                </span>
              ) : (
                `Pay ${price}`
              )}
            </button>

            <p className="mt-3 text-center text-[11px] text-text-disabled">
              You will be redirected to our secure payment partner to complete the transaction.
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <Infinity size={14} className="shrink-0" />
              Watch anytime, forever
            </div>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <ShieldCheck size={14} className="shrink-0" />
              Secure checkout via Baray
            </div>
            <div className="flex items-center gap-2 text-[12px] font-semibold text-text-muted">
              <CreditCard size={14} className="shrink-0" />
              Card · KHQR · ABA Pay
            </div>
            <div className="mt-auto border-t border-border pt-3">
              <Link
                href="/movies"
                className="text-[12px] text-text-muted transition-colors hover:text-text"
              >
                ← Back to movies
              </Link>
            </div>
          </div>
        </div>

        {trailerEmbed && (
          <TrailerEmbed embedUrl={trailerEmbed} title={movie.title} />
        )}
      </section>
    </PageShell>
  );
}

export default function MoviePayPage() {
  return (
    <Suspense fallback={
      <PageShell fullWidth>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      </PageShell>
    }>
      <MoviePayInner />
    </Suspense>
  );
}
