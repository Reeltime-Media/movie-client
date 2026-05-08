import { PlayCircle } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { PageShell } from "../components/PageShell";

type SearchParams = { title?: string };

export default async function WatchPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const title = sp.title ?? "Movie";

  return (
    <PageShell>
      <PageHeader
        kicker={
          <span className="inline-flex items-center gap-2">
            <PlayCircle size={14} /> PLAYER
          </span>
        }
        title={title}
        description="Placeholder watch page (UI only). Wire this up to your real player once you have streaming."
        action={{ href: "/", label: "Back to home" }}
      />

      <section className="px-6 pb-10 pt-2 md:px-8">
        <div className="aspect-video w-full rounded-[6px] border border-border bg-surface" />
      </section>
    </PageShell>
  );
}

