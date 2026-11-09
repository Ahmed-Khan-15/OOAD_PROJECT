import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Info, LineChart as LineIcon, PieChart as PieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countries,
  getCountry,
  getIndicator,
  healthRecords,
  recordsFor,
  type Topic,
} from "@/data/health";

const palette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-primary)",
];
type ChartKind = "line" | "bar" | "donut";

export function InteractiveExplorer({
  topic,
  initialIndicator,
}: {
  topic: Topic;
  initialIndicator?: string;
}) {
  const [indicatorId, setIndicatorId] = useState(
    initialIndicator && topic.indicators.some((item) => item.id === initialIndicator)
      ? initialIndicator
      : (topic.indicators[0]?.id ?? ""),
  );
  const [countryIds, setCountryIds] = useState<string[]>(["pakistan", "india", "japan"]);
  const [fromYear, setFromYear] = useState(2000);
  const [toYear, setToYear] = useState(2023);
  const [chartKind, setChartKind] = useState<ChartKind>("line");
  const selected = getIndicator(topic, indicatorId);
  const records = recordsFor(indicatorId, countryIds, fromYear, toYear);
  const years = [...new Set(records.map((record) => record.year))].sort((a, b) => a - b);
  const trendData = years.map((year) => {
    const row: Record<string, string | number | undefined> = { year: String(year) };
    countryIds.forEach((countryId) => {
      row[countryId] = records.find(
        (record) => record.countryId === countryId && record.year === year,
      )?.value;
    });
    return row;
  });
  const comparisonData = countryIds.map((countryId) => ({
    name: getCountry(countryId)?.name ?? countryId,
    value: records.find((record) => record.countryId === countryId && record.year === toYear)
      ?.value,
    countryId,
  }));
  const yearsOptions = Array.from(
    new Set([
      2000,
      2008,
      2016,
      2023,
      ...healthRecords
        .filter((record) => record.indicatorId === indicatorId)
        .map((record) => record.year),
    ]),
  ).sort((left, right) => left - right);
  const validYears = yearsOptions.filter((year) => year >= fromYear && year <= toYear);
  const isDataAvailable = records.length > 0;
  const currentYear = records.filter((record) => record.year === toYear);
  const unitsLabel = selected?.unit ?? "";
  const isSyntheticOnly =
    records.length > 0 &&
    records.every((record) => record.source.includes("Synthetic teaching example"));
  const hasAdminManagedData = records.some(
    (record) => !record.source.includes("Synthetic teaching example"),
  );

  function toggleCountry(id: string) {
    setCountryIds((current) =>
      current.includes(id)
        ? current.length > 1
          ? current.filter((item) => item !== id)
          : current
        : [...current, id],
    );
  }

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-label={`${topic.title} interactive explorer`}
    >
      <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:px-7 sm:py-6">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">
          Explore the sample data
        </p>
        <h2 className="font-display text-2xl font-bold">Look closer</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose a measure and countries to see how a chart changes. Initial teaching values are
          synthetic; administrator-added values show their source references but are not
          independently verified by this prototype.
        </p>
      </div>
      <div className="grid gap-5 border-b border-border px-5 py-5 sm:px-7 lg:grid-cols-[1fr_1fr]">
        <label className="grid gap-2 text-sm font-semibold">
          Health measure
          <select
            aria-label="Health measure"
            value={indicatorId}
            onChange={(event) => setIndicatorId(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 font-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {topic.indicators
              .filter((item) => item.active !== false)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.hasIllustrativeData ||
                  healthRecords.some((record) => record.indicatorId === item.id)
                    ? " · values available"
                    : " · no sample values"}
                </option>
              ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm font-semibold">
            From year
            <select
              aria-label="From year"
              value={fromYear}
              onChange={(event) => {
                const value = Number(event.target.value);
                setFromYear(value);
                if (value > toYear) setToYear(value);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 font-normal text-foreground"
            >
              {yearsOptions.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            To year
            <select
              aria-label="To year"
              value={toYear}
              onChange={(event) => {
                const value = Number(event.target.value);
                setToYear(value);
                if (value < fromYear) setFromYear(value);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 font-normal text-foreground"
            >
              {yearsOptions.map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 text-sm font-semibold">
            Countries <span className="font-normal text-muted-foreground">Choose one or more</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {countries
              .filter((country) => country.active !== false)
              .map((country) => (
                <label
                  key={country.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs transition ${countryIds.includes(country.id) ? "border-primary bg-secondary text-secondary-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}
                >
                  <input
                    type="checkbox"
                    checked={countryIds.includes(country.id)}
                    onChange={() => toggleCountry(country.id)}
                    className="accent-primary"
                  />
                  {country.flag} {country.name}
                </label>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
          <p className="text-sm font-semibold">Chart style</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Chart style">
            {(
              [
                { id: "line", label: "Trend", icon: LineIcon },
                { id: "bar", label: "Compare", icon: BarChart3 },
                { id: "donut", label: "Share", icon: PieIcon },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                size="sm"
                variant={chartKind === id ? "default" : "outline"}
                aria-pressed={chartKind === id}
                onClick={() => setChartKind(id)}
              >
                <Icon size={15} />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1.6fr_0.85fr]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold">
                {chartKind === "line"
                  ? "Change over time"
                  : chartKind === "bar"
                    ? `Country comparison · ${toYear}`
                    : `Relative values · ${toYear}`}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selected?.name} · {unitsLabel} · {fromYear}–{toYear}
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
              {isSyntheticOnly
                ? "Synthetic examples"
                : hasAdminManagedData
                  ? "Includes admin data"
                  : "No data"}
            </span>
          </div>
          {isDataAvailable ? (
            <div
              className="h-[300px] w-full"
              role="img"
              aria-label={`${selected?.name ?? "Health measure"} ${chartKind} chart`}
            >
              {chartKind === "line" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
                    <CartesianGrid
                      strokeDasharray="3 4"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      width={54}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value) => [
                        value == null ? "No data" : `${value} ${unitsLabel}`,
                        "",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey={countryIds[0] ?? ""}
                      name={
                        getCountry(countryIds[0] ?? "")?.name ?? countryIds[0] ?? "Selected country"
                      }
                      stroke={palette[0]}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      connectNulls={false}
                    />
                    {countryIds.slice(1).map((id, index) => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={id}
                        name={getCountry(id)?.name ?? id}
                        stroke={palette[(index + 1) % palette.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        connectNulls={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : chartKind === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
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
                      interval={0}
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                      width={54}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value) => [
                        value == null ? "No data" : `${value} ${unitsLabel}`,
                        "",
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      name={selected?.name ?? "Selected indicator"}
                      fill={palette[0]}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentYear}
                      dataKey="value"
                      nameKey="countryId"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {currentYear.map((entry, index) => (
                        <Cell key={entry.countryId} fill={palette[index % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        borderColor: "var(--color-border)",
                        background: "var(--color-card)",
                        color: "var(--color-foreground)",
                      }}
                      formatter={(value, _name, item) => [
                        `${value ?? "No data"} ${unitsLabel}`,
                        getCountry(String(item.payload.countryId))?.name ?? "Country",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg bg-wash px-6 text-center">
              <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-card text-primary">
                <Info size={18} />
              </span>
              <p className="font-semibold">No sample values available</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                This measure has no illustrative values for the selected countries and years.
                Missing data is not zero.
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {(chartKind === "line"
              ? countryIds
              : chartKind === "bar"
                ? comparisonData.map((item) => item.countryId)
                : currentYear.map((item) => item.countryId)
            ).map((id, index) => (
              <span
                key={id}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: palette[index % palette.length] }}
                />
                {getCountry(id)?.flag} {getCountry(id)?.name}
              </span>
            ))}
          </div>
        </div>
        <aside className="flex flex-col gap-4 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              How to read it
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{selected?.howToRead}</p>
          </div>
          <div className="rounded-lg bg-wash p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Data note
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">
              {hasAdminManagedData
                ? "Administrator-added rows may include source references. Check the source and year; the prototype does not independently verify their accuracy."
                : "Synthetic examples demonstrate comparisons only. They are not real measurements and have no public-health source."}
            </p>
          </div>
          {isDataAvailable && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reference
              </p>
              <p className="mt-2 text-sm text-foreground">
                Years shown: {validYears.length ? validYears.join(", ") : years.join(", ")}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Sources: {[...new Set(records.map((record) => record.source))].join("; ")}
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
