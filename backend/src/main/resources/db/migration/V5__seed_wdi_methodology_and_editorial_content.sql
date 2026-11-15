-- Publish source-aware editorial content for the verified WDI health subset.
-- The metadata update is conditional so a clean installation can apply this
-- migration before a curator registers the dataset.

UPDATE data_sources
SET description = 'World Development Indicators distributes internationally compiled development and health series. Each indicator retains its named upstream provider and its own definition and estimation method; the World Bank is the distributor, not necessarily the original collector.'
WHERE name = 'World Bank';

UPDATE data_sources SET description = 'WHO publishes global health statistics, technical guidance and international health estimates. Check each dataset record for its specific WHO program, definition, release and estimation method.'
WHERE name = 'World Health Organization';
UPDATE data_sources SET description = 'IHME produces population health research estimates, including Global Burden of Disease outputs. Review the license and terms attached to each specific release before reuse.'
WHERE name = 'Institute for Health Metrics and Evaluation';
UPDATE data_sources SET description = 'UNICEF publishes child health statistics and supports international child health estimation and survey programs. The underlying series and methods vary by dataset.'
WHERE name = 'UNICEF';
UPDATE data_sources SET description = 'The United Nations Inter-agency Group for Child Mortality Estimation coordinates harmonized estimates of child mortality with partner agencies. These estimates are not direct counts for every country-year.'
WHERE name = 'United Nations Inter-agency Group for Child Mortality Estimation';
UPDATE data_sources SET description = 'IARC coordinates cancer research and publishes international cancer incidence and mortality resources, including Global Cancer Observatory products. Check the referenced release for coverage and method.'
WHERE name = 'International Agency for Research on Cancer';
UPDATE data_sources SET description = 'The UN Maternal Mortality Estimation Inter-Agency Group coordinates international maternal mortality estimates. Values may be modelled; consult each release for its inputs and uncertainty.'
WHERE name = 'UN Maternal Mortality Estimation Inter-Agency Group';
UPDATE data_sources SET description = 'Our World in Data makes research and data resources accessible and documents sources where available. Retain the original provider, dataset definition, license and release when citing redistributed data.'
WHERE name = 'Our World in Data';

UPDATE datasets
SET description = 'Six World Development Indicators health series for the project catalogue countries. Coverage is unbalanced by country and indicator; absent country-years are not zero. See the series mapping and source notes for definitions and limitations.',
    source_url = 'https://api.worldbank.org/v2/source/2',
    citation = 'World Bank. World Development Indicators (WDI), health subset: SP.DYN.LE00.IN; SH.DYN.MORT; SP.DYN.IMRT.IN; SH.DYN.NMRT; SH.STA.MMRT; SH.STA.BRTC.ZS. Retrieved 2026-11-15 from https://api.worldbank.org/v2/source/2. Upstream providers vary by indicator; see the project provenance record. The World Bank does not endorse this project.',
    license_name = 'CC BY 4.0',
    license_url = 'https://creativecommons.org/licenses/by/4.0/',
    methodology = 'National annual values are transcribed from the WDI CSV release retrieved 2026-11-15 (release timestamp 2026-11-11). Blank source cells are omitted; no interpolation or unit conversion is performed. Child mortality series are UN IGME estimates; maternal mortality is a regression-modelled estimate; life expectancy is a life-table measure; skilled birth attendance is survey-derived. WDI provides no row-level uncertainty interval or reported-versus-estimated flag in these files. Country coverage is unbalanced and indicator-specific. The source extract is retained in planning/stage-6b-data/SOURCES_AND_PROVENANCE.md with the raw archives and import files.',
    frequency = 'Annual (where available)',
    coverage_start_year = 1960,
    coverage_end_year = 2024
WHERE slug = 'world-development-indicators-health-2026-11';

INSERT INTO articles (
    category_id, title, subtitle, slug, author_name, introduction, content,
    reading_minutes, status, published_at
)
SELECT c.id, v.title, v.subtitle, v.slug, 'Global Health Explorer editorial team',
       v.introduction, v.content, v.reading_minutes, 'PUBLISHED', DATE '2026-11-15'
FROM (VALUES
    ('Data Stories', 'What six WDI health series can tell us',
     'A guide to reading the newly imported mortality, life expectancy and birth-attendance observations.',
     'reading-wdi-health-series',
     'The explorer now includes six health series distributed through the World Bank’s World Development Indicators (WDI). They cover life expectancy, child mortality, maternal mortality and skilled attendance at birth for twelve catalogue countries. They do not form a complete or evenly sampled picture of health.',
     '## Start with the measure

Life expectancy at birth summarizes the mortality pattern for a population and period. It is not a forecast for an individual child. Under-five, infant and neonatal mortality are probabilities expressed per 1,000 live births, but they refer to different age thresholds. Maternal mortality is a modelled ratio per 100,000 live births. Skilled birth attendance is a survey-derived percentage and is available only for selected years.

## Gaps are part of the evidence

The extract contains 3,586 observations across twelve countries and six indicators. Coverage varies by series and country. For example, skilled birth-attendance observations are sparse survey years rather than a continuous annual record. An empty year means the selected WDI file did not provide a value; it must not be read as zero or filled by interpolation.

## Follow the source chain

WDI distributes series assembled by different organizations. The child-mortality series are attributed to the UN Inter-agency Group for Child Mortality Estimation and partners. The maternal mortality ratio is explicitly modelled and draws on estimates from WHO, UNICEF, UNFPA and the World Bank Group. Life expectancy uses population and national statistical inputs. Skilled attendance draws on UNICEF and survey programs. A single publisher label therefore does not imply one shared collection method.

## Compare with care

Before comparing places or years, check each indicator’s definition, denominator, coverage and status note. The downloaded tables contain no row-level uncertainty intervals or reported-versus-estimated flags. The dataset records series-level methodological context, not an observation-specific confidence statement. Differences in a chart can help pose questions; they do not establish what caused those differences.

The source extract, indicator counts, retrieval method and known limits are documented in the project’s WDI provenance record. WDI values can be revised, so cite the release and retrieval date when reusing them.', 6),
    ('Health Explainers', 'Why mortality indicators use different age ranges',
     'Neonatal, infant and under-five mortality describe related but distinct periods of early life.',
     'understanding-child-mortality-measures',
     'Mortality indicators for newborns and children are easy to confuse because their names and units are similar. Their age ranges answer different questions.',
     '## Three windows of early life

Neonatal mortality concerns deaths during the first 28 completed days after a live birth. Infant mortality covers deaths before the first birthday. Under-five mortality covers deaths before age five. Each measure is commonly expressed as a probability per 1,000 live births, rather than as a raw count.

## Why the distinction matters

The groups overlap: neonatal deaths are part of infant deaths, and infant deaths are part of under-five deaths. The values are not interchangeable, and subtracting one published rate from another does not necessarily produce a valid count for the remaining age interval. Check the source definition and estimation method before making that calculation.

## Estimates and uncertainty

The WDI child-mortality series in this explorer are attributed to UN IGME and partners. They are estimates assembled from available information, not a direct count of every death. The imported WDI tables do not include row-level uncertainty bounds. Treat a displayed value as a source estimate for its stated year, not as an exact census count.

Coverage also differs by indicator and country. A missing year is not evidence that no deaths occurred. Keep gaps visible and consult the dataset methodology when comparing trends.', 4),
    ('Health Explainers', 'What a maternal mortality ratio measures',
     'The denominator is live births, while the underlying measure concerns pregnancy-related deaths.',
     'what-maternal-mortality-ratio-measures',
     'A maternal mortality ratio relates maternal deaths to live births in the same period. Its numerator and denominator describe different events, so it should not be confused with a percentage of pregnancies ending in death.',
     '## Definition and unit

The WDI maternal mortality indicator is expressed as maternal deaths per 100,000 live births. Maternal death refers to death during pregnancy or within 42 days after pregnancy ends, from a cause related to or aggravated by pregnancy or its management, excluding accidental or incidental causes under the applicable definition.

## Why the value is modelled

Maternal deaths are difficult to measure consistently where registration and cause-of-death data are incomplete. The WDI series is a modelled estimate. Its documented method uses information including maternal-death proportions, fertility, skilled birth attendance and gross domestic product at purchasing power parity. Providers named for the estimate include WHO, UNICEF, UNFPA and the World Bank Group.

## Reading a comparison

This ratio is not a count and is not a personal probability for an individual pregnancy. The project’s WDI download has no row-level uncertainty interval. Compare years and countries with the method, coverage and release in view, and do not describe the modelled values as officially reported national counts.', 4)
) AS v(category_name, title, subtitle, slug, introduction, content, reading_minutes)
JOIN article_categories c ON c.name = v.category_name
ON CONFLICT (slug) DO NOTHING;

INSERT INTO article_references (article_id, display_order, label, url)
SELECT a.id, r.display_order, r.label, r.url
FROM (VALUES
    ('reading-wdi-health-series', 1, 'World Bank WDI source 2', 'https://api.worldbank.org/v2/source/2'),
    ('reading-wdi-health-series', 2, 'World Bank Indicators API documentation', 'https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures'),
    ('understanding-child-mortality-measures', 1, 'UN Inter-agency Group for Child Mortality Estimation', 'https://childmortality.org/'),
    ('understanding-child-mortality-measures', 2, 'World Bank WDI: under-five mortality', 'https://data.worldbank.org/indicator/SH.DYN.MORT'),
    ('what-maternal-mortality-ratio-measures', 1, 'World Bank WDI: maternal mortality ratio', 'https://data.worldbank.org/indicator/SH.STA.MMRT'),
    ('what-maternal-mortality-ratio-measures', 2, 'WHO: maternal mortality', 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality')
) AS r(article_slug, display_order, label, url)
JOIN articles a ON a.slug = r.article_slug
WHERE NOT EXISTS (
    SELECT 1 FROM article_references existing
    WHERE existing.article_id = a.id AND existing.url = r.url
);

INSERT INTO article_topics (article_id, topic_id)
SELECT a.id, t.id
FROM (VALUES
    ('reading-wdi-health-series', 'global-health'),
    ('understanding-child-mortality-measures', 'child-infant-mortality'),
    ('what-maternal-mortality-ratio-measures', 'maternal-mortality')
) AS rel(article_slug, topic_slug)
JOIN articles a ON a.slug = rel.article_slug
JOIN topics t ON t.slug = rel.topic_slug
ON CONFLICT DO NOTHING;

INSERT INTO article_indicators (article_id, indicator_id)
SELECT a.id, i.id
FROM (VALUES
    ('reading-wdi-health-series', 'life-expectancy-birth-total'),
    ('reading-wdi-health-series', 'under-five-mortality-rate'),
    ('reading-wdi-health-series', 'infant-mortality-rate'),
    ('reading-wdi-health-series', 'neonatal-mortality-rate'),
    ('reading-wdi-health-series', 'maternal-mortality-ratio'),
    ('reading-wdi-health-series', 'births-attended-skilled-personnel'),
    ('understanding-child-mortality-measures', 'under-five-mortality-rate'),
    ('understanding-child-mortality-measures', 'infant-mortality-rate'),
    ('understanding-child-mortality-measures', 'neonatal-mortality-rate'),
    ('what-maternal-mortality-ratio-measures', 'maternal-mortality-ratio')
) AS rel(article_slug, indicator_slug)
JOIN articles a ON a.slug = rel.article_slug
JOIN indicators i ON i.slug = rel.indicator_slug
ON CONFLICT DO NOTHING;

INSERT INTO glossary_terms (term, slug, definition, extended_explanation)
VALUES
    ('Life expectancy at birth', 'life-expectancy-at-birth',
     'The expected years a newborn would live if the mortality patterns for a specified population and period continued throughout life.',
     'This is a population-level life-table summary, not a prediction for an individual. The WDI series combines inputs named in its metadata, including World Population Prospects, national statistical offices and Eurostat. The downloaded values have no row-level reported-versus-estimated flag.'),
    ('Neonatal mortality rate', 'neonatal-mortality-rate',
     'The probability of dying during the first 28 completed days of life, commonly expressed per 1,000 live births.',
     'Neonatal mortality is the earliest age window in the child mortality series. It is included within infant and under-five mortality measures; the rates should not be treated as interchangeable.'),
    ('Infant mortality rate', 'infant-mortality-rate',
     'The probability of dying before the first birthday, commonly expressed per 1,000 live births.',
     'The WDI series in this explorer is attributed to UN IGME and partners. It is an estimate, not a direct count of every infant death.'),
    ('Under-five mortality rate', 'under-five-mortality-rate',
     'The probability that a newborn would die before reaching age five under the age-specific mortality rates of a specified period, commonly expressed per 1,000 live births.',
     'The WDI series is attributed to UN IGME and partners. It is an estimated probability rather than a raw death count. Missing country-years must not be interpreted as zero.'),
    ('Maternal mortality ratio', 'maternal-mortality-ratio',
     'The number of maternal deaths per 100,000 live births in a specified period.',
     'The WDI series is modelled using multiple inputs because maternal death registration is incomplete in many settings. The numerator concerns pregnancy-related deaths; the denominator is live births, so the ratio is not a percentage of pregnancies.'),
    ('Skilled birth attendance', 'skilled-birth-attendance',
     'The percentage of deliveries attended by health personnel trained to provide essential supervision, care and advice during pregnancy, childbirth and the postnatal period.',
     'The WDI series draws on survey programs and has irregular country-year coverage in this extract. An absent year is not an estimate and should not be filled by interpolation.'),
    ('Modelled estimate', 'modelled-estimate',
     'A value produced by applying a statistical model to available data and assumptions when a direct, complete measurement is unavailable.',
     'A modelled estimate can support comparisons while still carrying uncertainty. Check the source’s methods and whether uncertainty intervals are supplied; this WDI extract does not include row-level intervals.'),
    ('Live birth', 'live-birth',
     'A birth in which the newborn shows signs of life after separation from the mother, regardless of the duration of pregnancy.',
     'Live births are the denominator for several mortality rates and ratios. Always retain the source’s stated denominator when interpreting or comparing measures.')
ON CONFLICT (slug) DO UPDATE
SET term = EXCLUDED.term,
    definition = EXCLUDED.definition,
    extended_explanation = EXCLUDED.extended_explanation,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO glossary_references (glossary_term_id, display_order, label, url)
SELECT g.id, r.display_order, r.label, r.url
FROM (VALUES
    ('life-expectancy-at-birth', 1, 'World Bank WDI: life expectancy at birth', 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN'),
    ('neonatal-mortality-rate', 1, 'World Bank WDI: neonatal mortality', 'https://data.worldbank.org/indicator/SH.DYN.NMRT'),
    ('infant-mortality-rate', 1, 'World Bank WDI: infant mortality', 'https://data.worldbank.org/indicator/SP.DYN.IMRT.IN'),
    ('under-five-mortality-rate', 1, 'UN Inter-agency Group for Child Mortality Estimation', 'https://childmortality.org/'),
    ('under-five-mortality-rate', 2, 'World Bank WDI: under-five mortality', 'https://data.worldbank.org/indicator/SH.DYN.MORT'),
    ('maternal-mortality-ratio', 1, 'World Bank WDI: maternal mortality ratio', 'https://data.worldbank.org/indicator/SH.STA.MMRT'),
    ('maternal-mortality-ratio', 2, 'WHO: maternal mortality', 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality'),
    ('skilled-birth-attendance', 1, 'World Bank WDI: births attended by skilled health staff', 'https://data.worldbank.org/indicator/SH.STA.BRTC.ZS'),
    ('live-birth', 1, 'WHO: maternal mortality definitions', 'https://www.who.int/news-room/fact-sheets/detail/maternal-mortality')
) AS r(term_slug, display_order, label, url)
JOIN glossary_terms g ON g.slug = r.term_slug
WHERE NOT EXISTS (
    SELECT 1 FROM glossary_references existing
    WHERE existing.glossary_term_id = g.id AND existing.url = r.url
);

INSERT INTO glossary_topics (glossary_term_id, topic_id)
SELECT g.id, t.id
FROM (VALUES
    ('life-expectancy-at-birth', 'life-expectancy'),
    ('neonatal-mortality-rate', 'child-infant-mortality'),
    ('infant-mortality-rate', 'child-infant-mortality'),
    ('under-five-mortality-rate', 'child-infant-mortality'),
    ('maternal-mortality-ratio', 'maternal-mortality'),
    ('skilled-birth-attendance', 'maternal-mortality')
) AS rel(term_slug, topic_slug)
JOIN glossary_terms g ON g.slug = rel.term_slug
JOIN topics t ON t.slug = rel.topic_slug
ON CONFLICT DO NOTHING;

INSERT INTO glossary_indicators (glossary_term_id, indicator_id)
SELECT g.id, i.id
FROM (VALUES
    ('life-expectancy-at-birth', 'life-expectancy-birth-total'),
    ('neonatal-mortality-rate', 'neonatal-mortality-rate'),
    ('infant-mortality-rate', 'infant-mortality-rate'),
    ('under-five-mortality-rate', 'under-five-mortality-rate'),
    ('maternal-mortality-ratio', 'maternal-mortality-ratio'),
    ('skilled-birth-attendance', 'births-attended-skilled-personnel')
) AS rel(term_slug, indicator_slug)
JOIN glossary_terms g ON g.slug = rel.term_slug
JOIN indicators i ON i.slug = rel.indicator_slug
ON CONFLICT DO NOTHING;

INSERT INTO glossary_articles (glossary_term_id, article_id)
SELECT g.id, a.id
FROM (VALUES
    ('life-expectancy-at-birth', 'reading-wdi-health-series'),
    ('neonatal-mortality-rate', 'understanding-child-mortality-measures'),
    ('infant-mortality-rate', 'understanding-child-mortality-measures'),
    ('under-five-mortality-rate', 'understanding-child-mortality-measures'),
    ('maternal-mortality-ratio', 'what-maternal-mortality-ratio-measures'),
    ('skilled-birth-attendance', 'reading-wdi-health-series')
) AS rel(term_slug, article_slug)
JOIN glossary_terms g ON g.slug = rel.term_slug
JOIN articles a ON a.slug = rel.article_slug
ON CONFLICT DO NOTHING;
