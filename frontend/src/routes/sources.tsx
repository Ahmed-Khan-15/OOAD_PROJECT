import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/public-shell";
import { topics } from "@/data/health";
import { api } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";

export const Route = createFileRoute("/sources")({
  head: () => ({ meta: [{ title: "Sources & Methodology | Global Health Explorer" }] }),
  component: SourcesPage,
});

function SourcesPage() {
  const sourceQuery = useApiQuery(["sources"], api.sources);
  const datasetQuery = useApiQuery(["datasets"], api.datasets);
  const sources = (sourceQuery.data ?? []).map((source) => ({
    ...source,
    organization: source.name,
    url: source.websiteUrl,
    citation: "Citations are provided on registered datasets.",
    license: "See individual dataset terms.",
  }));
  const datasets = (datasetQuery.data ?? [])
    .map((dataset) => ({
      id: dataset.id,
      sourceId: dataset.source.id,
      title: dataset.name,
      description: dataset.description,
      sourceUrl: dataset.sourceUrl,
      citation: dataset.citation,
      license: dataset.licenseName,
      methodology: dataset.methodology,
      frequency: dataset.frequency,
      coverage: [dataset.coverageStartYear, dataset.coverageEndYear].filter(Boolean).join("–"),
      indicatorIds: dataset.indicators.map((item) => item.indicatorId),
      active: dataset.status === "ACTIVE",
    }))
    .filter((dataset) => dataset.active);
  const indicators = topics.flatMap((topic) => topic.indicators);
  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Transparency</p>
        <h1 className="mt-2 font-display text-4xl font-bold">Sources & methodology</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          A source listed here is a potential provider, not evidence that its data has been
          imported. Each published observation should carry its own dataset, reference period,
          definition, and citation.
        </p>
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Organizations and source directory</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sourceQuery.isLoading ? (
              <p role="status" className="text-sm text-muted-foreground">
                Loading data sources…
              </p>
            ) : sourceQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                Data sources could not be loaded.
              </p>
            ) : (
              sources
                .filter((source) => source.active)
                .map((source) => (
                  <article key={source.id} className="rounded-xl border border-border bg-card p-5">
                    <h3 className="font-display text-lg font-bold">{source.organization}</h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{source.name}</p>
                    <p className="mt-3 text-sm leading-6">{source.description}</p>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Citation: {source.citation}
                      <br />
                      Reuse: {source.license}
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Visit source <ExternalLink size={14} />
                    </a>
                  </article>
                ))
            )}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">Registered datasets</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Dataset records are provided by this academic prototype and have not been independently
            verified. A directory entry does not mean health observations from that dataset are
            present in the explorer.
          </p>
          {datasets.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {datasets.map((dataset) => {
                const source = sources.find((item) => item.id === dataset.sourceId);
                const linkedIndicators = dataset.indicatorIds
                  .map((id) => indicators.find((indicator) => indicator.id === id))
                  .filter((indicator) => indicator);
                return (
                  <article key={dataset.id} className="rounded-xl border border-border bg-card p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {source?.organization ?? "Source unspecified"}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold">{dataset.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {dataset.description || "No description provided."}
                    </p>
                    <dl className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground">
                      {dataset.coverage && (
                        <div>
                          <dt className="inline font-semibold text-foreground">Coverage: </dt>
                          <dd className="inline">{dataset.coverage}</dd>
                        </div>
                      )}
                      {dataset.frequency && (
                        <div>
                          <dt className="inline font-semibold text-foreground">
                            Update frequency:{" "}
                          </dt>
                          <dd className="inline">{dataset.frequency}</dd>
                        </div>
                      )}
                      {dataset.methodology && (
                        <div>
                          <dt className="inline font-semibold text-foreground">Methodology: </dt>
                          <dd className="inline">{dataset.methodology}</dd>
                        </div>
                      )}
                      {dataset.citation && (
                        <div>
                          <dt className="inline font-semibold text-foreground">Citation: </dt>
                          <dd className="inline">{dataset.citation}</dd>
                        </div>
                      )}
                      {dataset.license && (
                        <div>
                          <dt className="inline font-semibold text-foreground">Reuse: </dt>
                          <dd className="inline">{dataset.license}</dd>
                        </div>
                      )}
                    </dl>
                    {linkedIndicators.length > 0 && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Related indicators:{" "}
                        {linkedIndicators.map((indicator) => indicator!.name).join(", ")}
                      </p>
                    )}
                    <a
                      href={dataset.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      Open dataset <ExternalLink size={14} />
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              No individual datasets have been registered yet.
            </p>
          )}
        </section>
        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">How measures are documented</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              An indicator has a definition and unit. A dataset describes the provider, coverage,
              method, publication date, and license. An observation points to its country,
              indicator, dataset, and reference year. The current educational interface may show
              synthetic teaching values; those are labeled and must not be treated as public-health
              estimates.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              When reliable observations are added, confirm numerator and denominator, age
              standardization, population coverage, and any uncertainty or revisions against the
              original dataset.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-bold">Indicator definitions</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The catalogue currently contains{" "}
              {topics.reduce((n, topic) => n + topic.indicators.length, 0)} indicator definitions.
              Definitions and interpretation notes are shown on each topic page. No population
              estimate is inferred when a data row is absent.
            </p>
            <ul className="mt-3 list-inside list-disc text-sm leading-7 text-muted-foreground">
              <li>Check source and reference year.</li>
              <li>Compare like units and definitions.</li>
              <li>Read missing observations as unavailable, not zero.</li>
              <li>Do not infer causation from a chart alone.</li>
            </ul>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
