-- Reference catalogue for Global Health Explorer.
-- This seeds the initial countries, topics, indicators and known source organizations.
-- It does NOT seed health statistics. Real observations are loaded separately after source verification.

INSERT INTO countries (name, iso2, iso3, region) VALUES
('Pakistan', 'PK', 'PAK', 'South Asia'),
('India', 'IN', 'IND', 'South Asia'),
('Japan', 'JP', 'JPN', 'East Asia'),
('China', 'CN', 'CHN', 'East Asia'),
('Saudi Arabia', 'SA', 'SAU', 'Middle East'),
('Germany', 'DE', 'DEU', 'Europe'),
('United Kingdom', 'GB', 'GBR', 'Europe'),
('United States', 'US', 'USA', 'North America'),
('Brazil', 'BR', 'BRA', 'South America'),
('Nigeria', 'NG', 'NGA', 'Africa'),
('South Africa', 'ZA', 'ZAF', 'Africa'),
('Australia', 'AU', 'AUS', 'Oceania');

INSERT INTO topics (name, slug, description, is_overview, display_order) VALUES
('Global Health', 'global-health', 'An overview of global health and the topics explored by this platform.', TRUE, 1),
('Causes of Death', 'causes-of-death', 'Patterns and rates of deaths from different causes.', FALSE, 2),
('Child & Infant Mortality', 'child-infant-mortality', 'Mortality indicators for newborns, infants and children.', FALSE, 3),
('Life Expectancy', 'life-expectancy', 'Life expectancy and healthy life expectancy across populations.', FALSE, 4),
('Mental Health', 'mental-health', 'Prevalence and mortality indicators related to mental health.', FALSE, 5),
('Cardiovascular Diseases', 'cardiovascular-diseases', 'Deaths, risk factors and disease burden from cardiovascular conditions.', FALSE, 6),
('Cancer', 'cancer', 'Cancer incidence, prevalence and mortality indicators.', FALSE, 7),
('Maternal Mortality', 'maternal-mortality', 'Maternal mortality and related reproductive and maternal health indicators.', FALSE, 8),
('Air Pollution', 'air-pollution', 'Exposure to air pollutants and deaths attributed to air pollution.', FALSE, 9);

INSERT INTO data_sources (name, abbreviation, website_url, description) VALUES
('World Health Organization', 'WHO', 'https://www.who.int/', 'Global health statistics, mortality and health estimates.'),
('Institute for Health Metrics and Evaluation', 'IHME', 'https://www.healthdata.org/', 'Global Burden of Disease estimates and health metrics.'),
('World Bank', 'World Bank', 'https://www.worldbank.org/', 'Development indicators and health statistics.'),
('UNICEF', 'UNICEF', 'https://www.unicef.org/', 'Child health and child mortality data.'),
('United Nations Inter-agency Group for Child Mortality Estimation', 'UN IGME', 'https://childmortality.org/', 'Official UN child mortality estimates.'),
('International Agency for Research on Cancer', 'IARC', 'https://www.iarc.who.int/', 'Cancer research and global cancer observatory data.'),
('UN Maternal Mortality Estimation Inter-Agency Group', 'UN MMEIG', 'https://www.who.int/data/monitoring/maternal-mortality', 'Maternal mortality estimates.'),
('Our World in Data', 'OWID', 'https://ourworldindata.org/', 'Data discovery, documentation and downloadable datasets; original providers should be retained where available.');

-- Indicator direction is deliberately neutral unless a universally meaningful direction is clear.
-- Indicator units are stored centrally so public pages can label values consistently.

INSERT INTO indicators (topic_id, name, slug, unit, display_order)
SELECT t.id, v.name, v.slug, v.unit, v.ord
FROM topics t
JOIN (VALUES
('causes-of-death', 'Total deaths from all causes', 'total-deaths-all-causes', 'deaths', 1),
('causes-of-death', 'Age-standardized death rate (all causes)', 'age-standardized-death-rate-all-causes', 'deaths per 100,000 people', 2),
('causes-of-death', 'Deaths by specific cause', 'deaths-by-specific-cause', 'deaths', 3),
('causes-of-death', 'Death rate by specific cause', 'death-rate-by-specific-cause', 'deaths per 100,000 people', 4),
('causes-of-death', 'Share of deaths by cause', 'share-of-deaths-by-cause', '%', 5),
('causes-of-death', 'Share of deaths with a registered cause', 'share-deaths-registered-cause', '%', 6),

('child-infant-mortality', 'Neonatal mortality rate', 'neonatal-mortality-rate', 'deaths per 1,000 live births', 1),
('child-infant-mortality', 'Infant mortality rate', 'infant-mortality-rate', 'deaths per 1,000 live births', 2),
('child-infant-mortality', 'Under-five mortality rate', 'under-five-mortality-rate', 'deaths per 1,000 live births', 3),
('child-infant-mortality', 'Number of neonatal deaths', 'number-neonatal-deaths', 'deaths', 4),
('child-infant-mortality', 'Number of under-five deaths', 'number-under-five-deaths', 'deaths', 5),
('child-infant-mortality', 'Probability of dying between ages 5 and 14', 'probability-dying-ages-5-14', '%', 6),

('life-expectancy', 'Life expectancy at birth (total)', 'life-expectancy-birth-total', 'years', 1),
('life-expectancy', 'Life expectancy at birth (male)', 'life-expectancy-birth-male', 'years', 2),
('life-expectancy', 'Life expectancy at birth (female)', 'life-expectancy-birth-female', 'years', 3),
('life-expectancy', 'Healthy life expectancy at birth (HALE)', 'healthy-life-expectancy-birth', 'years', 4),
('life-expectancy', 'Life expectancy at age 60', 'life-expectancy-age-60', 'years', 5),
('life-expectancy', 'Adult mortality rate (ages 15–60)', 'adult-mortality-rate-15-60', 'deaths per 1,000 adults', 6),

('mental-health', 'Prevalence of all mental health disorders', 'prevalence-all-mental-disorders', '%', 1),
('mental-health', 'Prevalence of depressive disorders', 'prevalence-depressive-disorders', '%', 2),
('mental-health', 'Prevalence of anxiety disorders', 'prevalence-anxiety-disorders', '%', 3),
('mental-health', 'Prevalence of bipolar disorder', 'prevalence-bipolar-disorder', '%', 4),
('mental-health', 'Prevalence of schizophrenia', 'prevalence-schizophrenia', '%', 5),
('mental-health', 'Suicide death rate', 'suicide-death-rate', 'deaths per 100,000 people', 6),

('cardiovascular-diseases', 'Total deaths from cardiovascular diseases', 'total-cardiovascular-deaths', 'deaths', 1),
('cardiovascular-diseases', 'Age-standardized cardiovascular disease death rate', 'age-standardized-cvd-death-rate', 'deaths per 100,000 people', 2),
('cardiovascular-diseases', 'Ischaemic heart disease death rate', 'ischaemic-heart-disease-death-rate', 'deaths per 100,000 people', 3),
('cardiovascular-diseases', 'Stroke death rate', 'stroke-death-rate', 'deaths per 100,000 people', 4),
('cardiovascular-diseases', 'Prevalence of hypertension among adults aged 30–79', 'hypertension-prevalence-adults-30-79', '%', 5),
('cardiovascular-diseases', 'Disability-adjusted life years (DALYs) from cardiovascular diseases', 'cvd-dalys', 'DALYs', 6),

('cancer', 'New cancer cases', 'new-cancer-cases', 'cases', 1),
('cancer', 'Cancer incidence rate (age-standardized)', 'cancer-incidence-rate-age-standardized', 'new cases per 100,000 people', 2),
('cancer', 'Total deaths from cancer', 'total-cancer-deaths', 'deaths', 3),
('cancer', 'Cancer mortality rate (age-standardized)', 'cancer-mortality-rate-age-standardized', 'deaths per 100,000 people', 4),
('cancer', 'Prevalence of cancer', 'cancer-prevalence', 'people living with cancer', 5),
('cancer', 'Death rate by cancer type', 'death-rate-by-cancer-type', 'deaths per 100,000 people', 6),

('maternal-mortality', 'Maternal mortality ratio', 'maternal-mortality-ratio', 'deaths per 100,000 live births', 1),
('maternal-mortality', 'Number of maternal deaths', 'number-maternal-deaths', 'deaths', 2),
('maternal-mortality', 'Births attended by skilled health personnel', 'births-attended-skilled-personnel', '%', 3),
('maternal-mortality', 'Antenatal care coverage (at least 4 visits)', 'antenatal-care-at-least-4-visits', '%', 4),
('maternal-mortality', 'Antenatal care coverage (at least 1 visit)', 'antenatal-care-at-least-1-visit', '%', 5),
('maternal-mortality', 'Adolescent birth rate (ages 15–19)', 'adolescent-birth-rate-15-19', 'births per 1,000 women', 6),

('air-pollution', 'Annual average PM2.5 exposure', 'annual-average-pm25-exposure', 'µg/m³', 1),
('air-pollution', 'Annual average PM10 concentration', 'annual-average-pm10-concentration', 'µg/m³', 2),
('air-pollution', 'Annual average nitrogen dioxide (NO₂) concentration', 'annual-average-no2-concentration', 'µg/m³', 3),
('air-pollution', 'Deaths attributed to total air pollution', 'deaths-total-air-pollution', 'deaths', 4),
('air-pollution', 'Deaths attributed to ambient air pollution', 'deaths-ambient-air-pollution', 'deaths', 5),
('air-pollution', 'Deaths attributed to household air pollution', 'deaths-household-air-pollution', 'deaths', 6)
) AS v(topic_slug, name, slug, unit, ord)
ON t.slug = v.topic_slug;
