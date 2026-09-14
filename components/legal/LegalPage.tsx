import { PageShell } from "@/components/layout/PageShell";
import { pageTitleClassName } from "@/lib/ui/page-title";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <PageShell footer>
      <section className="px-6 pb-20 pt-14 md:px-8 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <h1 className={pageTitleClassName}>{document.title}</h1>
          <p className="mt-2 text-[12px] font-medium text-text-disabled">
            Last updated: {document.lastUpdated}
          </p>
          <p className="mt-6 text-[13px] leading-relaxed text-text-muted">{document.intro}</p>

          <div className="mt-10 space-y-10">
            {document.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-[15px] font-bold text-text">
                  {i + 1}. {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph, j) => (
                  <p key={j} className="mt-3 text-[13px] leading-relaxed text-text-muted">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2.5 text-[13px] leading-relaxed text-text-muted"
                      >
                        <span
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-text-disabled"
                          aria-hidden
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
