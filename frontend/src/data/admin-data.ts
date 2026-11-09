import {
  countries,
  healthRecords,
  topics,
  type Country,
  type DataSource,
  type HealthRecord,
  type Topic,
} from "@/data/health";

const STORAGE_KEY = "global-health-explorer:data:v1";

export type AdminData = {
  countries: Country[];
  topics: Topic[];
  healthRecords: HealthRecord[];
  sources: DataSource[];
};

const initialSources: DataSource[] = [
  {
    id: "our-world-in-data",
    name: "Our World in Data",
    organization: "Global Change Data Lab",
    url: "https://ourworldindata.org/",
    description: "An example public data source; no dataset is imported by default.",
    citation: "Please cite the specific dataset and access date when used.",
    license: "Varies by dataset; verify before reuse.",
    active: true,
  },
  {
    id: "world-health-organization",
    name: "World Health Organization",
    organization: "World Health Organization",
    url: "https://www.who.int/data",
    description: "An example public health source; no dataset is imported by default.",
    citation: "Please cite the specific publication or dataset when used.",
    license: "See the applicable WHO terms.",
    active: true,
  },
  {
    id: "world-bank",
    name: "World Bank",
    organization: "World Bank",
    url: "https://data.worldbank.org/",
    description: "An example development indicator source; no dataset is imported by default.",
    citation: "Please cite the specific indicator and access date when used.",
    license: "See World Bank data terms.",
    active: true,
  },
  {
    id: "unicef",
    name: "UNICEF",
    organization: "United Nations Children's Fund",
    url: "https://data.unicef.org/",
    description: "An example child health source; no dataset is imported by default.",
    citation: "Please cite the specific UNICEF data product when used.",
    license: "See the applicable UNICEF terms.",
    active: true,
  },
  {
    id: "united-nations",
    name: "United Nations",
    organization: "United Nations",
    url: "https://data.un.org/",
    description: "An example international data source; no dataset is imported by default.",
    citation: "Please cite the relevant UN dataset and access date.",
    license: "See the applicable dataset terms.",
    active: true,
  },
];

const sources: DataSource[] = [...initialSources];
const listeners = new Set<() => void>();
let initialized = false;

function replaceContents<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

function reconcile<T>(
  target: T[],
  next: T[],
  keyOf: (item: T) => string,
  merge?: (existing: T, incoming: T) => void,
) {
  const previous = new Map(target.map((item) => [keyOf(item), item]));
  const reconciled = next.map((incoming) => {
    const existing = previous.get(keyOf(incoming));
    if (!existing) return incoming;
    if (merge) merge(existing, incoming);
    else if (existing && incoming && typeof existing === "object" && typeof incoming === "object") {
      Object.assign(existing, incoming);
    }
    return existing;
  });
  replaceContents(target, reconciled);
}

function reconcileTopics(next: Topic[]) {
  reconcile(
    topics,
    next,
    (topic) => topic.slug,
    (existing, incoming) => {
      const priorIndicators = existing.indicators;
      const nextIndicators = incoming.indicators;
      Object.assign(existing, incoming, { indicators: priorIndicators });
      reconcile(priorIndicators, nextIndicators, (item) => item.id);
    },
  );
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function getAdminData(): AdminData {
  return { countries, topics, healthRecords, sources };
}

export function subscribeAdminData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function initializeAdminData() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed: Partial<AdminData> = JSON.parse(stored);
    if (
      !Array.isArray(parsed.countries) ||
      !Array.isArray(parsed.topics) ||
      !Array.isArray(parsed.healthRecords) ||
      !Array.isArray(parsed.sources)
    ) {
      throw new Error("Stored admin data is missing a required collection.");
    }

    reconcile(countries, parsed.countries, (country) => country.id);
    reconcileTopics(parsed.topics);
    replaceContents(healthRecords, parsed.healthRecords);
    reconcile(sources, parsed.sources, (source) => source.id);
    notify();
  } catch (error) {
    console.error("Could not load saved Global Health Explorer data.", error);
    throw new Error(
      "Saved admin data could not be loaded. Clear the prototype data in browser storage and reload.",
      {
        cause: error,
      },
    );
  }
}

export function saveAdminData(next: AdminData) {
  if (typeof window === "undefined") {
    throw new Error("Admin data can only be changed in the browser prototype.");
  }

  const serialized = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  reconcile(countries, next.countries, (country) => country.id);
  reconcileTopics(next.topics);
  replaceContents(healthRecords, next.healthRecords);
  reconcile(sources, next.sources, (source) => source.id);
  notify();
}

export function saveCountries(next: Country[]) {
  saveAdminData({ ...getAdminData(), countries: next });
}

export function saveTopics(next: Topic[]) {
  saveAdminData({ ...getAdminData(), topics: next });
}

export function saveHealthRecords(next: HealthRecord[]) {
  saveAdminData({ ...getAdminData(), healthRecords: next });
}

export function saveSources(next: DataSource[]) {
  saveAdminData({ ...getAdminData(), sources: next });
}

export function getAdminCounts() {
  return {
    countries: countries.length,
    topics: topics.length,
    indicators: topics.reduce((total, topic) => total + topic.indicators.length, 0),
    healthRecords: healthRecords.length,
    sources: sources.length,
  };
}
