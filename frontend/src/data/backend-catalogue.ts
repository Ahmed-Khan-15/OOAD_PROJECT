import {
  api,
  type CountryApi,
  type IndicatorApi,
  type ObservationApi,
  type TopicApi,
} from "@/lib/api";
import {
  countries,
  healthRecords,
  topics,
  type Country,
  type HealthRecord,
  type Indicator,
  type Topic,
} from "@/data/health";

function frontendCountryId(country: CountryApi) {
  return countries.find((item) => item.isoCode === country.iso3)?.id ?? country.iso3.toLowerCase();
}

function applyCountries(records: CountryApi[]) {
  const updated = records.map((record): Country => {
    const existing = countries.find((item) => item.isoCode === record.iso3);
    return {
      id: existing?.id ?? record.iso3.toLowerCase(),
      isoCode: record.iso3,
      name: record.name,
      flag: existing?.flag ?? "🌐",
      region: record.region,
      intro: existing?.intro ?? `${record.name} country profile.`,
      active: record.active,
    };
  });
  countries.splice(0, countries.length, ...updated);
}

function applyTopics(topicRecords: TopicApi[], indicatorRecords: IndicatorApi[]) {
  const byTopic = new Map<string, IndicatorApi[]>();
  indicatorRecords.forEach((indicator) => {
    const list = byTopic.get(indicator.topic.id) ?? [];
    list.push(indicator);
    byTopic.set(indicator.topic.id, list);
  });
  const updated = topicRecords.map((record): Topic => {
    const existing = topics.find((item) => item.slug === record.slug);
    const indicators = (byTopic.get(record.id) ?? []).map((item): Indicator => {
      const prior = existing?.indicators.find((candidate) => candidate.id === item.slug);
      return {
        id: item.slug,
        name: item.name,
        unit: item.unit,
        description: item.description || prior?.description || "Definition not yet supplied.",
        howToRead:
          prior?.howToRead ??
          "Check the unit, reference year, dimensions, and source before interpreting this measure.",
        hasIllustrativeData: false,
        active: item.active,
      };
    });
    return {
      slug: record.slug,
      title: record.name,
      shortDescription: existing?.shortDescription ?? record.description,
      introduction: existing?.introduction ?? record.description,
      whyItMatters:
        existing?.whyItMatters ??
        "Explore the available definitions and data sources for this topic.",
      lifeImpact:
        existing?.lifeImpact ??
        "Interpret the indicators with their definitions and source context.",
      color: existing?.color ?? "sea",
      icon: existing?.icon ?? "Activity",
      indicators,
      related: existing?.related ?? [],
      active: record.active,
    };
  });
  topics.splice(0, topics.length, ...updated);
}

function toObservation(record: ObservationApi): HealthRecord {
  return {
    countryId: frontendCountryId({
      id: record.country.id,
      iso2: "",
      iso3: record.country.id,
      name: record.country.name,
      region: "",
      active: true,
    }),
    indicatorId: record.indicator.id,
    year: record.year,
    value: record.value,
    source: record.dataset.sourceName,
    sourceId: record.dataset.sourceId,
    datasetId: record.dataset.id,
    dimensions: Object.fromEntries(
      Object.entries(record.dimensions ?? {}).map(([k, v]) => [k, String(v)]),
    ),
    ...([record.note, record.dataset.citation].filter(Boolean).length
      ? { notes: [record.note, record.dataset.citation].filter(Boolean).join(" · ") }
      : {}),
  };
}

/** Loads published reference data from the API without using the local teaching observations. */
export async function loadBackendCatalogue(): Promise<void> {
  const [countryRecords, topicRecords, indicatorRecords] = await Promise.all([
    api.countries(),
    api.topics(),
    api.indicators(),
  ]);
  applyCountries(countryRecords);
  applyTopics(topicRecords, indicatorRecords);

  const realRecords: HealthRecord[] = [];
  let page = 0;
  let hasNext = true;
  while (hasNext) {
    const result = await api.observations({ page, size: 100 });
    realRecords.push(...result.content.map(toObservation));
    hasNext = result.hasNext;
    page += 1;
  }
  healthRecords.splice(0, healthRecords.length, ...realRecords);
}
