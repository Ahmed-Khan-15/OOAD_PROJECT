export type Country = {
  id: string;
  name: string;
  flag: string;
  region: string;
  intro: string;
  active: boolean;
};

export type Indicator = {
  id: string;
  name: string;
  unit: string;
  description: string;
  howToRead: string;
  hasIllustrativeData: boolean;
};

export type Topic = {
  slug: string;
  title: string;
  shortDescription: string;
  introduction: string;
  whyItMatters: string;
  lifeImpact: string;
  color: "sea" | "leaf" | "coral";
  icon: string;
  indicators: Indicator[];
  related: string[];
};

export type HealthRecord = {
  countryId: string;
  indicatorId: string;
  year: number;
  value: number;
  source: string;
  notes?: string;
};

const sampleSource = "Synthetic teaching example · not a public-health statistic";

const indicator = (
  id: string,
  name: string,
  unit: string,
  description: string,
  howToRead: string,
  hasIllustrativeData = false,
): Indicator => ({ id, name, unit, description, howToRead, hasIllustrativeData });

export const countries: Country[] = [
  {
    id: "pakistan",
    name: "Pakistan",
    flag: "🇵🇰",
    region: "South Asia",
    intro:
      "A South Asian country with diverse communities and health needs across urban and rural areas.",
    active: true,
  },
  {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    region: "South Asia",
    intro: "A large and diverse South Asian country with a wide range of local health experiences.",
    active: true,
  },
  {
    id: "japan",
    name: "Japan",
    flag: "🇯🇵",
    region: "East Asia",
    intro: "An East Asian island country with communities shaped by varied ages and settings.",
    active: true,
  },
  {
    id: "china",
    name: "China",
    flag: "🇨🇳",
    region: "East Asia",
    intro: "A large East Asian country with varied population and environmental conditions.",
    active: true,
  },
  {
    id: "saudi-arabia",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    region: "Middle East",
    intro: "A Middle Eastern country spanning urban centers and desert communities.",
    active: true,
  },
  {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    region: "Europe",
    intro: "A central European country with a broad public health and care system.",
    active: true,
  },
  {
    id: "united-kingdom",
    name: "United Kingdom",
    flag: "🇬🇧",
    region: "Europe",
    intro: "A group of nations in north-western Europe with diverse communities.",
    active: true,
  },
  {
    id: "united-states",
    name: "United States",
    flag: "🇺🇸",
    region: "North America",
    intro: "A large North American country with varied communities and health experiences.",
    active: true,
  },
  {
    id: "brazil",
    name: "Brazil",
    flag: "🇧🇷",
    region: "South America",
    intro:
      "South America's largest country, with communities across cities, forests, and rural areas.",
    active: true,
  },
  {
    id: "nigeria",
    name: "Nigeria",
    flag: "🇳🇬",
    region: "Africa",
    intro: "A populous West African country with many languages, cultures, and local health needs.",
    active: true,
  },
  {
    id: "south-africa",
    name: "South Africa",
    flag: "🇿🇦",
    region: "Africa",
    intro: "A southern African country with diverse communities and public health priorities.",
    active: true,
  },
  {
    id: "australia",
    name: "Australia",
    flag: "🇦🇺",
    region: "Oceania",
    intro: "A country and continent with communities across cities, coasts, and remote regions.",
    active: true,
  },
];

export const topics: Topic[] = [
  {
    slug: "global-health",
    title: "Global Health",
    shortDescription: "A broad look at the health and well-being of people everywhere.",
    introduction:
      "Global health asks how people in different places can live healthy lives, and what shared challenges shape their well-being.",
    whyItMatters:
      "Health is connected across borders. Learning about common patterns helps communities and decision-makers ask better questions about care, prevention, and fairness.",
    lifeImpact:
      "Behind every measure are people, families, and communities. A single global average can hide very different experiences between and within countries.",
    color: "sea",
    icon: "globe",
    indicators: [],
    related: ["life-expectancy", "child-mortality", "air-pollution"],
  },
  {
    slug: "causes-of-death",
    title: "Causes of Death",
    shortDescription: "Understand the health conditions behind deaths around the world.",
    introduction:
      "Causes of death describe the health conditions or events recorded as leading to a person's death. Patterns vary with age, living conditions, and access to care.",
    whyItMatters:
      "These patterns can help public health teams understand where prevention, early treatment, or stronger health services may help.",
    lifeImpact:
      "A death affects families and communities as well as the person. Population patterns can point to needs for prevention and support.",
    color: "coral",
    icon: "heart",
    indicators: [
      indicator(
        "death-rate",
        "Deaths from all causes",
        "deaths per 100,000 people",
        "A population-level rate of deaths from all causes.",
        "Rates allow populations of different sizes to be compared; they are not an individual person's risk.",
        true,
      ),
      indicator(
        "cardio-deaths",
        "Cardiovascular deaths",
        "deaths per 100,000 people",
        "Deaths linked to heart and blood-vessel conditions.",
        "A change can reflect many influences, including age patterns and access to care.",
      ),
      indicator(
        "cancer-deaths",
        "Cancer deaths",
        "deaths per 100,000 people",
        "Deaths attributed to cancer conditions.",
        "Deaths and new cancer diagnoses are different measures.",
      ),
      indicator(
        "respiratory-deaths",
        "Respiratory disease deaths",
        "deaths per 100,000 people",
        "Deaths related to diseases affecting breathing and the lungs.",
        "The category includes different conditions; definitions can vary by source.",
      ),
      indicator(
        "infectious-deaths",
        "Infectious disease deaths",
        "deaths per 100,000 people",
        "Deaths linked to infections that can spread or arise from organisms.",
        "The diseases included should be checked in the source definition.",
      ),
    ],
    related: ["cardiovascular-diseases", "cancer", "air-pollution"],
  },
  {
    slug: "child-mortality",
    title: "Child & Infant Mortality",
    shortDescription: "Learn about survival in infancy and early childhood.",
    introduction:
      "Child mortality measures deaths among children at particular ages. Infant mortality focuses on the first year of life; under-five mortality covers the years before a child's fifth birthday.",
    whyItMatters:
      "These measures help show whether families can access safe births, nutrition, vaccines, clean water, and timely health care.",
    lifeImpact:
      "A child's health is shaped by care before, during, and after birth, as well as by the conditions in which a family lives.",
    color: "leaf",
    icon: "baby",
    indicators: [
      indicator(
        "under-five",
        "Under-five mortality rate",
        "deaths per 1,000 live births",
        "The likelihood of a child dying before age five, expressed per 1,000 live births.",
        "This is a population estimate, not a count of deaths in a single year.",
        true,
      ),
      indicator(
        "infant",
        "Infant mortality rate",
        "deaths per 1,000 live births",
        "Deaths among children before their first birthday.",
        "A live-birth denominator helps compare places with different birth counts.",
      ),
      indicator(
        "neonatal",
        "Neonatal mortality rate",
        "deaths per 1,000 live births",
        "Deaths during the first 28 days after birth.",
        "Early newborn health and care around birth are important influences.",
      ),
      indicator(
        "child-1-4",
        "Child mortality, ages 1–4",
        "deaths per 1,000 children",
        "Deaths among children after infancy and before age five.",
        "Age bands and denominators should be checked in the source.",
      ),
      indicator(
        "births-attended",
        "Births attended by skilled staff",
        "% of births",
        "The share of births attended by trained health personnel.",
        "Coverage does not by itself describe the quality or availability of care.",
      ),
    ],
    related: ["maternal-mortality", "life-expectancy", "global-health"],
  },
  {
    slug: "life-expectancy",
    title: "Life Expectancy",
    shortDescription: "Explore how long people are expected to live and how that changes.",
    introduction:
      "Life expectancy at birth summarizes how long a newborn might live if current age-specific death patterns continued throughout their life.",
    whyItMatters:
      "It offers a broad way to understand population health over time, but cannot explain every cause or predict one person's lifespan.",
    lifeImpact:
      "Living conditions, health care, safety, income, and many other factors can shape how long and how well people live.",
    color: "sea",
    icon: "chart",
    indicators: [
      indicator(
        "life-expectancy",
        "Life expectancy at birth",
        "years",
        "The average years a newborn could expect to live under current age-specific death patterns.",
        "A summary measure for a population, not a prediction for an individual.",
        true,
      ),
      indicator(
        "healthy-life",
        "Healthy life expectancy",
        "years",
        "Expected years lived in full health, based on a defined health measure.",
        "Methods differ; check how health and disability are defined.",
      ),
      indicator(
        "male-life",
        "Life expectancy at birth, males",
        "years",
        "Life expectancy at birth estimated for males.",
        "Compare only when the source's population and method align.",
      ),
      indicator(
        "female-life",
        "Life expectancy at birth, females",
        "years",
        "Life expectancy at birth estimated for females.",
        "Differences reflect population patterns and do not describe every person.",
      ),
      indicator(
        "life-age-60",
        "Life expectancy at age 60",
        "additional years",
        "The additional years a person aged 60 might expect to live under current patterns.",
        "This begins at age 60, rather than at birth.",
      ),
    ],
    related: ["child-mortality", "causes-of-death", "global-health"],
  },
  {
    slug: "mental-health",
    title: "Mental Health",
    shortDescription: "Learn about mental well-being, conditions, and access to support.",
    introduction:
      "Mental health includes emotional, psychological, and social well-being. It can change over time and is shaped by personal, social, and environmental factors.",
    whyItMatters:
      "Mental well-being is part of health. Clear information can help reduce stigma and improve understanding of support needs.",
    lifeImpact:
      "Mental health can affect relationships, learning, work, and daily life. People may experience different conditions and need different kinds of support.",
    color: "leaf",
    icon: "mind",
    indicators: [
      indicator(
        "depression",
        "Depression prevalence",
        "% of population",
        "An estimate of the share of people experiencing depression during a defined period.",
        "Survey and diagnostic methods affect estimates; prevalence is not an individual diagnosis.",
        true,
      ),
      indicator(
        "anxiety",
        "Anxiety disorder prevalence",
        "% of population",
        "An estimate of people meeting a defined measure for anxiety disorders.",
        "Methods and time periods vary; check the source before comparing.",
      ),
      indicator(
        "mental-disorder",
        "Mental disorder prevalence",
        "% of population",
        "A combined estimate across specified mental health conditions.",
        "The conditions included must be stated by the data source.",
      ),
      indicator(
        "suicide-rate",
        "Suicide mortality rate",
        "deaths per 100,000 people",
        "Deaths recorded as suicide, expressed as a population rate.",
        "Suicide mortality is only one aspect of mental health and is affected by reporting practices.",
      ),
      indicator(
        "mental-disability",
        "Years lived with disability",
        "years",
        "An estimate of time lived with health loss related to mental conditions.",
        "This is a modeled population measure, not a count of people.",
      ),
    ],
    related: ["causes-of-death", "global-health", "life-expectancy"],
  },
  {
    slug: "cardiovascular-diseases",
    title: "Cardiovascular Diseases",
    shortDescription: "Explore conditions of the heart and blood vessels.",
    introduction:
      "Cardiovascular diseases affect the heart or blood vessels. This group includes conditions such as heart disease and stroke.",
    whyItMatters:
      "Understanding the patterns can help explain needs around prevention, early recognition, and access to treatment.",
    lifeImpact:
      "These conditions can affect everyday activities and family life. Many influences—from personal health to living conditions—play a role.",
    color: "coral",
    icon: "heart",
    indicators: [
      indicator(
        "cvd-mortality",
        "Cardiovascular disease mortality",
        "deaths per 100,000 people",
        "Deaths attributed to cardiovascular conditions in a population.",
        "Population rates are not individual risk; source coding matters.",
        true,
      ),
      indicator(
        "ischemic-heart",
        "Ischemic heart disease mortality",
        "deaths per 100,000 people",
        "Deaths related to reduced blood flow to the heart.",
        "This is one part of cardiovascular disease, not the whole group.",
      ),
      indicator(
        "stroke",
        "Stroke mortality",
        "deaths per 100,000 people",
        "Deaths attributed to stroke.",
        "Stroke outcomes and reporting can vary across settings.",
      ),
      indicator(
        "cvd-deaths",
        "Cardiovascular deaths",
        "number of deaths",
        "A count of deaths attributed to cardiovascular disease.",
        "Counts are affected by population size and should not be compared alone.",
      ),
      indicator(
        "cvd-burden",
        "Cardiovascular disease burden",
        "disability-adjusted life years",
        "A combined estimate of years lost to early death and ill health.",
        "Methods combine different forms of health loss; review source definitions.",
      ),
    ],
    related: ["causes-of-death", "life-expectancy", "air-pollution"],
  },
  {
    slug: "cancer",
    title: "Cancer",
    shortDescription: "Understand cancer patterns, prevention, and care around the world.",
    introduction:
      "Cancer is a group of diseases in which abnormal cells grow and may spread. Different cancers have different causes, treatments, and outcomes.",
    whyItMatters:
      "Population information can help communities understand the need for prevention, early detection, diagnosis, and treatment services.",
    lifeImpact:
      "A cancer diagnosis can affect a person's health, daily life, and family. Access to timely and suitable care matters.",
    color: "sea",
    icon: "ribbon",
    indicators: [
      indicator(
        "cancer-mortality",
        "Cancer mortality",
        "deaths per 100,000 people",
        "Deaths attributed to cancer, expressed as a population rate.",
        "Mortality is different from incidence, which counts new cases.",
        true,
      ),
      indicator(
        "cancer-incidence",
        "Cancer incidence",
        "new cases per 100,000 people",
        "The number of newly diagnosed cancers in a population over a period.",
        "Age adjustment and cancer types included affect comparisons.",
      ),
      indicator(
        "breast-cancer",
        "Breast cancer mortality",
        "deaths per 100,000 people",
        "Deaths attributed to breast cancer.",
        "A specific cancer type; it does not describe all cancers.",
      ),
      indicator(
        "lung-cancer",
        "Lung cancer mortality",
        "deaths per 100,000 people",
        "Deaths attributed to lung cancer.",
        "Definitions and age adjustment should be checked at the source.",
      ),
      indicator(
        "colorectal-cancer",
        "Colorectal cancer mortality",
        "deaths per 100,000 people",
        "Deaths attributed to colorectal cancer.",
        "This measure covers a specific set of cancer sites.",
      ),
    ],
    related: ["causes-of-death", "cardiovascular-diseases", "air-pollution"],
  },
  {
    slug: "maternal-mortality",
    title: "Maternal Mortality",
    shortDescription: "Explore health and safety during pregnancy and childbirth.",
    introduction:
      "Maternal health covers health during pregnancy, childbirth, and the period after birth. Maternal mortality is a measure of deaths related to pregnancy.",
    whyItMatters:
      "Many pregnancy-related complications can be prevented or treated when people can reach suitable, timely care.",
    lifeImpact:
      "A safe pregnancy and birth can shape the well-being of parents, babies, and families for years to come.",
    color: "leaf",
    icon: "care",
    indicators: [
      indicator(
        "maternal-ratio",
        "Maternal mortality ratio",
        "deaths per 100,000 live births",
        "Maternal deaths relative to live births in a population.",
        "The ratio is a population measure, not a count of every pregnancy.",
        true,
      ),
      indicator(
        "maternal-deaths",
        "Maternal deaths",
        "number of deaths",
        "A count of deaths related to pregnancy and childbirth.",
        "Counts should be understood alongside population and birth totals.",
      ),
      indicator(
        "maternal-risk",
        "Lifetime risk of maternal death",
        "% of women",
        "An estimate of the chance a woman will die from a maternal cause over her lifetime.",
        "This combines risks over time and is not a yearly rate.",
      ),
      indicator(
        "skilled-birth",
        "Skilled birth attendance",
        "% of births",
        "The share of births attended by skilled health personnel.",
        "Attendance alone does not describe the quality of care available.",
      ),
      indicator(
        "antenatal",
        "Antenatal care coverage",
        "% of pregnancies",
        "The share of pregnant people receiving a defined level of prenatal care.",
        "The number and content of visits included depend on the source.",
      ),
    ],
    related: ["child-mortality", "global-health", "life-expectancy"],
  },
  {
    slug: "air-pollution",
    title: "Air Pollution",
    shortDescription: "See how the air around us connects with population health.",
    introduction:
      "Air pollution is the presence of harmful substances in the air people breathe. Sources can include transport, industry, fires, and household fuels.",
    whyItMatters:
      "Long-term exposure to polluted air is associated with health risks, but a relationship between two measures does not by itself prove cause.",
    lifeImpact:
      "Air quality can affect daily life, especially for people with existing health conditions and communities with fewer ways to avoid exposure.",
    color: "sea",
    icon: "air",
    indicators: [
      indicator(
        "air-deaths",
        "Air-pollution-attributable deaths",
        "deaths per 100,000 people",
        "A modeled estimate of deaths linked to specified air pollution exposures.",
        "This is an estimate, not a direct count; it depends on the model and assumptions.",
        true,
      ),
      indicator(
        "household-air",
        "Household air pollution mortality",
        "deaths per 100,000 people",
        "A modeled estimate linked to household air pollution exposure.",
        "Attribution methods and household fuel patterns matter.",
      ),
      indicator(
        "ambient-air",
        "Ambient air pollution mortality",
        "deaths per 100,000 people",
        "A modeled estimate linked to pollution in outdoor air.",
        "This is modeled attribution, not a direct cause recorded for each person.",
      ),
      indicator(
        "pm25",
        "Average PM2.5 exposure",
        "micrograms per cubic metre",
        "Average exposure to very small airborne particles.",
        "A population average can hide large local differences.",
      ),
      indicator(
        "unsafe-air",
        "Population exposed to unsafe air",
        "% of population",
        "The share of people estimated to live above a defined air-quality guideline.",
        "The guideline and measurement period must be specified.",
      ),
    ],
    related: ["cardiovascular-diseases", "causes-of-death", "global-health"],
  },
];

const yearValues: Record<string, Record<string, number[]>> = {
  "life-expectancy": {
    pakistan: [63, 64, 66, 67],
    india: [65, 67, 69, 70],
    japan: [82, 83, 84, 85],
    brazil: [72, 73, 75, 76],
    nigeria: [51, 53, 55, 56],
    "united-states": [78, 79, 77, 78],
  },
  "under-five": {
    pakistan: [82, 74, 64, 58],
    india: [58, 48, 37, 31],
    japan: [4.5, 4, 3.5, 3],
    brazil: [19, 16, 14, 12],
    nigeria: [155, 137, 120, 110],
    australia: [6, 5, 4, 3.5],
  },
  "death-rate": {
    pakistan: [790, 760, 740, 720],
    india: [760, 730, 700, 680],
    germany: [850, 840, 830, 820],
    brazil: [690, 670, 650, 630],
    nigeria: [1050, 990, 950, 910],
    japan: [920, 900, 880, 860],
  },
  depression: {
    pakistan: [5.2, 5.4, 5.7, 5.9],
    india: [4.4, 4.7, 5, 5.2],
    germany: [4.8, 4.9, 5.1, 5.2],
    brazil: [5.1, 5.3, 5.6, 5.8],
    nigeria: [3.5, 3.7, 3.9, 4.1],
    australia: [4.6, 4.8, 5, 5.1],
  },
  "cvd-mortality": {
    pakistan: [280, 270, 260, 250],
    india: [300, 290, 275, 260],
    germany: [180, 170, 160, 150],
    brazil: [220, 210, 200, 190],
    japan: [130, 125, 120, 115],
    "united-states": [190, 185, 180, 175],
  },
  "cancer-mortality": {
    pakistan: [90, 92, 95, 97],
    india: [105, 108, 110, 112],
    germany: [220, 215, 210, 205],
    brazil: [120, 123, 125, 126],
    japan: [180, 178, 176, 174],
    "united-states": [190, 185, 180, 175],
  },
  "maternal-ratio": {
    pakistan: [276, 238, 190, 170],
    india: [174, 145, 113, 97],
    nigeria: [1000, 850, 750, 650],
    brazil: [70, 65, 60, 58],
    japan: [6, 5, 4, 4],
    australia: [7, 6, 5, 5],
  },
  "air-deaths": {
    pakistan: [130, 125, 120, 115],
    india: [150, 145, 138, 130],
    china: [120, 110, 100, 90],
    germany: [35, 33, 30, 28],
    brazil: [55, 53, 50, 48],
    australia: [18, 17, 16, 15],
  },
};
const sampleYears = [2000, 2008, 2016, 2023];

export const healthRecords: HealthRecord[] = Object.entries(yearValues).flatMap(
  ([indicatorId, byCountry]) =>
    Object.entries(byCountry).flatMap(([countryId, values]) =>
      values.map((value, index) => ({
        countryId,
        indicatorId,
        year: sampleYears[index] ?? 2023,
        value,
        source: sampleSource,
      })),
    ),
);

export const sampleYearRange = [2000, 2023] as const;

export function getTopic(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

export function getCountry(id: string): Country | undefined {
  return countries.find((country) => country.id === id);
}

export function getIndicator(topic: Topic, id: string): Indicator | undefined {
  return topic.indicators.find((item) => item.id === id);
}

export function recordsFor(indicatorId: string, countryIds: string[], from: number, to: number) {
  return healthRecords.filter(
    (record) =>
      record.indicatorId === indicatorId &&
      countryIds.includes(record.countryId) &&
      record.year >= from &&
      record.year <= to,
  );
}

export function getIndicatorTopic(indicatorId: string): Topic | undefined {
  return topics.find((topic) => topic.indicators.some((item) => item.id === indicatorId));
}
