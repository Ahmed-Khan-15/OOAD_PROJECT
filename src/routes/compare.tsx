import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, LineChart as LineIcon } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { countries, getCountry, getIndicator, healthRecords, topics } from "@/data/health";

const sampleYears = [2000, 2008, 2016, 2023];
const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

type ChartType = "line" | "bar";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Countries | Global Health Explorer" },
      {
        name: "description",
        content:
          "Compare health indicators across countries, years, and measures using interactive charts.",
      },
      { property: "og:title", content: "Compare Countries | Global Health Explorer" },
      {
        property: "og:description",
        content: "Investigate how health indicators differ across countries and years.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const [countryIds, setCountryIds] = useState(["india", "japan", "nigeria"]);
  const [indicatorId, setIndicatorId] = useState("life-expectancy");
  const [year, setYear] = useState(2023);
  const [chartType, setChartType] = useState<ChartType>("line");

  const indicatorOptions = useMemo(
    () =>
      topics
        .flatMap((topic) => topic.indicators)
        .filter((indicator) => indicator.hasIllustrativeData),
    [],
  );

  const selectedIndicator =
    getIndicator(topics[0], indicatorId) ??
    indicatorOptions.find((item) => item.id === indicatorId);

  const selectedCountries = countryIds
    .map((id) => countries.find((country) => country.id === id))
    .filter(Boolean) as typeof countries;

  const trendData = useMemo(
    () =>
      sampleYears.map((sampleYear) => {
        const row: Record<string, string | number | null> = { year: sampleYear };
        selectedCountries.forEach((country, index) => {
          const value = healthRecords.find(
            (record) =>
              record.countryId === country.id &&
              record.indicatorId === indicatorId &&
              record.year === sampleYear,
          )?.value;
          row[country.id] = value ?? null;
          row[`${country.id}-label`] = index;
        });
        return row;
      }),
    [indicatorId, selectedCountries],
  );

  const comparisonData = useMemo(
    () =>
      selectedCountries.map((country) => ({
        name: country.name,
        flag: country.flag,
        value:
          healthRecords.find(
            (record) =>
              record.countryId === country.id &&
              record.indicatorId === indicatorId &&
              record.year === year,
          )?.value ?? null,
      })),
    [indicatorId, selectedCountries, year],
  );

  const toggleCountry = (id: string) => {
    setCountryIds((current) => {
      if (current.includes(id)) {
        return current.length > 1 ? current.filter((item) => item !== id) : current;
      }
      return [...current, id];
    });
  };

  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Country comparison
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold">
              Compare how health changes across countries
            </h1>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            {selectedCountries.length} countries selected
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
            <label className="grid gap-2 text-sm font-semibold">
              Select an indicator
              <select
                aria-label="Select indicator"
                value={indicatorId}
                onChange={(event) => setIndicatorId(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground"
              >
                {indicatorOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Choose a year
              <select
                aria-label="Select year"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm font-normal text-foreground"
              >
                {sampleYears.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2">
              <p className="text-sm font-semibold">Chart type</p>
              <div className="flex gap-2">
                {(
                  [
                    { id: "line", label: "Trend", icon: LineIcon },
                    { id: "bar", label: "Compare", icon: BarChart3 },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <Button
                    key={id}
                    size="sm"
                    variant={chartType === id ? "default" : "outline"}
                    onClick={() => setChartType(id)}
                    className="flex-1"
                  >
                    <Icon size={15} />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-sm font-semibold">Countries</p>
            <div className="flex flex-wrap gap-2">
              {countries.map((country) => (
                <label
                  key={country.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs ${countryIds.includes(country.id) ? "border-primary bg-secondary text-secondary-foreground" : "border-border bg-background text-muted-foreground"}`}
                >
                  <input
                    checked={countryIds.includes(country.id)}
                    type="checkbox"
                    onChange={() => toggleCountry(country.id)}
                    className="accent-primary"
                  />
                  {country.flag} {country.name}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Selected measure
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold">{selectedIndicator?.name}</h2>
            </div>
            <span className="rounded-full bg-wash px-2.5 py-1 text-xs text-muted-foreground">
              {selectedIndicator?.unit}
            </span>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={trendData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
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
                    formatter={(value) => [`${value} ${selectedIndicator?.unit ?? ""}`, "Value"]}
                  />
                  {selectedCountries.map((country, index) => (
                    <Line
                      key={country.id}
                      type="monotone"
                      dataKey={country.id}
                      stroke={palette[index % palette.length]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              ) : (
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
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
                    formatter={(value) => [`${value} ${selectedIndicator?.unit ?? ""}`, "Value"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell key={entry.name} fill={palette[index % palette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {comparisonData.map((item) => (
              <div key={item.name} className="rounded-lg border border-border bg-wash p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{item.flag}</span>
                  {item.name}
                </div>
                <p className="mt-3 text-2xl font-bold text-foreground">
                  {item.value ?? "—"}
                  {item.value !== null && (
                    <span className="ml-1 text-base text-muted-foreground">
                      {selectedIndicator?.unit}
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{year} reference year</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 rounded-xl border border-border bg-card p-5 text-sm leading-7 text-muted-foreground">
          <span className="font-semibold text-foreground">How to read this comparison:</span>{" "}
          {selectedIndicator?.howToRead}
        </div>
      </main>
    </PublicLayout>
  );
}
