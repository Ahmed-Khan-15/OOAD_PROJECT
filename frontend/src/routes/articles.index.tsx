import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText } from "lucide-react";
import { PublicLayout } from "@/components/public-shell";
import { articleCategories } from "@/data/publication-data";
import { useState } from "react";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "Articles | Global Health Explorer" },
      {
        name: "description",
        content:
          "Plain-language health explainers, research summaries, insights, and data stories.",
      },
    ],
  }),
  component: ArticlesPage,
});

function ArticlesPage() {
  const [category, setCategory] = useState<string>("All articles");
  const results = useApiQuery(["articles", category], () =>
    api.articles({
      ...(category === "All articles"
        ? {}
        : { category: category.toLowerCase().replaceAll(" ", "-") }),
      size: 100,
    }),
  );
  const visible = results.data?.content ?? [];
  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          The editorial desk
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
          Understand the measures behind the numbers.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Careful, approachable guides to global health concepts and the choices behind data
          comparisons.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {["All articles", ...articleCategories].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={category === option}
              onClick={() => setCategory(option)}
              className={`rounded-full border px-3 py-1.5 text-xs ${category === option ? "border-primary bg-secondary font-semibold text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
            >
              {option}
            </button>
          ))}
        </div>
        {results.isLoading ? (
          <p role="status" className="mt-8 text-sm text-muted-foreground">
            Loading published articles…
          </p>
        ) : results.isError ? (
          <p role="alert" className="mt-8 text-sm text-destructive">
            Articles could not be loaded. Please try again.
          </p>
        ) : null}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {visible.map((article) => (
            <article key={article.id} className="rounded-xl border border-border bg-card p-6">
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt=""
                  className="mb-5 h-44 w-full rounded-lg object-cover"
                />
              )}
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                {article.category} <span className="px-1 text-border">/</span>{" "}
                {article.readingMinutes ?? "—"} min read
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold">
                <Link
                  className="hover:text-primary"
                  to="/articles/$slug"
                  params={{ slug: article.slug }}
                >
                  {article.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{article.subtitle}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                By {article.author} · Updated {article.updatedAt}
              </p>
              <Link
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                to="/articles/$slug"
                params={{ slug: article.slug }}
              >
                Read article <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </div>
        {results.isSuccess && !visible.length && (
          <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <BookOpenText className="mx-auto mb-3 text-primary" />
            No published articles yet.
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
