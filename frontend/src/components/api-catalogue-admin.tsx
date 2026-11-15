import { AdminLayout, AdminPageHeading } from "@/components/admin-shell";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";
import { Link } from "@tanstack/react-router";

type Kind = "countries" | "topics" | "indicators" | "records" | "sources";

/** Catalogue values are authoritative in PostgreSQL; no write API exists for these reference types yet. */
export function CatalogueAdminPage({ kind }: { kind: Kind }) {
  const countries = useApiQuery(["countries"], api.countries);
  const topics = useApiQuery(["topics"], api.topics);
  const indicators = useApiQuery(["indicators"], api.indicators);
  const sources = useApiQuery(["sources"], api.sources);
  const observations = useApiQuery(["observations", "admin-list"], () =>
    api.observations({ size: 100 }),
  );
  const title = {
    countries: "Countries",
    topics: "Topics",
    indicators: "Indicators",
    records: "Health observations",
    sources: "Data sources",
  }[kind];
  const query = { countries, topics, indicators, records: observations, sources }[kind];
  const data = query.data;
  const rows: { key: string; title: string; detail: string }[] =
    kind === "countries"
      ? (countries.data ?? []).map((item) => ({
          key: item.iso3,
          title: item.name,
          detail: `${item.iso3} · ${item.region} · ${item.active ? "active" : "inactive"}`,
        }))
      : kind === "topics"
        ? (topics.data ?? []).map((item) => ({
            key: item.slug,
            title: item.name,
            detail: `${item.slug} · ${(item.indicatorIds ?? []).length} indicators`,
          }))
        : kind === "indicators"
          ? (indicators.data ?? []).map((item) => ({
              key: item.slug,
              title: item.name,
              detail: `${item.slug} · ${item.unit} · ${item.topic.name}${item.observationsAvailable ? " · observations available" : " · no published observations"}`,
            }))
          : kind === "sources"
            ? (sources.data ?? []).map((item) => ({
                key: item.id,
                title: item.name,
                detail: `${item.abbreviation || "Source"} · ${item.datasetIds.length} published datasets · ${item.websiteUrl}`,
              }))
            : (observations.data?.content ?? []).map((item, index) => ({
                key: `${item.country.id}-${item.indicator.id}-${item.year}-${index}`,
                title: `${item.country.name} · ${item.indicator.name} · ${item.year}`,
                detail: `${item.value} ${item.indicator.unit} · ${item.dataset.name} · ${item.dataset.sourceName}`,
              }));
  return (
    <AdminLayout
      title={title}
      description="Read the current reference catalogue from the backend. Changes to catalogue reference records are not exposed by the available API."
    >
      <AdminPageHeading
        title={title}
        description={`${rows.length} records loaded from the backend.`}
      />
      <p className="mb-4 rounded-lg bg-wash p-3 text-sm text-muted-foreground">
        This screen is read-only because the backend currently provides public catalogue endpoints
        but no protected write endpoints for this record type. CSV observation uploads are available
        under CSV import.
      </p>
      {query.isLoading ? (
        <p role="status">Loading {title.toLowerCase()}…</p>
      ) : query.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Could not load {title.toLowerCase()}.
        </p>
      ) : rows.length ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <article key={row.key} className="rounded-xl border border-border bg-card p-4">
              <h2 className="font-semibold">{row.title}</h2>
              <p className="mt-1 break-words text-sm text-muted-foreground">{row.detail}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No published records are available.
        </p>
      )}
      {kind === "records" && observations.data?.hasNext && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing the first {observations.data.size} observations of{" "}
          {observations.data.totalElements}. Refine through the public explorer for specific
          countries and indicators.
        </p>
      )}
      {data && !Array.isArray(data) && <span className="sr-only">Pagination page {data.page}</span>}
    </AdminLayout>
  );
}

export function ApiAdminDashboard() {
  const countries = useApiQuery(["countries"], api.countries);
  const topics = useApiQuery(["topics"], api.topics);
  const indicators = useApiQuery(["indicators"], api.indicators);
  const datasets = useApiQuery(["admin", "datasets"], api.adminDatasets);
  const donations = useApiQuery(["admin", "donation-summary"], api.donationSummary);
  const cards = [
    ["Countries", countries.data?.length],
    ["Topics", topics.data?.length],
    ["Indicators", indicators.data?.length],
    ["Datasets", datasets.data?.length],
    ["Simulated contributions", donations.data?.donationCount],
  ] as const;
  return (
    <AdminLayout
      title="Overview"
      description="A live summary from the Global Health Explorer backend."
    >
      <AdminPageHeading
        title="Workspace overview"
        description="Counts reflect backend records. Health observations are not inferred when the database has no values."
      />
      {(countries.isError ||
        topics.isError ||
        indicators.isError ||
        datasets.isError ||
        donations.isError) && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          Some backend summary data could not be loaded.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <article key={label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
            <p className="mt-2 font-display text-2xl font-bold">{value ?? "—"}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/admin/import"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <strong>Import observations</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a dataset CSV and review row-level validation.
          </p>
        </Link>
        <Link
          to="/admin/articles"
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40"
        >
          <strong>Manage editorial content</strong>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft, preview, publish, and transfer saved initial content.
          </p>
        </Link>
      </div>
    </AdminLayout>
  );
}
