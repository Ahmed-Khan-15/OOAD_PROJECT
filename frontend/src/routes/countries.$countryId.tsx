import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import {
  ResponsiveContainer,
  Line,
  LineChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { countries, getCountry, getIndicatorTopic, healthRecords, topics } from "@/data/health";

const sampleYears = [2000, 2008, 2016, 2023];

export const Route = createFileRoute("/countries/$countryId")({
  head: () => ({
    meta: [
      { title: "Country Profile | Global Health Explorer" },
      {
        name: "description",
        content: "Explore a country's health profile and available indicators.",
      },
      { property: "og:title", content: "Country Profile | Global Health Explorer" },
      {
        property: "og:description",
        content: "Explore a country's health profile and available indicators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CountryProfilePage,
});

function CountryProfilePage() {
  const { countryId } = Route.useParams();
  const country = getCountry(countryId);

  const countryRecords = useMemo(
    () => (country ? healthRecords.filter((record) => record.countryId === country.id) : []),
    [country],
  );

  const indicatorSummaries = useMemo(() => {
    const grouped = new Map<string, typeof countryRecords>();
    countryRecords.forEach((record) => {
      const values = grouped.get(record.indicatorId) ?? [];
      values.push(record);
      grouped.set(record.indicatorId, values);
    });

    return Array.from(grouped.entries())
      .map(([indicatorId, records]) => {
        const indicator = topics
          .flatMap((topic) => topic.indicators)
          .find((item) => item.id === indicatorId);
        const latest = [...records].sort((a, b) => b.year - a.year)[0];

        return {
          indicatorId,
          name: indicator?.name ?? "Indicator",
          unit: indicator?.unit ?? "",
          description: indicator?.description ?? "",
          value: latest?.value ?? null,
          year: latest?.year ?? null,
          source: latest?.source ?? null,
          records: [...records].sort((a, b) => a.year - b.year),
          topic: getIndicatorTopic(indicatorId),
        };
      })
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }, [countryRecords]);

  const primary = indicatorSummaries[0];
  const profileYears = Array.from(
    new Set([...sampleYears, ...countryRecords.map((record) => record.year)]),
  ).sort((left, right) => left - right);
  const chartData = useMemo(
    () =>
      profileYears.map((year) => {
        const row: Record<string, string | number | null> = { year };
        for (const item of indicatorSummaries.slice(0, 4)) {
          const found = item.records.find((record) => record.year === year);
          row[item.indicatorId] = found?.value ?? null;
        }
        return row;
      }),
    [indicatorSummaries, profileYears],
  );

  if (!country || country.active === false) {
    return (
      <PublicLayout>
        <main className="page-wrap py-16">
          <h1 className="font-display text-3xl font-bold">Country profile unavailable</h1>
          <p className="mt-3 text-muted-foreground">
            This country may be inactive or not yet available in this browser.
          </p>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/countries" className="inline-flex items-center gap-2 font-medium text-primary">
            <ArrowLeft size={15} /> Back to countries
          </Link>
        </div>

        <header className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Country profile
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                {country.flag} {country.name}
              </h1>
              <p className="mt-3 text-base text-muted-foreground">{country.region}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/compare">
                Compare with another country <ArrowRight size={15} />
              </Link>
            </Button>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-7 text-muted-foreground">
            {country.intro}
          </p>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Historical trend
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {primary?.name ?? "Selected indicator"}
                </h2>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                Sample values
              </span>
            </div>
            {indicatorSummaries.length ? (
              <div className="mt-6 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 4"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value) => [
                        `${value} ${primary?.unit ?? ""}`,
                        primary?.name ?? "Value",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey={primary?.indicatorId ?? "value"}
                      stroke="var(--color-chart-1)"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-wash p-5 text-sm leading-6 text-muted-foreground">
                No sample health observations are currently available for this country. Its profile
                and indicator concepts are still available to explore.
              </p>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Snapshot</p>
              <div className="mt-4 space-y-3">
                {indicatorSummaries.slice(0, 4).map((item) => (
                  <div
                    key={item.indicatorId}
                    className="border-b border-border pb-3 last:border-none last:pb-0"
                  >
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {item.value ?? "No data"}
                      {item.value !== null && (
                        <span className="ml-1 text-sm text-muted-foreground">{item.unit}</span>
                      )}
                    </p>
                    {item.year && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reference year: {item.year}
                        {item.source ? ` · Source: ${item.source}` : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-wash p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Data note</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Initial examples are synthetic teaching values, while administrators may add other
                observations and source references. Check each observation's source and year;
                imported information is not independently verified by this prototype.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-12">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Available indicators
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold">
            Health measures relevant to {country.name}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {indicatorSummaries.map((item) => (
              <div key={item.indicatorId} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.topic?.title ?? "Health topic"}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                    {item.unit}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {item.value !== null ? `${item.value} ${item.unit}` : "No sample value"}
                  </span>
                  {item.year && <span className="text-xs text-muted-foreground">{item.year}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Related topics</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {topics
              .filter((topic) => topic.active !== false)
              .slice(1, 5)
              .map((topic) => (
                <Link
                  key={topic.slug}
                  to="/topics/$slug"
                  params={{ slug: topic.slug }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                >
                  {topic.title} <ArrowRight size={14} />
                </Link>
              ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
