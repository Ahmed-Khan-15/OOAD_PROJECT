import { Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  Database,
  FileUp,
  Globe2,
  Plus,
  Search,
  Trash2,
  Pencil,
  ToggleLeft,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AdminLayout, AdminPageHeading } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import {
  saveCountries,
  saveHealthRecords,
  saveSources,
  saveTopics,
  getAdminCounts,
  getAdminData,
} from "@/data/admin-data";
import {
  type Country,
  type DataSource,
  type HealthRecord,
  type Indicator,
  type Topic,
} from "@/data/health";

type EntityKind = "countries" | "topics" | "indicators" | "records" | "sources";
type Field = {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "number" | "email" | "url" | "textarea" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
};
type RowData = {
  [key: string]: unknown;
  id?: string;
  name?: string;
  title?: string;
  region?: string;
  isoCode?: string;
  flag?: string;
  intro?: string;
  active?: boolean;
  slug?: string;
  shortDescription?: string;
  whyItMatters?: string;
  introduction?: string;
  lifeImpact?: string;
  color?: Topic["color"];
  icon?: string;
  indicators?: Indicator[];
  related?: string[];
  topicSlug?: string;
  unit?: string;
  description?: string;
  howToRead?: string;
  sourceId?: string;
  countryId?: string;
  indicatorId?: string;
  year?: number | string;
  value?: number | string;
  source?: string;
  notes?: string;
  dimensions?: string | Record<string, string>;
  organization?: string;
  url?: string;
  citation?: string;
  license?: string;
};

const cardClass = "rounded-xl border border-border bg-card";
const inputClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textAreaClass =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dimensionsKey(dimensions: Record<string, string> = {}) {
  return Object.entries(dimensions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key.trim().toLowerCase()}=${value.trim().toLowerCase()}`)
    .join("&");
}

function recordKey(
  record: Pick<HealthRecord, "countryId" | "indicatorId" | "year" | "dimensions">,
) {
  return `${record.countryId}|${record.indicatorId}|${record.year}|${dimensionsKey(record.dimensions)}`;
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        aria-label={field.label}
        required={field.required}
        disabled={field.disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className={textAreaClass}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        aria-label={field.label}
        required={field.required}
        disabled={field.disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">Select…</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      aria-label={field.label}
      required={field.required}
      disabled={field.disabled}
      type={field.type ?? "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      className={inputClass}
    />
  );
}

function DataEditor({
  title,
  fields,
  initial,
  onSave,
  onCancel,
}: {
  title: string;
  fields: Field[];
  initial: RowData;
  onSave: (values: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((field) => [field.name, String(initial[field.name] ?? "")])),
  );
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      onSave(values);
      setError("");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "The item could not be saved.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-foreground/35 p-4">
      <form
        onSubmit={submit}
        className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Workspace data
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
          </div>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label
              key={field.name}
              className={`grid gap-1.5 text-sm font-semibold ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              {field.label}
              <FieldControl
                field={field}
                value={values[field.name] ?? ""}
                onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
              />
            </label>
          ))}
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </div>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Globe2;
  hint: string;
}) {
  return (
    <div className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold">{value.toLocaleString()}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function AdminDashboard() {
  const data = getAdminData();
  const counts = getAdminCounts();
  const byTopic = data.topics.map((topic) => ({
    title: topic.title,
    count: data.healthRecords.filter((record) =>
      topic.indicators.some((indicator) => indicator.id === record.indicatorId),
    ).length,
  }));
  const maximum = Math.max(1, ...byTopic.map((item) => item.count));
  const latest = data.healthRecords
    .filter((record) => record.createdAt)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5);
  const quickLinks = [
    {
      to: "/admin/countries",
      title: "Manage countries",
      icon: Globe2,
      text: "Regions, flags, and profile descriptions",
    },
    {
      to: "/admin/indicators",
      title: "Manage indicators",
      icon: Activity,
      text: "Units, topic relationships, and notes",
    },
    {
      to: "/admin/records",
      title: "Manage records",
      icon: BarChart3,
      text: "Yearly values and optional dimensions",
    },
    {
      to: "/admin/import",
      title: "Import a CSV",
      icon: FileUp,
      text: "Validate a structured CSV before importing",
    },
  ] as const;

  return (
    <AdminLayout
      title="Overview"
      description="A concise snapshot of the browser-based public health data workspace."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <CountCard
          label="Countries"
          value={counts.countries}
          icon={Globe2}
          hint="Across the country directory"
        />
        <CountCard
          label="Topics"
          value={counts.topics}
          icon={BookOpen}
          hint="Learning areas available"
        />
        <CountCard
          label="Indicators"
          value={counts.indicators}
          icon={Activity}
          hint="Measures across all topics"
        />
        <CountCard
          label="Health records"
          value={counts.healthRecords}
          icon={BarChart3}
          hint="Illustrative and admin-added observations"
        />
        <CountCard
          label="Data sources"
          value={counts.sources}
          icon={Database}
          hint="Source directory entries"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Data coverage
              </p>
              <h2 className="mt-1 font-display text-xl font-bold">Records by topic</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              Rows, not a measure of completeness
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {byTopic.map((item) => (
              <div
                key={item.title}
                className="grid grid-cols-[minmax(100px,160px)_1fr_42px] items-center gap-3"
              >
                <span className="truncate text-xs text-muted-foreground">{item.title}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(item.count / maximum) * 100}%` }}
                  />
                </div>
                <span className="text-right text-xs font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
        <section className={`${cardClass} p-5 sm:p-6`}>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Recently added</p>
          <h2 className="mt-1 font-display text-xl font-bold">Latest record updates</h2>
          {latest.length ? (
            <div className="mt-4 divide-y divide-border">
              {latest.map((record, index) => {
                const country = data.countries.find((item) => item.id === record.countryId);
                const indicator = data.topics
                  .flatMap((topic) => topic.indicators)
                  .find((item) => item.id === record.indicatorId);
                return (
                  <div key={`${recordKey(record)}-${index}`} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold">
                      {country?.name ?? record.countryId} · {record.year}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {indicator?.name ?? record.indicatorId} · {record.value} {indicator?.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No administrator-added records yet. The initial teaching examples are not marked as
              new updates.
            </p>
          )}
        </section>
      </div>

      <section className="mt-8">
        <AdminPageHeading
          title="Quick access"
          description="Jump directly to a common administration task."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map(({ to, title, icon: Icon, text }) => (
            <Link
              key={to}
              to={to}
              className={`${cardClass} group p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm`}
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
                <Icon size={18} />
              </div>
              <h3 className="mt-4 font-display font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                Open section <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <p className="mt-8 rounded-xl border border-primary/15 bg-secondary/60 p-4 text-sm leading-6 text-secondary-foreground">
        The initial numeric data is synthetic teaching material. Source directory entries are
        examples and are not evidence that datasets from those organizations have been imported.
      </p>
    </AdminLayout>
  );
}

const pageConfig: Record<EntityKind, { title: string; description: string }> = {
  countries: {
    title: "Countries",
    description: "Maintain the countries shown in public country browsing and comparisons.",
  },
  topics: {
    title: "Topics",
    description: "Edit public-facing health topic explanations and their indicator relationships.",
  },
  indicators: {
    title: "Indicators",
    description: "Manage indicator definitions, units, topic links, and source references.",
  },
  records: {
    title: "Health records",
    description: "Maintain yearly values, source references, and optional observation dimensions.",
  },
  sources: {
    title: "Data sources",
    description: "Keep source details and citation guidance together for future data integrations.",
  },
};

function fieldsFor(kind: EntityKind, data: ReturnType<typeof getAdminData>): Field[] {
  if (kind === "countries") {
    return [
      { name: "id", label: "Country ID", required: true },
      { name: "name", label: "Country name", required: true },
      { name: "region", label: "Region", required: true },
      { name: "isoCode", label: "ISO country code", placeholder: "e.g. PAK" },
      { name: "flag", label: "Flag or emoji", placeholder: "🇵🇰" },
      { name: "intro", label: "Description", type: "textarea", required: true },
    ];
  }
  if (kind === "topics") {
    return [
      { name: "title", label: "Topic name", required: true },
      { name: "slug", label: "Topic slug", required: true },
      { name: "shortDescription", label: "Short description", type: "textarea", required: true },
      { name: "whyItMatters", label: "Why it matters", type: "textarea", required: true },
      { name: "introduction", label: "Introduction", type: "textarea" },
    ];
  }
  if (kind === "indicators") {
    return [
      { name: "name", label: "Indicator name", required: true },
      {
        name: "topicSlug",
        label: "Health topic",
        type: "select",
        required: true,
        options: data.topics.map((topic) => ({ label: topic.title, value: topic.slug })),
      },
      { name: "unit", label: "Measurement unit", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "howToRead", label: "Methodology / explanatory notes", type: "textarea" },
      {
        name: "sourceId",
        label: "Data source",
        type: "select",
        options: data.sources.map((source) => ({ label: source.name, value: source.id })),
      },
    ];
  }
  if (kind === "records") {
    return [
      {
        name: "countryId",
        label: "Country",
        type: "select",
        required: true,
        options: data.countries.map((country) => ({ label: country.name, value: country.id })),
      },
      {
        name: "indicatorId",
        label: "Indicator",
        type: "select",
        required: true,
        options: data.topics.flatMap((topic) =>
          topic.indicators.map((indicator) => ({
            label: `${indicator.name} · ${topic.title}`,
            value: indicator.id,
          })),
        ),
      },
      { name: "year", label: "Reference year", type: "number", required: true },
      { name: "value", label: "Numerical value", type: "number", required: true },
      {
        name: "sourceId",
        label: "Data source",
        type: "select",
        options: data.sources.map((source) => ({ label: source.name, value: source.id })),
      },
      { name: "notes", label: "Notes", type: "textarea" },
      {
        name: "dimensions",
        label: "Optional dimensions (JSON)",
        type: "textarea",
        placeholder: '{"sex":"female","ageGroup":"65+"}',
      },
    ];
  }
  return [
    { name: "name", label: "Source name", required: true },
    { name: "organization", label: "Organization", required: true },
    { name: "url", label: "URL", type: "url", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "citation", label: "Attribution / citation", type: "textarea" },
    { name: "license", label: "License / reuse information", type: "textarea" },
  ];
}

function initialValues(kind: EntityKind, item?: RowData): RowData {
  if (item) return item;
  if (kind === "countries") return { id: "", flag: "🌐", active: true };
  if (kind === "topics")
    return { color: "sea", icon: "globe", lifeImpact: "", related: [], active: true };
  if (kind === "indicators") return { hasIllustrativeData: false };
  if (kind === "records") return { year: new Date().getFullYear(), dimensions: "{}" };
  return { active: true };
}

function toCountryRow(country: Country): RowData {
  return { ...country };
}

function toTopicRow(topic: Topic): RowData {
  return { ...topic };
}

function toIndicatorRow(topic: Topic, indicator: Indicator): RowData {
  return { ...indicator, topicSlug: topic.slug };
}

function toRecordRow(record: HealthRecord): RowData {
  return { ...record, dimensions: JSON.stringify(record.dimensions ?? {}, null, 2) };
}

function toSourceRow(source: DataSource): RowData {
  return { ...source };
}

export function AdminEntityPage({ kind }: { kind: EntityKind }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [editor, setEditor] = useState<{ item?: RowData; key?: string } | null>(null);
  const [notice, setNotice] = useState("");
  const data = getAdminData();
  const config = pageConfig[kind];
  const fields = useMemo(() => fieldsFor(kind, data), [kind, data]);
  const editorFields =
    kind === "countries" && editor?.key
      ? fields.map((field) => (field.name === "id" ? { ...field, disabled: true } : field))
      : fields;
  const allRows = useMemo(() => {
    if (kind === "countries")
      return data.countries.map((item) => ({ row: toCountryRow(item), key: item.id }));
    if (kind === "topics")
      return data.topics.map((item) => ({ row: toTopicRow(item), key: item.slug }));
    if (kind === "indicators")
      return data.topics.flatMap((topic) =>
        topic.indicators.map((item) => ({ row: toIndicatorRow(topic, item), key: item.id })),
      );
    if (kind === "records")
      return data.healthRecords.map((item, index) => ({
        row: toRecordRow(item),
        key: `${recordKey(item)}|${index}`,
      }));
    return data.sources.map((item) => ({ row: toSourceRow(item), key: item.id }));
  }, [data, kind]);

  const visibleRows = allRows.filter(({ row }) => {
    const text = Object.values(row)
      .map((value) => String(value ?? ""))
      .join(" ")
      .toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    if (!matchesQuery) return false;
    if (kind === "records" && filter) {
      return (
        String(row.countryId) === filter ||
        String(row.indicatorId) === filter ||
        String(row.year) === filter
      );
    }
    if (kind === "indicators" && filter) return String(row.topicSlug) === filter;
    if (kind === "countries" && filter) return String(row.active) === filter;
    return true;
  });

  const openNew = () => setEditor({ item: initialValues(kind) });
  const openEdit = (row: RowData, key: string) => setEditor({ item: row, key });

  const save = (values: Record<string, string>) => {
    if (!editor) return;
    const now = new Date().toISOString();
    if (kind === "countries") {
      const id = editor.key ?? slugify(values["id"] || values["name"] || "");
      if (!id) throw new Error("Country name must contain letters or numbers.");
      if (!editor.key && data.countries.some((country) => country.id === id))
        throw new Error("A country with this ID already exists.");
      const country: Country = {
        id,
        name: (values["name"] ?? "").trim(),
        region: (values["region"] ?? "").trim(),
        isoCode: (values["isoCode"] ?? "").trim().toUpperCase(),
        flag: (values["flag"] ?? "").trim() || "🌐",
        intro: (values["intro"] ?? "").trim(),
        active: editor.key
          ? (data.countries.find((item) => item.id === editor.key)?.active ?? true)
          : true,
      };
      saveCountries(
        editor.key
          ? data.countries.map((item) => (item.id === editor.key ? country : item))
          : [...data.countries, country],
      );
    } else if (kind === "topics") {
      const slug = slugify(values["slug"] ?? "");
      if (!slug) throw new Error("Topic slug must contain letters or numbers.");
      if (!editor.key && data.topics.some((topic) => topic.slug === slug))
        throw new Error("A topic with this slug already exists.");
      const previous = data.topics.find((topic) => topic.slug === editor.key);
      const topic: Topic = {
        slug,
        title: (values["title"] ?? "").trim(),
        shortDescription: (values["shortDescription"] ?? "").trim(),
        introduction:
          (values["introduction"] ?? "").trim() || (values["shortDescription"] ?? "").trim(),
        whyItMatters: (values["whyItMatters"] ?? "").trim(),
        lifeImpact: previous?.lifeImpact ?? "",
        color: previous?.color ?? "sea",
        icon: previous?.icon ?? "globe",
        indicators: previous?.indicators ?? [],
        related: previous?.related ?? [],
        active: previous?.active ?? true,
      };
      saveTopics(
        editor.key
          ? data.topics.map((item) =>
              item.slug === editor.key
                ? topic
                : {
                    ...item,
                    related: item.related.map((relatedSlug) =>
                      relatedSlug === editor.key ? slug : relatedSlug,
                    ),
                  },
            )
          : [...data.topics, topic],
      );
    } else if (kind === "indicators") {
      const topic = data.topics.find((item) => item.slug === values["topicSlug"]);
      if (!topic) throw new Error("Choose an existing topic.");
      const previousTopic = data.topics.find((item) =>
        item.indicators.some((indicator) => indicator.id === editor.key),
      );
      const oldIndicator = previousTopic?.indicators.find((item) => item.id === editor.key);
      const id = editor.key ?? slugify(values["name"] ?? "");
      if (!id) throw new Error("Indicator name must contain letters or numbers.");
      if (
        !editor.key &&
        data.topics.some((item) => item.indicators.some((indicator) => indicator.id === id))
      )
        throw new Error("An indicator with this ID already exists.");
      const updated: Indicator = {
        id,
        name: (values["name"] ?? "").trim(),
        unit: (values["unit"] ?? "").trim(),
        description: (values["description"] ?? "").trim(),
        howToRead: (values["howToRead"] ?? "").trim(),
        hasIllustrativeData: oldIndicator?.hasIllustrativeData ?? false,
        active: oldIndicator?.active ?? true,
        ...(values["sourceId"] ? { sourceId: values["sourceId"] } : {}),
      };
      const updatedTopics = data.topics.map((item) => {
        const withoutIndicator = item.indicators.filter((indicator) => indicator.id !== editor.key);
        if (item.slug === topic.slug)
          return { ...item, indicators: [...withoutIndicator, updated] };
        return { ...item, indicators: withoutIndicator };
      });
      saveTopics(updatedTopics);
    } else if (kind === "records") {
      const year = Number(values["year"]);
      const value = Number(values["value"]);
      if (!Number.isInteger(year) || year < 1800 || year > 2200)
        throw new Error("Enter a valid reference year between 1800 and 2200.");
      if (!(values["value"] ?? "").trim() || !Number.isFinite(value))
        throw new Error("Value must be a valid number.");
      let dimensions: Record<string, string>;
      try {
        const parsed: unknown = JSON.parse(values["dimensions"] || "{}");
        if (
          !parsed ||
          typeof parsed !== "object" ||
          Array.isArray(parsed) ||
          Object.values(parsed).some((entry) => typeof entry !== "string")
        ) {
          throw new Error("Dimensions must be a JSON object with string values.");
        }
        dimensions = parsed as Record<string, string>;
      } catch {
        throw new Error('Dimensions must be valid JSON, for example {"sex":"female"}.');
      }
      const record: HealthRecord = {
        countryId: values["countryId"] ?? "",
        indicatorId: values["indicatorId"] ?? "",
        year,
        value,
        source:
          data.sources.find((source) => source.id === values["sourceId"])?.name ??
          "Unspecified source",
        ...(values["sourceId"] ? { sourceId: values["sourceId"] } : {}),
        ...((values["notes"] ?? "").trim() ? { notes: (values["notes"] ?? "").trim() } : {}),
        dimensions,
        ...((
          editor.key
            ? data.healthRecords.find((item, index) => `${recordKey(item)}|${index}` === editor.key)
                ?.createdAt
            : now
        )
          ? {
              createdAt: editor.key
                ? (data.healthRecords.find(
                    (item, index) => `${recordKey(item)}|${index}` === editor.key,
                  )?.createdAt ?? now)
                : now,
            }
          : {}),
        updatedAt: now,
      };
      const duplicate = data.healthRecords.some((item, index) => {
        const key = `${recordKey(item)}|${index}`;
        return key !== editor.key && recordKey(item) === recordKey(record);
      });
      if (duplicate)
        throw new Error(
          "An observation already exists for this country, indicator, year, and dimension combination.",
        );
      saveHealthRecords(
        editor.key
          ? data.healthRecords.map((item, index) =>
              `${recordKey(item)}|${index}` === editor.key ? record : item,
            )
          : [...data.healthRecords, record],
      );
    } else {
      const id = editor.key ?? slugify(values["name"] ?? "");
      if (!id) throw new Error("Source name must contain letters or numbers.");
      if (!editor.key && data.sources.some((source) => source.id === id))
        throw new Error("A source with this ID already exists.");
      const source: DataSource = {
        id,
        name: (values["name"] ?? "").trim(),
        organization: (values["organization"] ?? "").trim(),
        url: (values["url"] ?? "").trim(),
        description: (values["description"] ?? "").trim(),
        citation: (values["citation"] ?? "").trim(),
        license: (values["license"] ?? "").trim(),
        active: data.sources.find((item) => item.id === editor.key)?.active ?? true,
      };
      saveSources(
        editor.key
          ? data.sources.map((item) => (item.id === editor.key ? source : item))
          : [...data.sources, source],
      );
    }
    setEditor(null);
    setNotice("Changes saved in this browser.");
  };

  const remove = (key: string) => {
    if (!window.confirm("Delete this item? This action cannot be undone.")) return;
    if (kind === "countries") {
      if (data.healthRecords.some((record) => record.countryId === key)) {
        setNotice("This country has health records and cannot be deleted. Deactivate it instead.");
        return;
      }
      saveCountries(data.countries.filter((item) => item.id !== key));
    } else if (kind === "topics") {
      const topic = data.topics.find((item) => item.slug === key);
      if (
        topic?.indicators.some((indicator) =>
          data.healthRecords.some((record) => record.indicatorId === indicator.id),
        )
      ) {
        setNotice("This topic contains indicators with records and cannot be deleted.");
        return;
      }
      saveTopics(
        data.topics
          .filter((item) => item.slug !== key)
          .map((item) => ({
            ...item,
            related: item.related.filter((relatedSlug) => relatedSlug !== key),
          })),
      );
    } else if (kind === "indicators") {
      if (data.healthRecords.some((record) => record.indicatorId === key)) {
        setNotice("This indicator has health records and cannot be deleted.");
        return;
      }
      saveTopics(
        data.topics.map((topic) => ({
          ...topic,
          indicators: topic.indicators.filter((indicator) => indicator.id !== key),
        })),
      );
    } else if (kind === "records") {
      const index = Number(key.split("|").at(-1));
      saveHealthRecords(data.healthRecords.filter((_, itemIndex) => itemIndex !== index));
    } else {
      if (
        data.topics.some((topic) =>
          topic.indicators.some((indicator) => indicator.sourceId === key),
        ) ||
        data.healthRecords.some((record) => record.sourceId === key)
      ) {
        setNotice("This source is referenced by data and cannot be deleted.");
        return;
      }
      saveSources(data.sources.filter((source) => source.id !== key));
    }
    setNotice("Item deleted.");
  };

  const toggleActive = (key: string) => {
    if (kind === "countries")
      saveCountries(
        data.countries.map((item) => (item.id === key ? { ...item, active: !item.active } : item)),
      );
    else if (kind === "topics")
      saveTopics(
        data.topics.map((item) =>
          item.slug === key ? { ...item, active: item.active === false } : item,
        ),
      );
    else if (kind === "indicators")
      saveTopics(
        data.topics.map((topic) => ({
          ...topic,
          indicators: topic.indicators.map((indicator) =>
            indicator.id === key ? { ...indicator, active: indicator.active === false } : indicator,
          ),
        })),
      );
    else if (kind === "sources")
      saveSources(
        data.sources.map((item) => (item.id === key ? { ...item, active: !item.active } : item)),
      );
  };

  return (
    <AdminLayout
      title={config.title}
      description={config.description}
      action={
        <Button size="sm" onClick={openNew}>
          <Plus size={16} /> Add{" "}
          {kind === "countries"
            ? "country"
            : kind === "topics"
              ? "topic"
              : kind === "indicators"
                ? "indicator"
                : kind === "records"
                  ? "record"
                  : "source"}
        </Button>
      }
    >
      <div className={`${cardClass} p-4`}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Search size={16} className="shrink-0 text-muted-foreground" />
            <input
              aria-label={`Search ${config.title.toLowerCase()}`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search records…"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          {kind === "countries" && (
            <select
              aria-label="Filter by status"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClass}
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          )}
          {kind === "indicators" && (
            <select
              aria-label="Filter by topic"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClass}
            >
              <option value="">All topics</option>
              {data.topics.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {topic.title}
                </option>
              ))}
            </select>
          )}
          {kind === "records" && (
            <select
              aria-label="Filter records"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className={inputClass}
            >
              <option value="">All countries / indicators / years</option>
              {data.countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
              {data.topics.flatMap((topic) =>
                topic.indicators.map((indicator) => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.name}
                  </option>
                )),
              )}
              {Array.from(new Set(data.healthRecords.map((record) => record.year)))
                .sort((a, b) => b - a)
                .map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
            </select>
          )}
        </div>
        {notice && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground"
          >
            {notice}
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-3 font-semibold">
                  {kind === "records"
                    ? "Country / observation"
                    : kind === "sources"
                      ? "Source"
                      : kind === "indicators"
                        ? "Indicator"
                        : kind === "topics"
                          ? "Topic"
                          : "Country"}
                </th>
                <th className="px-3 py-3 font-semibold">
                  {kind === "records"
                    ? "Indicator"
                    : kind === "topics"
                      ? "Slug / indicators"
                      : kind === "sources"
                        ? "Organization"
                        : kind === "indicators"
                          ? "Topic / unit"
                          : "Region / code"}
                </th>
                <th className="px-3 py-3 font-semibold">
                  {kind === "records" ? "Year / value" : "Status / details"}
                </th>
                <th className="px-3 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ row, key }) => {
                const country = data.countries.find((item) => item.id === row.countryId);
                const indicator = data.topics
                  .flatMap((topic) => topic.indicators)
                  .find((item) => item.id === row.indicatorId);
                const topic =
                  kind === "indicators"
                    ? data.topics.find((item) => item.slug === row.topicSlug)
                    : undefined;
                const status = "active" in row ? Boolean(row.active) : true;
                return (
                  <tr key={key} className="border-b border-border/70 last:border-0">
                    <td className="max-w-[360px] px-3 py-3 align-top">
                      <p className="font-semibold">
                        {kind === "records"
                          ? (country?.name ?? row.countryId)
                          : kind === "sources"
                            ? row.name
                            : kind === "topics"
                              ? row.title
                              : kind === "indicators"
                                ? row.name
                                : `${row.flag ?? ""} ${row.name}`}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {kind === "records"
                          ? JSON.stringify(row.dimensions ?? {})
                          : kind === "indicators"
                            ? row.description
                            : kind === "topics"
                              ? row.shortDescription
                              : kind === "sources"
                                ? row.url
                                : row.id}
                      </p>
                    </td>
                    <td className="px-3 py-3 align-top text-muted-foreground">
                      {kind === "records"
                        ? (indicator?.name ?? row.indicatorId)
                        : kind === "topics"
                          ? `${row.slug} · ${data.topics.find((item) => item.slug === key)?.indicators.length ?? 0} indicators`
                          : kind === "sources"
                            ? row.organization
                            : kind === "indicators"
                              ? `${topic?.title ?? row.topicSlug} · ${row.unit}`
                              : `${row.region}${row.isoCode ? ` · ${row.isoCode}` : ""}`}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs ${status ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {kind === "records"
                          ? `${row.year} · ${row.value} ${indicator?.unit ?? ""}`
                          : status
                            ? "Active"
                            : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right align-top">
                      <div className="inline-flex items-center gap-1">
                        {(kind === "countries" ||
                          kind === "topics" ||
                          kind === "indicators" ||
                          kind === "sources") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`${status ? "Deactivate" : "Activate"} ${String(row.name ?? row.title)}`}
                            onClick={() => toggleActive(key)}
                          >
                            <ToggleLeft size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${String(row.name ?? row.title ?? key)}`}
                          onClick={() => openEdit(row, key)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${String(row.name ?? row.title ?? key)}`}
                          onClick={() => remove(key)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visibleRows.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No matching {config.title.toLowerCase()} found.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {visibleRows.length} of {allRows.length} items · Changes are stored in this browser.
        </p>
      </div>
      {editor && (
        <DataEditor
          title={`${editor.key ? "Edit" : "Add"} ${
            kind === "countries"
              ? "country"
              : kind === "topics"
                ? "topic"
                : kind === "indicators"
                  ? "indicator"
                  : kind === "records"
                    ? "health record"
                    : "data source"
          }`}
          fields={editorFields}
          initial={editor.item ?? {}}
          onSave={save}
          onCancel={() => setEditor(null)}
        />
      )}
    </AdminLayout>
  );
}
