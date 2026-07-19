"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckoutSpinner } from "@/components/pay/CheckoutSpinner";
import { movieWatchHref } from "@/lib/movie-routes";

/**
 * Legacy movie checkout URL. Movie pay now happens inline (flip card / watch
 * page Bakong modal). Keep this route so old bookmarks and shared links still
 * land somewhere useful.
 */
function MoviePayRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const slug = params.get("slug")?.trim();
    router.replace(slug ? movieWatchHref(slug) : "/movies");
  }, [router, params]);

  return <CheckoutSpinner />;
}

export default function MoviePayPage() {
  return (
    <Suspense fallback={<CheckoutSpinner />}>
      <MoviePayRedirect />
    </Suspense>
  );
}
