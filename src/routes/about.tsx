import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Info, ShieldCheck, BarChart3, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Global Health Explorer" },
      {
        name: "description",
        content:
          "Learn what Global Health Explorer is, how it is designed, and why health data should be interpreted with care.",
      },
      { property: "og:title", content: "About | Global Health Explorer" },
      {
        property: "og:description",
        content: "A plain-language educational platform for exploring health topics and countries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const cards = [
    {
      icon: Info,
      title: "What this project is",
      body: "Global Health Explorer is a learning-focused website built to help people understand public health patterns without requiring specialist knowledge.",
    },
    {
      icon: Sparkles,
      title: "Why it exists",
      body: "The project was created to make health information feel more accessible, especially for students, general readers, and anyone curious about how health varies around the world.",
    },
    {
      icon: BarChart3,
      title: "How users explore it",
      body: "Readers can browse health topics, examine country profiles, compare indicators, and see visual examples that explain how measures differ across places and years.",
    },
  ];

  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            About the project
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
            A clearer way to understand health information
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Global Health Explorer is designed to be educational and approachable. It helps people
            understand how health is measured, why health patterns differ across countries, and what
            it means to compare a single indicator across time and place.
          </p>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon size={18} />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Why indicators matter
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Health data can tell a story, but only when it is interpreted carefully
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              An indicator is a way of summarizing a health pattern in a measurable form: for
              example, under-five mortality, life expectancy, or the share of births attended by
              skilled staff. Visualizations are useful because they help us compare patterns, but
              they cannot stand on their own without context.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Different data sources may use different definitions, age groups, or time periods.
              That is why each indicator includes a brief explanation, a unit, and a reference year
              wherever possible.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Where the information comes from
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Sources, years, and limits</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              This educational prototype uses illustrative data and public-health framing to explain
              how real-world health indicators are interpreted. The platform emphasizes that
              reference years, units, and source methods matter when comparing countries or
              measures.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Not all indicators are available for every country or in every year. Missing data is
              shown as unavailable rather than treated as zero, and values are not presented as
              verified clinical or public-health measurements.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-wash p-5">
            <Database className="text-primary" size={20} />
            <h2 className="mt-3 font-display text-lg font-bold">Source awareness</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Comparisons work best when we consider definitions, measurement methods, and the year
              in which the indicator was recorded.
            </p>
          </div>

          <div className="rounded-xl bg-wash p-5">
            <ShieldCheck className="text-primary" size={20} />
            <h2 className="mt-3 font-display text-lg font-bold">Educational purpose</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The platform is purely educational. It is not intended to replace medical care,
              diagnosis, or individual advice from a qualified clinician.
            </p>
          </div>

          <div className="rounded-xl bg-wash p-5">
            <Info className="text-primary" size={20} />
            <h2 className="mt-3 font-display text-lg font-bold">Limitations</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Population averages can hide differences across communities, and a single chart cannot
              tell the whole story of a health system or a country.
            </p>
          </div>
        </section>

        <div className="mt-12 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Start exploring</p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Begin with a topic, a country, or a comparison
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/topics">
                Explore topics <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/countries">Browse countries</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/compare">Compare countries</Link>
            </Button>
          </div>
        </div>
      </main>
    </PublicLayout>
  );
}
