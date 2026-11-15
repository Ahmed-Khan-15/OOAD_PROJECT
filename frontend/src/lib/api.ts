/** Typed client for the Spring Boot API. All browser requests share cookies and CSRF handling. */
const API_BASE = (
  import.meta.env["VITE_API_BASE_URL"] ||
  (import.meta.env.SSR ? "http://localhost:8081/api/v1" : "/api/v1")
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };
let csrf: { headerName: string; token: string } | null = null;

async function getCsrf() {
  if (!csrf) csrf = await request<{ headerName: string; token: string }>("/admin/auth/csrf");
  return csrf;
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const { body: _requestBody, ...requestOptions } = options;
  const headers = new Headers(options.headers);
  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await getCsrf();
    headers.set(token.headerName, token.token);
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
    method,
    ...(body === undefined ? {} : { body }),
    headers,
    credentials: "include",
  });
  if (response.status === 403 && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    csrf = null;
    const token = await getCsrf();
    headers.set(token.headerName, token.token);
    response = await fetch(`${API_BASE}${path}`, {
      ...requestOptions,
      method,
      ...(body === undefined ? {} : { body }),
      headers,
      credentials: "include",
    });
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      path.startsWith("/admin/") &&
      !path.endsWith("/auth/login") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("ghe:session-expired"));
    }
    const problem = (await response.json().catch(() => ({}))) as {
      detail?: string;
      title?: string;
      errors?: Record<string, string>;
    };
    throw new ApiError(
      problem.detail || problem.title || `Request failed (${response.status})`,
      response.status,
      problem.errors,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.size ? `?${params}` : "";
};

export type CountryApi = {
  id: string;
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  active: boolean;
};
export type TopicApi = {
  id: string;
  slug: string;
  name: string;
  description: string;
  overview: boolean;
  displayOrder: number;
  active: boolean;
  indicatorIds: string[];
};
export type IndicatorApi = {
  id: string;
  slug: string;
  name: string;
  description: string;
  unit: string;
  preferredDirection: string;
  topic: { id: string; name: string };
  active: boolean;
  observationsAvailable: boolean;
};
export type ObservationApi = {
  country: { id: string; name: string };
  indicator: { id: string; name: string; unit: string; topicId: string };
  dataset: {
    id: string;
    name: string;
    sourceId: string;
    sourceName: string;
    sourceUrl: string;
    citation: string;
    licenseName: string;
    frequency: string;
  };
  year: number;
  value: number;
  dimensions: Record<string, unknown>;
  valueStatus: string;
  uncertaintyLower: number | null;
  uncertaintyUpper: number | null;
  note: string | null;
};
export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};
export type ArticleApi = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: string;
  categorySlug: string;
  tags: string[];
  publishedAt: string | null;
  updatedAt: string;
  readingMinutes: number | null;
  status: string;
  coverImage: string;
  introduction: string;
  content: string;
  references: { label: string; url: string }[];
  topicSlugs: string[];
  countryIds: string[];
  indicatorIds: string[];
  relatedArticleSlugs: string[];
};
export type GlossaryApi = {
  id: string;
  term: string;
  slug: string;
  definition: string;
  extendedExplanation: string;
  relatedTopicSlugs: string[];
  relatedArticleSlugs: string[];
  relatedIndicatorIds: string[];
  references: { label: string; url: string }[];
};
export type DatasetApi = {
  id: string;
  slug: string;
  name: string;
  description: string;
  source: { id: string; name: string; abbreviation: string };
  sourceUrl: string;
  citation: string;
  licenseName: string;
  licenseUrl: string;
  methodology: string;
  frequency: string;
  publishedAt: string | null;
  coverageStartYear: number | null;
  coverageEndYear: number | null;
  status: string;
  indicators: {
    indicatorId: string;
    indicatorName: string;
    unit: string;
    originalIndicatorCode: string;
    originalIndicatorName: string;
    originalUnit: string;
    conversionNotes: string;
    dimensionsDescription: string;
  }[];
};
export type SourceApi = {
  id: string;
  name: string;
  abbreviation: string;
  websiteUrl: string;
  description: string;
  active: boolean;
  datasetIds: string[];
};
export type SearchResultApi = { id: string; title: string; description: string; url: string };
export type SearchApi = {
  query: string;
  minimumQueryLength: number;
  perCategoryLimit: number;
  totalResults: number;
  countries: SearchResultApi[];
  topics: SearchResultApi[];
  indicators: SearchResultApi[];
  articles: SearchResultApi[];
  glossary: SearchResultApi[];
  datasets: SearchResultApi[];
  sources: SearchResultApi[];
};
export type DonationReceiptApi = {
  reference: string;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  createdAt: string;
  simulated: boolean;
  receiptMessage: string;
};
export type DonationAdminApi = {
  reference: string;
  donorName: string;
  email: string;
  amount: number;
  currency: string;
  frequency: string;
  anonymous: boolean;
  status: string;
  createdAt: string;
  simulated: boolean;
};
export type DonationSummaryApi = {
  donationCount: number;
  simulatedTotal: number;
  currency: string;
  oneTimeCount: number;
  monthlyCommitmentCount: number;
  simulatedSuccessCount: number;
  simulated: boolean;
};
export type ImportApi = {
  datasetId: string;
  status: string;
  filename: string;
  checksum: string;
  startedAt: string;
  completedAt: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  summary: string;
  errors: { rowNumber: number; code: string; message: string; rawRow: Record<string, unknown> }[];
};
export type AdminSessionApi = { email: string; displayName: string };

export const api = {
  countries: () => request<CountryApi[]>("/countries"),
  country: (id: string) => request<CountryApi>(`/countries/${encodeURIComponent(id)}`),
  topics: () => request<TopicApi[]>("/topics"),
  topic: (slug: string) => request<TopicApi>(`/topics/${encodeURIComponent(slug)}`),
  indicators: () => request<IndicatorApi[]>("/indicators"),
  observations: (
    filters: {
      country?: string;
      indicator?: string;
      dataset?: string;
      fromYear?: number;
      toYear?: number;
      page?: number;
      size?: number;
    } = {},
  ) => request<Page<ObservationApi>>(`/observations${query(filters)}`),
  datasets: () => request<DatasetApi[]>("/datasets"),
  sources: () => request<SourceApi[]>("/sources"),
  articles: (filters: { category?: string; tag?: string; page?: number; size?: number } = {}) =>
    request<Page<ArticleApi>>(`/articles${query(filters)}`),
  article: (slug: string) => request<ArticleApi>(`/articles/${encodeURIComponent(slug)}`),
  glossary: (filters: { q?: string; page?: number; size?: number } = {}) =>
    request<Page<GlossaryApi>>(`/glossary${query(filters)}`),
  glossaryTerm: (slug: string) => request<GlossaryApi>(`/glossary/${encodeURIComponent(slug)}`),
  search: (q: string) => request<SearchApi>(`/search${query({ q })}`),
  donate: (data: {
    donorName: string;
    email: string;
    amount: number;
    frequency: "ONCE" | "MONTHLY";
    anonymous: boolean;
  }) => request<DonationReceiptApi>("/donations", { method: "POST", body: data }),
  login: async (email: string, password: string) => {
    csrf = null;
    await getCsrf();
    return request<AdminSessionApi>("/admin/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },
  session: () => request<AdminSessionApi>("/admin/auth/me"),
  logout: () => request<void>("/admin/auth/logout", { method: "POST" }),
  adminArticles: (filters: { page?: number; size?: number } = {}) =>
    request<Page<ArticleApi>>(`/admin/articles${query(filters)}`),
  saveArticle: (data: ArticleWrite, slug?: string) =>
    request<ArticleApi>(slug ? `/admin/articles/${encodeURIComponent(slug)}` : "/admin/articles", {
      method: slug ? "PUT" : "POST",
      body: data,
    }),
  deleteArticle: (slug: string) =>
    request<void>(`/admin/articles/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  adminGlossary: (filters: { q?: string; page?: number; size?: number } = {}) =>
    request<Page<GlossaryApi>>(`/admin/glossary${query(filters)}`),
  saveGlossary: (data: GlossaryWrite, slug?: string) =>
    request<GlossaryApi>(slug ? `/admin/glossary/${encodeURIComponent(slug)}` : "/admin/glossary", {
      method: slug ? "PUT" : "POST",
      body: data,
    }),
  deleteGlossary: (slug: string) =>
    request<void>(`/admin/glossary/${encodeURIComponent(slug)}`, { method: "DELETE" }),
  adminDatasets: () => request<DatasetApi[]>("/admin/datasets"),
  saveDataset: (data: DatasetWrite, slug?: string) =>
    request<DatasetApi>(slug ? `/admin/datasets/${encodeURIComponent(slug)}` : "/admin/datasets", {
      method: slug ? "PUT" : "POST",
      body: data,
    }),
  importCsv: (slug: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<ImportApi>(`/admin/datasets/${encodeURIComponent(slug)}/imports`, {
      method: "POST",
      body: form,
    });
  },
  imports: (slug: string) =>
    request<ImportApi[]>(`/admin/datasets/${encodeURIComponent(slug)}/imports`),
  adminDonations: (filters: { page?: number; size?: number } = {}) =>
    request<Page<DonationAdminApi>>(`/admin/donations${query(filters)}`),
  adminDonation: (reference: string) =>
    request<DonationAdminApi>(`/admin/donations/${encodeURIComponent(reference)}`),
  donationSummary: () => request<DonationSummaryApi>("/admin/donations/summary"),
};

export type ArticleWrite = Omit<ArticleApi, "id" | "updatedAt" | "category">;
export type GlossaryWrite = Omit<GlossaryApi, "id" | "createdAt" | "updatedAt"> & {
  extendedExplanation?: string;
  relatedTermSlugs?: string[];
};
export type DatasetWrite = {
  name: string;
  slug: string;
  sourceId: string;
  description: string;
  sourceUrl: string;
  citation: string;
  licenseName: string;
  licenseUrl: string;
  methodology: string;
  frequency: string;
  publishedAt: string | null;
  coverageStartYear: number | null;
  coverageEndYear: number | null;
  active: boolean;
  indicators: {
    indicatorSlug: string;
    originalIndicatorCode: string;
    originalIndicatorName: string;
    originalUnit: string;
    conversionNotes: string;
    dimensionsDescription: string;
  }[];
};
