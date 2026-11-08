import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpenText, CircleHelp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { InteractiveExplorer } from "@/components/interactive-explorer";
import { getTopic, topics } from "@/data/health";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.topic.title ?? "Health topic";
    const description =
      loaderData?.topic.shortDescription ?? "Explore a plain-language global health guide.";
    return {
      meta: [
        { title: `${title} | Global Health Explorer` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} | Global Health Explorer` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const isOverview = topic.slug === "global-health";
  return (
    <PublicLayout>
      <main>
        <section className="border-b border-border bg-wash">
          <div className="page-wrap py-10 md:py-14">
            <Link
              to="/topics"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              <ArrowLeft size={15} />
              All topics
            </Link>
            <p className="mt-8 text-xs font-bold uppercase tracking-wider text-primary">
              {isOverview ? "An introduction" : "Health topic"}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold sm:text-5xl">
              {topic.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {topic.introduction}
            </p>
          </div>
        </section>
        <div className="page-wrap grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16 lg:py-14">
          <div className="min-w-0">
            <section>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Why this matters
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Health is part of everyday life
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {topic.whyItMatters}
              </p>
              <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                {topic.lifeImpact}
              </p>
            </section>
            {isOverview ? (
              <section className="mt-10 border-y border-border py-8">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  How to explore global health
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  Start broad, then ask a smaller question
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
                  Population measures are useful for spotting patterns, but they do not tell the
                  whole story. Explore one topic, check how a measure is defined, and look for its
                  source and year before comparing values.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { title: "Choose a topic", body: "Learn what a measure describes." },
                    { title: "Check the context", body: "Look for its unit, source, and year." },
                    {
                      title: "Compare carefully",
                      body: "Similar labels can still use different methods.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="border-l-2 border-primary/40 pl-4">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-10 border-y border-border py-8">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Understanding the measures
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  What the indicators describe
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                  A measure is a way to summarize one part of a population's health. Its definition,
                  time period, unit, and method all affect what it can tell us.
                </p>
                <div className="mt-5 divide-y divide-border">
                  {topic.indicators.map((item) => (
                    <article
                      key={item.id}
                      className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start"
                    >
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                          How to read it: {item.howToRead}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {item.hasIllustrativeData ? "Example values" : "No sample values"}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {!isOverview && (
              <div className="mt-10">
                <InteractiveExplorer topic={topic} />
              </div>
            )}
            {isOverview && (
              <section className="mt-10">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Explore the topics
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">Many questions, connected</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {topics.slice(1).map((related) => (
                    <Link
                      key={related.slug}
                      to="/topics/$slug"
                      params={{ slug: related.slug }}
                      className="flex items-center justify-between gap-4 border-b border-border py-4 hover:text-primary"
                    >
                      <span>
                        <strong className="block font-semibold text-foreground">
                          {related.title}
                        </strong>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {related.shortDescription}
                        </span>
                      </span>
                      <ArrowRight size={17} className="shrink-0 text-primary" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-card p-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary">
                <CircleHelp size={17} />
              </span>
              <h2 className="mt-3 font-display text-lg font-bold">A note about data</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isOverview
                  ? "This guide uses explanations rather than global summary numbers. The interactive examples elsewhere on the site are synthetic—not measured public-health statistics."
                  : "Only selected measures have synthetic example values. Other indicators remain available to explore as concepts; missing values are not shown as zero."}
              </p>
            </div>
            <div className="rounded-xl bg-wash p-5">
              <span className="flex size-9 items-center justify-center rounded-full bg-card text-primary">
                <Info size={17} />
              </span>
              <h2 className="mt-3 font-display text-lg font-bold">Not medical advice</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This is an educational information project, not a medical diagnosis or treatment
                service.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Related topics
              </p>
              <div className="mt-2 grid gap-1">
                {topic.related.map((slug) => {
                  const related = topics.find((item) => item.slug === slug);
                  return related ? (
                    <Link
                      key={slug}
                      to="/topics/$slug"
                      params={{ slug }}
                      className="flex items-center justify-between border-b border-border py-3 text-sm font-medium hover:text-primary"
                    >
                      {related.title}
                      <ArrowRight size={14} />
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          </aside>
        </div>
        <section className="border-t border-border bg-card">
          <div className="page-wrap flex flex-wrap items-center justify-between gap-4 py-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Continue exploring
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Put the topic in context.</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/countries">
                Browse countries <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
