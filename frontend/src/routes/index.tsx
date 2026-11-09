import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import communityImage from "@/assets/global-health-community.jpg";
import { Button } from "@/components/ui/button";
import { CountryLink, PublicLayout, TopicLink } from "@/components/public-shell";
import { countries, topics } from "@/data/health";
import { InteractiveExplorer } from "@/components/interactive-explorer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Global Health Explorer | Understand the health of our world" },
      {
        name: "description",
        content:
          "Explore health topics, countries, and historical patterns through simple explanations and clearly labeled illustrative examples.",
      },
      {
        property: "og:title",
        content: "Global Health Explorer | Understand the health of our world",
      },
      {
        property: "og:description",
        content: "Learn about the health of people and communities around the world.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [search, setSearch] = useState("");
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return [
      ...topics
        .filter(
          (topic) =>
            topic.active !== false &&
            `${topic.title} ${topic.shortDescription}`.toLowerCase().includes(query),
        )
        .slice(0, 4)
        .map((topic) => ({
          label: topic.title,
          description: "Health topic",
          to: topic.slug,
          type: "topic" as const,
        })),
      ...countries
        .filter((country) => country.active !== false && country.name.toLowerCase().includes(query))
        .slice(0, 4)
        .map((country) => ({
          label: `${country.flag} ${country.name}`,
          description: country.region,
          to: country.id,
          type: "country" as const,
        })),
    ].slice(0, 6);
  }, [search]);
  const featuredTopics = topics.filter((topic) => topic.active !== false).slice(1, 5);
  const trendTopic = topics.find(
    (topic) => topic.slug === "life-expectancy" && topic.active !== false,
  );

  return (
    <PublicLayout>
      <main>
        <section className="page-wrap grid items-center gap-8 py-10 md:grid-cols-[1.02fr_0.98fr] md:py-14 lg:gap-14 lg:py-16">
          <div className="fade-in relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              <Sparkles size={14} /> A clearer view of global health
            </div>
            <h1 className="display-title max-w-xl text-4xl text-foreground sm:text-5xl">
              Understand the health of our world.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Explore how health is changing around the world. Discover important topics, understand
              trends, and compare countries through accessible information.
            </p>
            <div className="relative mt-7 max-w-xl">
              <label htmlFor="global-search" className="sr-only">
                Search topics, indicators, or countries
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-2 pl-4 shadow-sm focus-within:ring-2 focus-within:ring-ring">
                <Search className="shrink-0 text-muted-foreground" size={18} />
                <input
                  id="global-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search topics or countries..."
                  className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button asChild size="sm" className="rounded-lg">
                  <Link to="/topics">
                    Explore <ArrowRight size={15} />
                  </Link>
                </Button>
              </div>
              {search.trim() && (
                <div
                  className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  role="listbox"
                  aria-label="Search results"
                >
                  {matches.length ? (
                    matches.map((item) => (
                      <div
                        key={`${item.type}-${item.to}`}
                        className="border-b border-border last:border-0"
                      >
                        {item.type === "topic" ? (
                          <TopicLink slug={item.to}>
                            <span
                              onClick={() => setSearch("")}
                              className="flex items-center justify-between px-4 py-3 hover:bg-muted"
                            >
                              <span>
                                <strong className="block text-sm font-semibold">
                                  {item.label}
                                </strong>
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </span>
                              <ArrowUpRight size={15} />
                            </span>
                          </TopicLink>
                        ) : (
                          <Link
                            to="/countries/$countryId"
                            params={{ countryId: item.to }}
                            onClick={() => setSearch("")}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted"
                          >
                            <span>
                              <strong className="block text-sm font-semibold">{item.label}</strong>
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            </span>
                            <ArrowUpRight size={15} />
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-4 text-sm text-muted-foreground">
                      No matching topics or countries yet.
                    </p>
                  )}
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Search across health topics and 12 country profiles
            </p>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl md:min-h-[385px]">
            <img
              src={communityImage}
              alt="A health worker talking with a parent and child in a community clinic"
              width={1600}
              height={1008}
              fetchPriority="high"
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent px-5 pb-5 pt-24 sm:px-7 sm:pb-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                Health is human
              </p>
              <p className="mt-2 max-w-sm font-display text-xl font-semibold leading-7 text-primary-foreground">
                Every number tells a story about people and communities.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-wash">
          <div className="page-wrap grid gap-7 py-8 md:grid-cols-[1.1fr_2fr] md:items-center md:py-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Start with the big picture
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                A world of health, made easier to explore.
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Health measures can help us ask useful questions. Explore the ideas behind them
                before diving into the numbers.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Health changes over time",
                  body: "A trend can tell a different story than a single year.",
                  symbol: "01",
                },
                {
                  title: "Averages hide differences",
                  body: "People within one country can have very different experiences.",
                  symbol: "02",
                },
                {
                  title: "Sources shape the story",
                  body: "Methods and definitions matter when comparing figures.",
                  symbol: "03",
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-primary/40 pl-4">
                  <span className="text-xs font-bold text-primary">{item.symbol}</span>
                  <h3 className="mt-1 text-sm font-bold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-wrap py-14 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Find your starting point
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">Explore health topics</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Short, approachable guides help explain what each topic means and why it matters.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/topics">
                All topics <ArrowUpRight size={15} />
              </Link>
            </Button>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics
              .filter((topic) => topic.active !== false)
              .map((topic, index) => (
                <TopicLink key={topic.slug} slug={topic.slug}>
                  <div
                    className={`group flex h-full min-h-[190px] flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${index === 0 ? "sm:col-span-2 lg:col-span-2" : ""}`}
                  >
                    <span
                      className={`flex size-10 items-center justify-center rounded-full ${topic.color === "leaf" ? "bg-leaf text-leaf-foreground" : topic.color === "coral" ? "bg-coral text-coral-foreground" : "bg-sea text-sea-foreground"}`}
                    >
                      <span className="text-lg" aria-hidden>
                        {topic.icon === "globe"
                          ? "◎"
                          : topic.icon === "heart"
                            ? "♡"
                            : topic.icon === "baby"
                              ? "✳"
                              : topic.icon === "chart"
                                ? "↗"
                                : topic.icon === "mind"
                                  ? "◉"
                                  : topic.icon === "ribbon"
                                    ? "⌁"
                                    : topic.icon === "care"
                                      ? "✣"
                                      : topic.icon === "air"
                                        ? "〰"
                                        : "◇"}
                      </span>
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold group-hover:text-primary">
                      {topic.title}
                    </h3>
                    <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">
                      {topic.shortDescription}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Explore topic <ArrowRight size={13} />
                    </span>
                  </div>
                </TopicLink>
              ))}
          </div>
        </section>

        <section className="border-y border-border bg-card py-14 md:py-16">
          <div className="page-wrap">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  A first look at trends
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">
                  One question, many perspectives
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  For example, life expectancy summarizes current age-specific death patterns—it
                  does not predict one person's lifespan.
                </p>
              </div>
              <span className="rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-coral-foreground">
                Synthetic teaching example
              </span>
            </div>
            {trendTopic ? (
              <InteractiveExplorer topic={trendTopic} initialIndicator="life-expectancy" />
            ) : (
              <p className="rounded-xl border border-border bg-background p-6 text-sm text-muted-foreground">
                The life expectancy topic is currently unavailable.
              </p>
            )}
          </div>
        </section>

        <section className="page-wrap py-14 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Explore by place
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">Start with a country</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse country profiles and see which sample measures are available.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/countries">
                Browse all countries <ArrowUpRight size={15} />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {countries
              .filter((country) => country.active !== false)
              .slice(0, 8)
              .map((country) => (
                <CountryLink key={country.id} id={country.id}>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition hover:border-primary/40 hover:bg-muted">
                    <span className="text-xl" aria-hidden>
                      {country.flag}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{country.name}</span>
                      <span className="block text-xs text-muted-foreground">{country.region}</span>
                    </span>
                    <ArrowUpRight size={15} className="text-muted-foreground" />
                  </div>
                </CountryLink>
              ))}
          </div>
        </section>

        <section className="page-wrap pb-14 md:pb-16">
          <div className="flex flex-col gap-5 rounded-xl bg-primary px-6 py-7 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/70">
                Explore thoughtfully
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Curiosity is a good place to begin.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-primary-foreground/80">
                Start with a topic, follow a question, and check where each example comes from.
              </p>
            </div>
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/about">
                How to read this site <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
