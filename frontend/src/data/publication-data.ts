export type ArticleCategory =
  "Health Explainers" | "Global Health Insights" | "Research Summaries" | "Data Stories";
export type ArticleStatus = "Draft" | "Published" | "Archived";
export type Article = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  category: ArticleCategory;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  status: ArticleStatus;
  coverImage: string;
  content: string;
  references: { label: string; url: string }[];
  topicSlugs: string[];
  countryIds: string[];
  indicatorIds: string[];
};
export type GlossaryTerm = {
  id: string;
  term: string;
  slug: string;
  definition: string;
  relatedTopicSlugs: string[];
  relatedArticleSlugs?: string[];
  relatedIndicatorIds?: string[];
  references: { label: string; url: string }[];
};
const CONTENT_KEY = "global-health-explorer:editorial:v1";

export const articleCategories: ArticleCategory[] = [
  "Health Explainers",
  "Global Health Insights",
  "Research Summaries",
  "Data Stories",
];
const references = [
  {
    label: "World Health Organization · Global Health Observatory",
    url: "https://www.who.int/data/gho",
  },
  { label: "Our World in Data · Global Health", url: "https://ourworldindata.org/health-meta" },
];

const seededArticles: Article[] = [
  {
    id: "reading-health-indicators",
    slug: "reading-health-indicators",
    title: "How to read a health indicator",
    subtitle: "A practical guide to units, time periods, and comparisons.",
    author: "Global Health Explorer editorial team",
    category: "Health Explainers",
    tags: ["indicators", "data literacy"],
    publishedAt: "2026-11-15",
    updatedAt: "2026-11-15",
    readingMinutes: 5,
    status: "Published",
    coverImage: "",
    content:
      "A health indicator turns a defined concept into a measure that can be described and compared. Before interpreting a value, check what is counted, who is included, the unit, the reference year, and how the measure was produced.\n\nRates and counts answer different questions. A count describes how many events were recorded; a rate relates events to a population or another denominator. A rate can help compare populations of different sizes, but it is not an individual's personal risk.\n\nComparisons are most useful when definitions, age groups, time periods, and methods align. If they do not, describe the differences and avoid treating the values as directly equivalent. Missing information should remain missing, never be read as zero.\n\nUse the source notes alongside a chart. They provide the provenance and context needed to decide what a measure can—and cannot—say.",
    references,
    topicSlugs: ["global-health"],
    countryIds: [],
    indicatorIds: [],
  },
  {
    id: "what-missing-data-means",
    slug: "what-missing-data-means",
    title: "What missing health data can—and cannot—tell us",
    subtitle: "Why an empty space in a chart is not a value of zero.",
    author: "Global Health Explorer editorial team",
    category: "Global Health Insights",
    tags: ["data quality", "interpretation"],
    publishedAt: "2026-11-15",
    updatedAt: "2026-11-15",
    readingMinutes: 4,
    status: "Published",
    coverImage: "",
    content:
      "A missing observation means that a value is not available in the dataset shown. It does not establish that no events occurred. Data may be absent because a measure was not collected, could not be reported, or was not included in the current release.\n\nWhen reading a chart, look for gaps, source notes, and coverage dates. Different countries or measures may have different reporting histories. A comparison across incomplete series should make those differences visible.\n\nThis explorer leaves unavailable values blank and labels teaching examples clearly. Verified observations will need a traceable source, year, unit, and definition before publication.",
    references,
    topicSlugs: ["global-health"],
    countryIds: [],
    indicatorIds: [],
  },
  {
    id: "comparing-life-expectancy",
    slug: "comparing-life-expectancy",
    title: "Life expectancy: a summary, not a personal forecast",
    subtitle: "What this population measure describes and where its limits lie.",
    author: "Global Health Explorer editorial team",
    category: "Research Summaries",
    tags: ["life expectancy", "measurement"],
    publishedAt: "2026-11-15",
    updatedAt: "2026-11-15",
    readingMinutes: 4,
    status: "Published",
    coverImage: "",
    content:
      "Life expectancy at birth summarizes the mortality pattern observed for a population and period. It is not a prediction of how long a particular newborn will live. The measure is sensitive to the underlying age-specific mortality rates and to the methods used to estimate them.\n\nWhen comparing estimates, check the source, reference year, and whether the values use the same method. A single summary cannot explain why patterns differ or capture variation within a population. Pair it with context and other measures rather than treating it as a complete account of health.",
    references: [
      {
        label: "World Health Organization · Life expectancy",
        url: "https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/ghe-life-expectancy-and-healthy-life-expectancy",
      },
      ...references.slice(0, 1),
    ],
    topicSlugs: ["life-expectancy"],
    countryIds: [],
    indicatorIds: ["life-expectancy"],
  },
  {
    id: "explore-without-overclaiming",
    slug: "explore-without-overclaiming",
    title: "A careful way to explore country comparisons",
    subtitle: "Start with a question, then follow the data back to its source.",
    author: "Global Health Explorer editorial team",
    category: "Data Stories",
    tags: ["comparison", "provenance"],
    publishedAt: "2026-11-15",
    updatedAt: "2026-11-15",
    readingMinutes: 3,
    status: "Published",
    coverImage: "",
    content:
      "Choose one measure and ask what it represents. Confirm the unit and years, then inspect the countries' source notes. If a series has gaps, keep them visible. If the sources use different definitions or periods, explain the mismatch before drawing a comparison.\n\nA visualization helps readers notice patterns, but it does not establish cause. Use it to form a question and return to the underlying dataset and methodology for evidence. This project labels synthetic teaching values and does not present them as verified measurements.",
    references,
    topicSlugs: ["global-health"],
    countryIds: [],
    indicatorIds: [],
  },
];

export const initialGlossary: GlossaryTerm[] = [
  {
    id: "maternal-mortality-ratio",
    term: "Maternal mortality ratio",
    slug: "maternal-mortality-ratio",
    definition:
      "The number of maternal deaths in a period relative to the number of live births in that period, commonly expressed per 100,000 live births. Check the source's definition of a maternal death and the years covered.",
    relatedTopicSlugs: ["maternal-mortality"],
    relatedIndicatorIds: ["maternal-ratio"],
    references: [
      {
        label: "WHO · Maternal mortality",
        url: "https://www.who.int/news-room/fact-sheets/detail/maternal-mortality",
      },
    ],
  },
  {
    id: "neonatal-mortality",
    term: "Neonatal mortality",
    slug: "neonatal-mortality",
    definition:
      "Deaths among live-born babies during the first 28 completed days of life. A neonatal mortality rate is usually expressed per 1,000 live births.",
    relatedTopicSlugs: ["child-mortality"],
    relatedIndicatorIds: ["neonatal"],
    references: [
      { label: "WHO · Newborn health", url: "https://www.who.int/health-topics/newborn-health" },
    ],
  },
  {
    id: "dalys",
    term: "Disability-adjusted life years (DALYs)",
    slug: "dalys",
    definition:
      "A summary measure of health loss that combines years of life lost due to premature death with years lived with disability. It describes population-level burden, not an individual diagnosis.",
    relatedTopicSlugs: ["cardiovascular-diseases"],
    relatedArticleSlugs: ["reading-health-indicators"],
    references: [
      {
        label: "WHO · Metrics: Disability-adjusted life year",
        url: "https://www.who.int/data/gho/indicator-metadata-registry/imr-details/158",
      },
    ],
  },
  {
    id: "incidence",
    term: "Incidence",
    slug: "incidence",
    definition:
      "The occurrence of new cases or events in a defined population over a specified period. Always check the case definition, population, and time interval.",
    relatedTopicSlugs: ["cancer"],
    relatedArticleSlugs: ["reading-health-indicators"],
    references: [
      {
        label: "CDC · Principles of Epidemiology",
        url: "https://www.cdc.gov/csels/dsepd/ss1978/lesson3/section2.html",
      },
    ],
  },
  {
    id: "prevalence",
    term: "Prevalence",
    slug: "prevalence",
    definition:
      "The proportion of a defined population that has a condition or characteristic at a specified time or during a specified period. It is different from counting only new cases.",
    relatedTopicSlugs: ["mental-health"],
    relatedArticleSlugs: ["what-missing-health-data-means"],
    references: [
      {
        label: "CDC · Principles of Epidemiology",
        url: "https://www.cdc.gov/csels/dsepd/ss1978/lesson3/section2.html",
      },
    ],
  },
  {
    id: "life-expectancy-at-birth",
    term: "Life expectancy at birth",
    slug: "life-expectancy-at-birth",
    definition:
      "The average number of years a newborn would live if the mortality patterns observed for a specified period continued throughout life. It summarizes a population pattern and is not an individual forecast.",
    relatedTopicSlugs: ["life-expectancy"],
    relatedArticleSlugs: ["comparing-life-expectancy"],
    relatedIndicatorIds: ["life-expectancy"],
    references: [
      {
        label: "WHO · Life expectancy",
        url: "https://www.who.int/data/gho/data/themes/mortality-and-global-health-estimates/ghe-life-expectancy-and-healthy-life-expectancy",
      },
    ],
  },
];

export function getEditorialData() {
  if (typeof window === "undefined") return { articles: seededArticles, glossary: initialGlossary };
  try {
    const saved = JSON.parse(window.localStorage.getItem(CONTENT_KEY) ?? "null") as {
      articles?: Article[];
      glossary?: GlossaryTerm[];
    } | null;
    return {
      articles: saved?.articles ?? seededArticles,
      glossary: saved?.glossary ?? initialGlossary,
    };
  } catch {
    return { articles: seededArticles, glossary: initialGlossary };
  }
}
