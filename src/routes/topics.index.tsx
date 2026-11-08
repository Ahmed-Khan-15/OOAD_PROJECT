import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { topics } from "@/data/health";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "Explore Health Topics | Global Health Explorer" },
      {
        name: "description",
        content:
          "Plain-language guides to global health, causes of death, child health, life expectancy, mental health, and more.",
      },
      { property: "og:title", content: "Explore Health Topics | Global Health Explorer" },
      {
        property: "og:description",
        content: "Understand what health measures mean and why they matter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TopicsIndex,
});

function TopicsIndex() {
  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Explore topics</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Health, one question at a time.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Start with a clear explanation, then see what measures can—and cannot—tell us. Example
          values are synthetic and only included where shown.
        </p>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {topics.map((topic, index) => (
            <article
              key={topic.slug}
              className="grid gap-4 py-6 sm:grid-cols-[48px_1fr_auto] sm:items-center"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-secondary font-display text-sm font-bold text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">{topic.title}</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {topic.shortDescription}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <BookOpenText size={14} />
                  {topic.indicators.length || "Overview"}{" "}
                  {topic.indicators.length ? "selectable measures" : "guide"}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to="/topics/$slug" params={{ slug: topic.slug }}>
                  Read guide <ArrowRight size={15} />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
