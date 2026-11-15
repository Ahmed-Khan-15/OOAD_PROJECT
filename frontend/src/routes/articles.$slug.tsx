import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/public-shell";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";
import { topics } from "@/data/health";
import { countries } from "@/data/health";
import { ArticleContent } from "@/components/article-content";

export const Route = createFileRoute("/articles/$slug")({
  head: () => ({ meta: [{ title: "Article | Global Health Explorer" }] }),
  component: ArticlePage,
});

function ArticlePage() {
  const slug = Route.useParams().slug;
  const articleQuery = useApiQuery(["article", slug], () => api.article(slug));
  const article = articleQuery.data;
  const allArticlesQuery = useApiQuery(["articles", "related"], () => api.articles({ size: 100 }));
  if (!article)
    return (
      <PublicLayout>
        <main className="page-wrap py-20">
          <h1 className="font-display text-3xl font-bold">
            {articleQuery.isLoading
              ? "Loading article…"
              : articleQuery.isError
                ? "Article unavailable"
                : "Article not found"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Only published articles are available on this page.
          </p>
          <Link className="mt-4 inline-flex text-primary" to="/articles">
            Back to articles
          </Link>
        </main>
      </PublicLayout>
    );
  const relatedArticles = (allArticlesQuery.data?.content ?? [])
    .filter(
      (item) =>
        item.id !== article.id &&
        (item.topicSlugs.some((slug) => article.topicSlugs.includes(slug)) ||
          item.tags.some((tag) => article.tags.includes(tag))),
    )
    .slice(0, 3);
  const relatedIndicators = article.indicatorIds
    .map((id) =>
      topics
        .flatMap((topic) => topic.indicators.map((indicator) => ({ indicator, topic })))
        .find((entry) => entry.indicator.id === id),
    )
    .filter((entry) => entry);
  return (
    <PublicLayout>
      <main className="page-wrap py-10 md:py-16">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          to="/articles"
        >
          <ArrowLeft size={15} /> All articles
        </Link>
        <article className="mx-auto mt-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {article.category} · {article.readingMinutes ?? "—"} min read
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-xl leading-8 text-muted-foreground">{article.subtitle}</p>
          <div className="mt-6 border-y border-border py-4 text-sm text-muted-foreground">
            By <span className="font-semibold text-foreground">{article.author}</span> · Published{" "}
            {article.publishedAt} · Updated {article.updatedAt}
          </div>
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt=""
              className="mt-7 max-h-[420px] w-full rounded-xl object-cover"
            />
          )}
          <ArticleContent content={article.content} />
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          {article.topicSlugs.length > 0 && (
            <section className="mt-10 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Explore related topics</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {article.topicSlugs
                  .map((slug) => topics.find((item) => item.slug === slug))
                  .filter((topic) => topic)
                  .map((topic) => (
                    <Link
                      key={topic!.slug}
                      className="text-sm font-semibold text-primary"
                      to="/topics/$slug"
                      params={{ slug: topic!.slug }}
                    >
                      {topic!.title} <span aria-hidden="true">→</span>
                    </Link>
                  ))}
              </div>
            </section>
          )}
          {article.countryIds.length > 0 && (
            <section className="mt-5 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Related country profiles</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {article.countryIds
                  .map((id) =>
                    countries.find((country) => country.isoCode === id || country.id === id),
                  )
                  .filter((country) => country)
                  .map((country) => (
                    <Link
                      key={country!.id}
                      className="text-sm font-semibold text-primary"
                      to="/countries/$countryId"
                      params={{ countryId: country!.id }}
                    >
                      {country!.name} →
                    </Link>
                  ))}
              </div>
            </section>
          )}
          {relatedIndicators.length > 0 && (
            <section className="mt-5 rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Related indicators</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {relatedIndicators.map((entry) => (
                  <Link
                    key={entry!.indicator.id}
                    className="text-sm font-semibold text-primary"
                    to="/topics/$slug"
                    params={{ slug: entry!.topic.slug }}
                  >
                    {entry!.indicator.name} · {entry!.indicator.unit}
                  </Link>
                ))}
              </div>
            </section>
          )}
          {relatedArticles.length > 0 && (
            <section className="mt-10 border-t border-border pt-6">
              <h2 className="font-display text-xl font-bold">Related reading</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedArticles.map((item) => (
                  <Link
                    key={item.id}
                    className="rounded-lg border border-border bg-card p-4 hover:border-primary/40"
                    to="/articles/$slug"
                    params={{ slug: item.slug }}
                  >
                    <span className="text-xs font-semibold uppercase text-primary">
                      {item.category}
                    </span>
                    <strong className="mt-1 block font-display">{item.title}</strong>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="font-display text-xl font-bold">References and further reading</h2>
            <ul className="mt-3 grid gap-2">
              {article.references.map((reference) => (
                <li key={reference.url}>
                  <a
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    href={reference.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {reference.label}
                    <ExternalLink size={13} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              {article.topicSlugs
                .map((slug) => topics.find((topic) => topic.slug === slug)?.title ?? slug)
                .join(" · ")}
            </p>
          </section>
        </article>
      </main>
    </PublicLayout>
  );
}
