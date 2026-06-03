import { Suspense } from "react";
import { WatchPageClient } from "@/components/watch/WatchPageClient";
import { PageShell } from "@/components/layout/PageShell";
import { getMovie } from "@/lib/api/movies";

export const revalidate = 300;

type WatchPageProps = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function WatchPage({ searchParams }: WatchPageProps) {
  const { slug: rawSlug } = await searchParams;
  const slug = rawSlug?.trim() ?? "";

  const initialMovie =
    slug.length > 0 ? await getMovie(slug).catch(() => null) : null;

  return (
    <Suspense
      fallback={
        <PageShell fullWidth>
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
          </div>
        </PageShell>
      }
    >
      <WatchPageClient slug={slug} initialMovie={initialMovie} />
    </Suspense>
  );
}
