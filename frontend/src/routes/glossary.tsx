import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { PublicLayout } from "@/components/public-shell";
import { topics } from "@/data/health";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";

export const Route = createFileRoute("/glossary")({
  head: () => ({ meta: [{ title: "Health Glossary | Global Health Explorer" }] }),
  component: GlossaryPage,
});

function GlossaryPage() {
  const [query, setQuery] = useState("");
  const glossaryQuery = useApiQuery(["glossary", query], () =>
    api.glossary({ ...(query ? { q: query } : {}), size: 100 }),
  );
  const articleQuery = useApiQuery(["articles", "glossary-related"], () =>
    api.articles({ size: 100 }),
  );
  const filtered = glossaryQuery.data?.content ?? [];
  const articles = articleQuery.data?.content ?? [];
  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Plain-language reference
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Health glossary</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Clear definitions for terms that appear in health research and data. Follow the source
          links for exact definitions and context.
        </p>
        <label className="mt-7 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <Search className="ml-2 text-muted-foreground" size={18} />
          <input
            aria-label="Search glossary"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search terms and definitions"
            className="h-10 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        {glossaryQuery.isLoading ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            Loading glossary…
          </p>
        ) : glossaryQuery.isError ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Glossary terms could not be loaded.
          </p>
        ) : null}
        <div className="mt-8 divide-y divide-border border-y border-border">
          {filtered.map((term) => (
            <article id={term.slug} key={term.id} className="py-6">
              <h2 className="font-display text-xl font-bold">{term.term}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
                {term.definition}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                {term.relatedTopicSlugs.map((slug) => {
                  const topic = topics.find((item) => item.slug === slug);
                  return topic ? (
                    <Link
                      key={slug}
                      to="/topics/$slug"
                      params={{ slug }}
                      className="text-xs font-semibold text-primary"
                    >
                      {topic.title}
                    </Link>
                  ) : null;
                })}
                {(term.relatedArticleSlugs ?? []).map((slug) => {
                  const article = articles.find((item) => item.slug === slug);
                  return article ? (
                    <Link
                      key={slug}
                      to="/articles/$slug"
                      params={{ slug }}
                      className="text-xs font-semibold text-primary"
                    >
                      Read: {article.title}
                    </Link>
                  ) : null;
                })}
                {(term.relatedIndicatorIds ?? []).map((id) => {
                  const match = topics
                    .flatMap((topic) => topic.indicators.map((indicator) => ({ topic, indicator })))
                    .find((entry) => entry.indicator.id === id);
                  return match ? (
                    <Link
                      key={id}
                      to="/topics/$slug"
                      params={{ slug: match.topic.slug }}
                      className="text-xs font-semibold text-primary"
                    >
                      Indicator: {match.indicator.name}
                    </Link>
                  ) : null;
                })}
                {term.references.map((ref) => (
                  <a
                    key={ref.url}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    href={ref.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {ref.label}
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
        {glossaryQuery.isSuccess && !filtered.length && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No matching terms. Try a different word.
          </p>
        )}
      </main>
    </PublicLayout>
  );
}
