import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { PublicLayout } from "@/components/public-shell";
import { api, type SearchResultApi } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search | Global Health Explorer" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [query, setQuery] = useState("");
  const search = useApiQuery(["search", query.trim()], () => api.search(query.trim()));
  const groups: [string, SearchResultApi[]][] = search.data
    ? [
        ["Countries", search.data.countries],
        ["Topics", search.data.topics],
        ["Indicators", search.data.indicators],
        ["Articles", search.data.articles],
        ["Glossary", search.data.glossary],
        ["Datasets", search.data.datasets],
        ["Data sources", search.data.sources],
      ]
    : [];
  return (
    <PublicLayout>
      <main className="page-wrap min-h-[65vh] py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Explore the library
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Search Global Health Explorer</h1>
        <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-xl border border-border bg-card p-3">
          <Search className="ml-2 text-muted-foreground" size={18} />
          <input
            autoFocus
            aria-label="Search countries, topics, indicators, articles, and glossary"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try a country, measure, article, or term"
            className="h-11 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        {!query.trim() ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Search countries, topics, indicators, published articles, glossary terms, datasets, and
            sources.
          </p>
        ) : query.trim().length < 2 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Enter at least two characters to search.
          </p>
        ) : search.isLoading ? (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            Searching…
          </p>
        ) : search.isError ? (
          <p role="alert" className="mt-6 text-sm text-destructive">
            Search is unavailable. Please try again.
          </p>
        ) : (
          <>
            <p className="mt-5 text-sm text-muted-foreground">
              {search.data?.totalResults ?? 0} results across the library
            </p>
            {search.data?.totalResults === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No results found. Try a broader search.
              </p>
            ) : (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {groups.map(([title, items]) => (
                  <ResultGroup key={title} title={title} items={items} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </PublicLayout>
  );
}

function ResultGroup({ title, items }: { title: string; items: SearchResultApi[] }) {
  return (
    <section>
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-2">
        {items.length ? (
          items.map((item) => (
            <a
              key={item.id}
              href={item.url.startsWith("/sources/") ? "/sources" : item.url}
              className="block border-b border-border py-3 text-sm hover:text-primary"
            >
              <strong>{item.title}</strong>
              <span className="mt-1 block text-muted-foreground">{item.description}</span>
            </a>
          ))
        ) : (
          <p className="py-3 text-sm text-muted-foreground">No matches</p>
        )}
      </div>
    </section>
  );
}
