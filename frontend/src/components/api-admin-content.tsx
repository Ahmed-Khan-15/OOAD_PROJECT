import { useState, type FormEvent } from "react";
import { AdminLayout, AdminPageHeading } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import {
  api,
  type ArticleApi,
  type ArticleWrite,
  type GlossaryApi,
  type GlossaryWrite,
} from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";
import { useQueryClient } from "@tanstack/react-query";
import { articleCategories, getEditorialData } from "@/data/publication-data";
import { countries } from "@/data/health";
import { parseDatasetMappingLines } from "@/lib/dataset-mappings";

const panel = "rounded-xl border border-border bg-card p-5";
const input = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const area = "min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const list = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const refs = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split("\n")
    .map((line) => {
      const [label, url] = line.split("|");
      return { label: label?.trim() ?? "", url: url?.trim() ?? "" };
    })
    .filter((ref) => ref.label && /^https?:\/\//.test(ref.url));

export function ApiArticlesAdmin() {
  const client = useQueryClient();
  const query = useApiQuery(["admin", "articles"], () => api.adminArticles({ size: 100 }));
  const [editing, setEditing] = useState<ArticleApi | null>(null);
  const [preview, setPreview] = useState<ArticleApi | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const begin = (article?: ArticleApi) =>
    setEditing(
      article ?? {
        id: "",
        slug: "",
        title: "",
        subtitle: "",
        author: "",
        category: "Health Explainers",
        categorySlug: "health-explainers",
        tags: [],
        publishedAt: null,
        updatedAt: "",
        readingMinutes: 5,
        status: "DRAFT",
        coverImage: "",
        introduction: "",
        content: "",
        references: [],
        topicSlugs: [],
        countryIds: [],
        indicatorIds: [],
        relatedArticleSlugs: [],
      },
    );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const write: ArticleWrite = {
      title,
      slug: slugify(String(form.get("slug") || title)),
      subtitle: String(form.get("subtitle") ?? ""),
      author: String(form.get("author") ?? ""),
      categorySlug: slugify(String(form.get("category"))),
      tags: list(form.get("tags")),
      publishedAt: String(form.get("publishedAt") || "") || null,
      readingMinutes: Number(form.get("readingMinutes")) || null,
      status: String(form.get("status")),
      coverImage: String(form.get("coverImage") ?? ""),
      introduction: String(form.get("introduction") ?? ""),
      content: String(form.get("content") ?? ""),
      references: refs(form.get("references")),
      topicSlugs: list(form.get("topicSlugs")),
      countryIds: list(form.get("countryIds")).map(
        (id) => countries.find((country) => country.id === id)?.isoCode ?? id,
      ),
      indicatorIds: list(form.get("indicatorIds")),
      relatedArticleSlugs: list(form.get("relatedArticleSlugs")),
    };
    try {
      await api.saveArticle(write, editing.id ? editing.slug : undefined);
      await client.invalidateQueries({ queryKey: ["admin", "articles"] });
      await client.invalidateQueries({ queryKey: ["articles"] });
      await client.invalidateQueries({ queryKey: ["article"] });
      setEditing(null);
      setError("");
      setNotice("Article saved to the backend.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Article could not be saved.");
    }
  }
  async function remove(article: ArticleApi) {
    if (!window.confirm(`Archive ${article.title}?`)) return;
    try {
      await api.deleteArticle(article.slug);
      await client.invalidateQueries({ queryKey: ["admin", "articles"] });
      await client.invalidateQueries({ queryKey: ["articles"] });
      await client.invalidateQueries({ queryKey: ["article"] });
      setNotice("Article archived.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Article could not be archived.");
    }
  }
  async function transferLocal() {
    setError("");
    setNotice("Checking existing server content…");
    try {
      const [serverArticles, serverGlossary] = await Promise.all([
        loadAllArticles(),
        loadAllGlossary(),
      ]);
      const local = getEditorialData();
      const articleSlugs = new Set(serverArticles.map((item) => item.slug));
      const glossarySlugs = new Set(serverGlossary.map((item) => item.slug));
      let added = 0;
      let skipped = 0;
      const failures: string[] = [];
      for (const article of local.articles) {
        if (articleSlugs.has(article.slug)) {
          skipped++;
          continue;
        }
        const write: ArticleWrite = {
          title: article.title,
          slug: article.slug,
          subtitle: article.subtitle,
          author: article.author,
          categorySlug: slugify(article.category),
          tags: article.tags,
          publishedAt: article.publishedAt || null,
          readingMinutes: article.readingMinutes,
          status: article.status.toUpperCase(),
          coverImage: article.coverImage,
          introduction: "",
          content: article.content,
          references: article.references,
          topicSlugs: article.topicSlugs,
          countryIds: article.countryIds.map(
            (id) => countries.find((country) => country.id === id)?.isoCode ?? id,
          ),
          indicatorIds: article.indicatorIds,
          relatedArticleSlugs: [],
        };
        try {
          await api.saveArticle(write);
          articleSlugs.add(article.slug);
          added++;
        } catch (cause) {
          failures.push(`${article.slug}: ${cause instanceof Error ? cause.message : "failed"}`);
        }
      }
      for (const term of local.glossary) {
        if (glossarySlugs.has(term.slug)) {
          skipped++;
          continue;
        }
        const write: GlossaryWrite = {
          term: term.term,
          slug: term.slug,
          definition: term.definition,
          extendedExplanation: "",
          references: term.references,
          relatedTermSlugs: [],
          relatedArticleSlugs: term.relatedArticleSlugs ?? [],
          relatedTopicSlugs: term.relatedTopicSlugs,
          relatedIndicatorIds: term.relatedIndicatorIds ?? [],
        };
        try {
          await api.saveGlossary(write);
          glossarySlugs.add(term.slug);
          added++;
        } catch (cause) {
          failures.push(`${term.slug}: ${cause instanceof Error ? cause.message : "failed"}`);
        }
      }
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "articles"] }),
        client.invalidateQueries({ queryKey: ["admin", "glossary"] }),
        client.invalidateQueries({ queryKey: ["articles"] }),
        client.invalidateQueries({ queryKey: ["article"] }),
        client.invalidateQueries({ queryKey: ["glossary"] }),
      ]);
      setNotice(
        `Transfer finished: ${added} created; ${skipped} existing records skipped. Existing server records were not overwritten.`,
      );
      if (failures.length)
        setError(
          `Some local records need review before transfer: ${failures.slice(0, 4).join("; ")}`,
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not check server content.");
    }
  }
  return (
    <AdminLayout
      title="Articles"
      description="Manage backend articles and publishing state. Existing browser content is preserved until you explicitly transfer it."
    >
      <AdminPageHeading
        title="Editorial library"
        description={`${query.data?.totalElements ?? 0} backend articles across four categories.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void transferLocal()}>
              Transfer saved local content
            </Button>
            <Button onClick={() => begin()}>New article</Button>
          </div>
        }
      />
      {notice && (
        <p role="status" className="mb-3 text-sm text-primary">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {query.isLoading ? (
        <p role="status">Loading articles…</p>
      ) : query.isError ? (
        <p role="alert">Could not load backend articles.</p>
      ) : (
        <div className="grid gap-3">
          {query.data?.content.map((article) => (
            <article
              key={article.slug}
              className={`${panel} flex flex-wrap items-center justify-between gap-3`}
            >
              <div>
                <p className="text-xs font-bold uppercase text-primary">
                  {article.status} · {article.category}
                </p>
                <h2 className="font-display text-lg font-bold">{article.title}</h2>
                <p className="text-sm text-muted-foreground">{article.subtitle}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreview(article)}>
                  Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => begin(article)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => void remove(article)}>
                  Archive
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {preview && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground/40 p-4">
          <section className="mx-auto my-10 max-w-3xl rounded-2xl bg-card p-6">
            <Button variant="ghost" onClick={() => setPreview(null)}>
              Close preview
            </Button>
            <h2 className="mt-4 font-display text-3xl font-bold">{preview.title}</h2>
            <p className="mt-2">{preview.subtitle}</p>
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7">{preview.content}</div>
          </section>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground/40 p-3">
          <form
            onSubmit={(event) => void save(event)}
            className="mx-auto my-6 grid max-w-3xl gap-3 rounded-2xl bg-card p-5"
          >
            <div className="flex justify-between">
              <h2 className="font-display text-2xl font-bold">Article editor</h2>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  "title",
                  "slug",
                  "subtitle",
                  "author",
                  "publishedAt",
                  "readingMinutes",
                  "coverImage",
                  "tags",
                  "topicSlugs",
                  "countryIds",
                  "indicatorIds",
                  "relatedArticleSlugs",
                ] as const
              ).map((name) => (
                <label key={name} className="grid gap-1 text-sm">
                  {name}
                  <input
                    name={name}
                    className={input}
                    defaultValue={
                      name === "tags"
                        ? editing.tags.join(", ")
                        : name === "topicSlugs"
                          ? editing.topicSlugs.join(", ")
                          : name === "countryIds"
                            ? editing.countryIds.join(", ")
                            : name === "indicatorIds"
                              ? editing.indicatorIds.join(", ")
                              : name === "relatedArticleSlugs"
                                ? editing.relatedArticleSlugs.join(", ")
                                : String(editing[name] ?? "")
                    }
                  />
                </label>
              ))}
              <label className="grid gap-1 text-sm">
                Category
                <select
                  name="category"
                  className={input}
                  defaultValue={
                    articleCategories.includes(editing.category as never)
                      ? editing.category
                      : "Health Explainers"
                  }
                >
                  {articleCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                Status
                <select name="status" className={input} defaultValue={editing.status.toUpperCase()}>
                  {["DRAFT", "PUBLISHED", "ARCHIVED"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              Introduction
              <textarea name="introduction" className={area} defaultValue={editing.introduction} />
            </label>
            <label className="grid gap-1 text-sm">
              Article content
              <textarea name="content" required className={area} defaultValue={editing.content} />
            </label>
            <label className="grid gap-1 text-sm">
              References (label | URL, one per line)
              <textarea
                name="references"
                className={area}
                defaultValue={editing.references
                  .map((ref) => `${ref.label} | ${ref.url}`)
                  .join("\n")}
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save article</Button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

async function loadAllArticles() {
  const items: ArticleApi[] = [];
  let page = 0;
  let more = true;
  while (more) {
    const result = await api.adminArticles({ page, size: 100 });
    items.push(...result.content);
    more = result.hasNext;
    page += 1;
  }
  return items;
}

async function loadAllGlossary() {
  const items: GlossaryApi[] = [];
  let page = 0;
  let more = true;
  while (more) {
    const result = await api.adminGlossary({ page, size: 100 });
    items.push(...result.content);
    more = result.hasNext;
    page += 1;
  }
  return items;
}

export function ApiGlossaryAdmin() {
  const client = useQueryClient();
  const query = useApiQuery(["admin", "glossary"], () => api.adminGlossary({ size: 100 }));
  const [editing, setEditing] = useState<GlossaryApi | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const start = (term?: GlossaryApi) =>
    setEditing(
      term ?? {
        id: "",
        term: "",
        slug: "",
        definition: "",
        extendedExplanation: "",
        relatedTopicSlugs: [],
        relatedArticleSlugs: [],
        relatedIndicatorIds: [],
        references: [],
      },
    );
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const term = String(form.get("term") ?? "");
    const slug = slugify(String(form.get("slug") || term));
    const body: GlossaryWrite = {
      term,
      slug,
      definition: String(form.get("definition") ?? ""),
      extendedExplanation: String(form.get("extendedExplanation") ?? ""),
      references: refs(form.get("references")),
      relatedTopicSlugs: list(form.get("topics")),
      relatedArticleSlugs: list(form.get("articles")),
      relatedIndicatorIds: list(form.get("indicators")),
      relatedTermSlugs: [],
    };
    try {
      await api.saveGlossary(body, editing.id ? editing.slug : undefined);
      await client.invalidateQueries({ queryKey: ["admin", "glossary"] });
      await client.invalidateQueries({ queryKey: ["glossary"] });
      setEditing(null);
      setNotice("Glossary term saved to the backend.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Glossary term could not be saved.");
    }
  }
  async function remove(term: GlossaryApi) {
    if (!window.confirm(`Delete ${term.term}?`)) return;
    try {
      await api.deleteGlossary(term.slug);
      await client.invalidateQueries({ queryKey: ["admin", "glossary"] });
      await client.invalidateQueries({ queryKey: ["glossary"] });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Delete failed.");
    }
  }
  return (
    <AdminLayout title="Glossary" description="Manage glossary entries stored by the backend.">
      <AdminPageHeading
        title="Glossary entries"
        description={`${query.data?.totalElements ?? 0} backend terms.`}
        action={<Button onClick={() => start()}>New term</Button>}
      />
      {notice && (
        <p role="status" className="text-sm text-primary">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {query.isLoading ? (
        <p>Loading terms…</p>
      ) : (
        <div className="grid gap-3">
          {(query.data?.content ?? []).map((term) => (
            <article key={term.slug} className={`${panel} flex flex-wrap justify-between gap-3`}>
              <div>
                <h2 className="font-display text-lg font-bold">{term.term}</h2>
                <p className="text-sm text-muted-foreground">{term.definition}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => start(term)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => void remove(term)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground/40 p-3">
          <form
            onSubmit={(event) => void save(event)}
            className="mx-auto my-8 grid max-w-2xl gap-3 rounded-2xl bg-card p-6"
          >
            <h2 className="font-display text-2xl font-bold">Glossary editor</h2>
            {["term", "slug"].map((name) => (
              <input
                key={name}
                name={name}
                required
                className={input}
                placeholder={name}
                defaultValue={editing[name as "term" | "slug"]}
              />
            ))}
            {[
              ["definition", editing.definition],
              ["extendedExplanation", editing.extendedExplanation],
              [
                "references",
                editing.references.map((ref) => `${ref.label} | ${ref.url}`).join("\n"),
              ],
            ].map(([name, value]) => (
              <textarea
                key={name}
                name={name}
                className={area}
                placeholder={name}
                defaultValue={value}
              />
            ))}
            {[
              ["topics", editing.relatedTopicSlugs],
              ["articles", editing.relatedArticleSlugs],
              ["indicators", editing.relatedIndicatorIds],
            ].map(([name, values]) => (
              <input
                key={String(name)}
                name={String(name)}
                className={input}
                placeholder={`${name} (comma separated)`}
                defaultValue={(values as string[]).join(", ")}
              />
            ))}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save term</Button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}

export function ApiDonationsAdmin() {
  const report = useApiQuery(["admin", "donation-summary"], api.donationSummary);
  const rows = useApiQuery(["admin", "donations"], () => api.adminDonations({ size: 100 }));
  const summary = report.data;
  return (
    <AdminLayout
      title="Donations"
      description="Private administrator reporting for simulated contributions. These are not real payments."
    >
      <AdminPageHeading
        title="Donation activity"
        description="All totals and records are simulated demonstration data."
      />
      {report.isLoading ? (
        <p role="status">Loading donation summary…</p>
      ) : report.isError ? (
        <p role="alert" className="text-destructive">
          Donation report is unavailable.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Simulated total",
              `${summary?.currency ?? "USD"} ${Number(summary?.simulatedTotal ?? 0).toFixed(2)}`,
            ],
            ["Donation count", String(summary?.donationCount ?? 0)],
            ["One-time", String(summary?.oneTimeCount ?? 0)],
            ["Monthly commitments", String(summary?.monthlyCommitmentCount ?? 0)],
            ["Simulated successes", String(summary?.simulatedSuccessCount ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className={panel}>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}
      <section className={`${panel} mt-6 overflow-x-auto`}>
        <h2 className="font-display text-xl font-bold">Private simulated records</h2>
        {rows.isLoading ? (
          <p className="mt-4">Loading donation records…</p>
        ) : rows.isError ? (
          <p role="alert" className="mt-4 text-destructive">
            Donation records could not be loaded.
          </p>
        ) : rows.data?.content.length ? (
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-muted-foreground">
                <th className="py-3">Reference</th>
                <th>Donor</th>
                <th>Amount</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.data.content.map((item) => (
                <tr key={item.reference} className="border-b">
                  <td className="py-3 font-mono text-xs">{item.reference}</td>
                  <td>
                    {item.anonymous ? "Anonymous" : item.donorName}
                    <span className="block text-xs text-muted-foreground">{item.email}</span>
                  </td>
                  <td>
                    {item.currency} {Number(item.amount).toFixed(2)}
                  </td>
                  <td>{item.frequency === "MONTHLY" ? "Monthly commitment" : "One time"}</td>
                  <td>{item.status} · simulated</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No simulated donations have been recorded.
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Donor contact details are restricted to this administrator view. No card information is
          collected or retained.
        </p>
      </section>
    </AdminLayout>
  );
}

export function ApiDatasetsAdmin() {
  const client = useQueryClient();
  const datasets = useApiQuery(["admin", "datasets"], api.adminDatasets);
  const sources = useApiQuery(["sources"], api.sources);
  const indicators = useApiQuery(["indicators"], api.indicators);
  const [editing, setEditing] = useState<import("@/lib/api").DatasetApi | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const slug = slugify(String(form.get("slug") || form.get("name")));
    let mappings: ReturnType<typeof parseDatasetMappingLines>;
    try {
      mappings = parseDatasetMappingLines(String(form.get("indicators") ?? ""));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Indicator mappings are invalid.");
      return;
    }
    const start = String(form.get("coverageStartYear") || "");
    const end = String(form.get("coverageEndYear") || "");
    const body: import("@/lib/api").DatasetWrite = {
      name: String(form.get("name") ?? ""),
      slug,
      sourceId: String(form.get("sourceId") ?? ""),
      description: String(form.get("description") ?? ""),
      sourceUrl: String(form.get("sourceUrl") ?? ""),
      citation: String(form.get("citation") ?? ""),
      licenseName: String(form.get("licenseName") ?? ""),
      licenseUrl: String(form.get("licenseUrl") ?? ""),
      methodology: String(form.get("methodology") ?? ""),
      frequency: String(form.get("frequency") ?? ""),
      publishedAt: String(form.get("publishedAt") || "") || null,
      coverageStartYear: start ? Number(start) : null,
      coverageEndYear: end ? Number(end) : null,
      active: form.get("active") === "on",
      indicators: mappings,
    };
    try {
      await api.saveDataset(body, editing.id ? editing.slug : undefined);
      await client.invalidateQueries({ queryKey: ["admin", "datasets"] });
      await client.invalidateQueries({ queryKey: ["datasets"] });
      setEditing(null);
      setNotice("Dataset saved to the backend.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dataset could not be saved.");
    }
  }
  function begin(dataset?: import("@/lib/api").DatasetApi) {
    setError("");
    setEditing(
      dataset ?? {
        id: "",
        slug: "",
        name: "",
        description: "",
        source: { id: "", name: "", abbreviation: "" },
        sourceUrl: "",
        citation: "",
        licenseName: "",
        licenseUrl: "",
        methodology: "",
        frequency: "",
        publishedAt: null,
        coverageStartYear: null,
        coverageEndYear: null,
        status: "DRAFT",
        indicators: [],
      },
    );
  }
  return (
    <AdminLayout
      title="Datasets"
      description="Maintain backend dataset provenance and indicator mappings. Actual health values are imported separately."
    >
      <AdminPageHeading
        title="Dataset registry"
        description={`${datasets.data?.length ?? 0} datasets.`}
        action={<Button onClick={() => begin()}>New dataset</Button>}
      />
      {notice && (
        <p role="status" className="mb-3 text-sm text-primary">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {datasets.isLoading ? (
        <p>Loading datasets…</p>
      ) : datasets.isError ? (
        <p role="alert">Datasets could not be loaded.</p>
      ) : (
        <div className="grid gap-3">
          {(datasets.data ?? []).map((item) => (
            <article key={item.slug} className={`${panel} flex flex-wrap justify-between gap-3`}>
              <div>
                <p className="text-xs font-bold uppercase text-primary">
                  {item.status} · {item.source.name}
                </p>
                <h2 className="font-display text-lg font-bold">{item.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.indicators.length} indicator mappings ·{" "}
                  {item.frequency || "Frequency unspecified"}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => begin(item)}>
                Edit
              </Button>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground/40 p-3">
          <form
            onSubmit={(event) => void save(event)}
            className="mx-auto my-6 grid max-w-3xl gap-3 rounded-2xl bg-card p-5"
          >
            <div className="flex justify-between">
              <h2 className="font-display text-2xl font-bold">Dataset details</h2>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                Close
              </Button>
            </div>
            {[
              ["name", editing.name],
              ["slug", editing.slug],
              ["sourceUrl", editing.sourceUrl],
              ["citation", editing.citation],
              ["licenseName", editing.licenseName],
              ["licenseUrl", editing.licenseUrl],
              ["frequency", editing.frequency],
              ["publishedAt", editing.publishedAt ?? ""],
              ["coverageStartYear", String(editing.coverageStartYear ?? "")],
              ["coverageEndYear", String(editing.coverageEndYear ?? "")],
            ].map(([name, value]) => (
              <label key={name} className="grid gap-1 text-sm">
                {name}
                <input name={name} className={input} defaultValue={value} />
              </label>
            ))}
            <label className="grid gap-1 text-sm">
              Source organization
              <select required name="sourceId" className={input} defaultValue={editing.source.id}>
                <option value="">Select source</option>
                {(sources.data ?? []).map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Methodology
              <textarea name="methodology" className={area} defaultValue={editing.methodology} />
            </label>
            <label className="grid gap-1 text-sm">
              Description
              <textarea name="description" className={area} defaultValue={editing.description} />
            </label>
            <label className="grid gap-1 text-sm">
              Indicator mappings, one per line: canonical indicator slug | source indicator code |
              source indicator name | source unit
              <textarea
                required
                name="indicators"
                className={area}
                defaultValue={editing.indicators
                  .map(
                    (row) =>
                      `${row.indicatorId} | ${row.originalIndicatorCode ?? ""} | ${row.originalIndicatorName} | ${row.originalUnit}`,
                  )
                  .join("\n")}
              />
              <span className="text-xs text-muted-foreground">
                Leave the source code blank only when the source has no code; available slugs:{" "}
                {(indicators.data ?? []).map((item) => item.slug).join(", ")}
              </span>
            </label>
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editing.status === "ACTIVE" || !editing.id}
              />{" "}
              Publish dataset
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save dataset</Button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
