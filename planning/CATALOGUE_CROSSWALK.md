# Global Health Explorer — Final Proposed Catalogue Crosswalk

**Status:** planning baseline, based on the approved catalogue decisions and a read-only inspection of the project and PostgreSQL database. This document does not change application files, reference data, or database state.

## 1. Verified catalogue inventory

The live database contains **12 countries, 9 topics, 48 indicators, 8 source organizations, 0 datasets, and 0 health observations**. All 48 indicators have `preferred_direction = NEUTRAL`; all 48 database indicator descriptions are blank.

The frontend `frontend/src/data/health.ts` contains **12 countries and 9 topics**. Eight topics have five indicators each; `global-health` is the ninth, overview topic and has no direct indicators. Thus, the prior report's statement that the frontend had 8 topics was a counting error: it omitted the overview topic. The verified topic count is **9 in both systems**. The frontend has 40 indicator entries before the approved antenatal replacement; replacing one generic entry with two entries yields **41 frontend indicator placements**, but not 41 distinct database indicators.

All frontend countries match database countries by ISO-3 code and name. The frontend's country `id` values are URL slugs; the database uses generated numeric primary keys plus ISO-2/ISO-3 codes. Preserve frontend slugs as aliases, with ISO-3 as the canonical public ID. Topic names match; the only topic slug mismatch is frontend `child-mortality` versus database `child-infant-mortality`.

## 2. Decision vocabulary and activation policy

- **Approved mapping** — the concept and unit are sufficiently aligned to point to the specified database indicator slug. Dataset-specific comparability still must be checked before displaying observations.
- **Conditional mapping** — a likely database counterpart exists, but definition, age adjustment, denominator, dimension, or unit requires review before the mapping is final.
- **Planned/unmatched** — no database indicator is suitable now, or an approved dimension/definition is not yet represented. Retain the entry in a planned, inactive catalogue; do not expose it as an available measure.
- **Duplicate/presentation-only** — more than one frontend entry presents one underlying concept. Reuse one canonical database indicator and observation series; do not create duplicate indicator or observation records.

An approved catalogue mapping does not mean real data is available. The database currently has no datasets or observations. **None of the indicators can currently be presented as having an available real-world series.** Activate/display a real series only after a reliable, licensed, documented dataset has been registered and its indicator mapping, units, coverage, and provenance have been checked. Keep synthetic teaching observations separate from this catalogue/API path and never mark or migrate them as verified observations.

## 3. Complete frontend indicator crosswalk

The database names and slugs below are existing catalogue records. Proposed display-name normalizations do not authorize changing those records; any future catalogue edits must be versioned and reviewed. “No source yet” applies to all rows because the database has zero datasets.

| Frontend topic | Frontend indicator ID | Frontend indicator name | Frontend unit | Database indicator name and slug, if applicable | Proposed canonical display name | Mapping decision | Outstanding definition/unit/source requirements | Notes about duplicates or topic relationships |
|---|---|---|---|---|---|---|---|---|
| Causes of Death | `death-rate` | Deaths from all causes | deaths per 100,000 people | Age-standardized death rate (all causes) — `age-standardized-death-rate-all-causes` | Age-standardized death rate (all causes) | Conditional mapping | Confirm age-standardization method, population denominator, and whether the source reports a rate per 100,000. No source dataset yet. | Frontend name omits age standardization; do not present as a crude rate without review. |
| Causes of Death | `cardio-deaths` | Cardiovascular deaths | deaths per 100,000 people | Age-standardized cardiovascular disease death rate — `age-standardized-cvd-death-rate` | Age-standardized cardiovascular disease death rate | Duplicate/presentation-only (conditional) | Confirm age adjustment, cardiovascular cause definition, and rate denominator. No source dataset yet. | Reuses the same proposed canonical indicator as `cvd-mortality`; do not create a second series. Its count-like name is misleading for a rate and should be normalized in presentation. |
| Causes of Death | `cancer-deaths` | Cancer deaths | deaths per 100,000 people | Cancer mortality rate (age-standardized) — `cancer-mortality-rate-age-standardized` | Age-standardized cancer mortality rate | Duplicate/presentation-only (conditional) | Confirm age adjustment, denominator, and included cancer sites. No source dataset yet. | Reuses the same proposed canonical indicator as `cancer-mortality`; do not create duplicate records. |
| Causes of Death | `respiratory-deaths` | Respiratory disease deaths | deaths per 100,000 people | — | Respiratory disease death rate (planned) | Planned/unmatched | Define included respiratory causes, age adjustment, denominator, and whether rate or count is intended. Identify a reliable source before proposing a database indicator. | Similarity to cause-specific death indicators is not evidence that this entry is already covered. |
| Causes of Death | `infectious-deaths` | Infectious disease deaths | deaths per 100,000 people | — | Infectious disease death rate (planned) | Planned/unmatched | Define included infectious causes, age adjustment, denominator, and rate/count semantics; identify source. | Do not infer coverage from `deaths-by-specific-cause`; its dimensions and mapping rules are not yet defined. |
| Child & Infant Mortality | `under-five` | Under-five mortality rate | deaths per 1,000 live births | Under-five mortality rate — `under-five-mortality-rate` | Under-five mortality rate | Approved mapping | Confirm dataset definition and uncertainty/status metadata; source dataset required before observations are active. | Canonical topic is Child & Infant Mortality (`child-infant-mortality`). |
| Child & Infant Mortality | `infant` | Infant mortality rate | deaths per 1,000 live births | Infant mortality rate — `infant-mortality-rate` | Infant mortality rate | Approved mapping | Confirm age boundary, live-birth denominator, coverage, and source dataset. | Use database slug. |
| Child & Infant Mortality | `neonatal` | Neonatal mortality rate | deaths per 1,000 live births | Neonatal mortality rate — `neonatal-mortality-rate` | Neonatal mortality rate | Approved mapping | Confirm neonatal period definition, denominator, coverage, and source dataset. | Use database slug. |
| Child & Infant Mortality | `child-1-4` | Child mortality, ages 1–4 | deaths per 1,000 children | — | Mortality rate among children aged 1–4 (planned) | Planned/unmatched | Resolve exact age interval and denominator (person-years, population, or other); rate is not interchangeable with probability of dying. Find source. | Not equivalent to database probability of dying ages 5–14. |
| Child & Infant Mortality | `births-attended` | Births attended by skilled staff | % of births | Births attended by skilled health personnel — `births-attended-skilled-personnel` | Births attended by skilled health personnel | Duplicate/presentation-only | Confirm skilled personnel definition and numerator/denominator; dataset/source required. | Reuses `skilled-birth`; one indicator and series only. It may be surfaced as related under this topic, but canonical ownership remains Maternal Mortality. |
| Life Expectancy | `life-expectancy` | Life expectancy at birth | years | Life expectancy at birth (total) — `life-expectancy-birth-total` | Life expectancy at birth (total) | Approved mapping | Confirm period/cohort life-table interpretation, population coverage, and source dataset. | Database display name is more explicit; preserve frontend explanatory copy. |
| Life Expectancy | `healthy-life` | Healthy life expectancy | years | Healthy life expectancy at birth (HALE) — `healthy-life-expectancy-birth` | Healthy life expectancy at birth (HALE) | Conditional mapping | Confirm that frontend concept means WHO-style HALE at birth and review health-state/method definition. Source dataset required. | Do not conflate with years lived with disability. |
| Life Expectancy | `male-life` | Life expectancy at birth, males | years | Life expectancy at birth (male) — `life-expectancy-birth-male` | Life expectancy at birth (male) | Approved mapping | Confirm sex classification and dataset population/method; source required. | Use canonical database slug. |
| Life Expectancy | `female-life` | Life expectancy at birth, females | years | Life expectancy at birth (female) — `life-expectancy-birth-female` | Life expectancy at birth (female) | Approved mapping | Confirm sex classification and dataset population/method; source required. | Use canonical database slug. |
| Life Expectancy | `life-age-60` | Life expectancy at age 60 | additional years | Life expectancy at age 60 — `life-expectancy-age-60` | Life expectancy at age 60 | Conditional mapping | Explicitly document that the value is expected additional years conditional on reaching age 60; verify dataset unit and method. | Database unit is stored as `years`; API/display definition should clarify additional years. |
| Mental Health | `depression` | Depression prevalence | % of population | Prevalence of depressive disorders — `prevalence-depressive-disorders` | Prevalence of depressive disorders | Conditional mapping | Define disorder criteria, reference period, age range, and denominator; source dataset required. | Similar concept, but frontend's broad label does not establish the same case definition. |
| Mental Health | `anxiety` | Anxiety disorder prevalence | % of population | Prevalence of anxiety disorders — `prevalence-anxiety-disorders` | Prevalence of anxiety disorders | Conditional mapping | Define disorder criteria, reference period, age range, and denominator; source dataset required. | Use database slug only after dataset mapping review. |
| Mental Health | `mental-disorder` | Mental disorder prevalence | % of population | Prevalence of all mental health disorders — `prevalence-all-mental-disorders` | Prevalence of all mental health disorders | Conditional mapping | Enumerate included disorders and establish whether condition estimates overlap or are combined; source dataset required. | A composite cannot be inferred by summing separate prevalence values. |
| Mental Health | `suicide-rate` | Suicide mortality rate | deaths per 100,000 people | Suicide death rate — `suicide-death-rate` | Suicide death rate | Conditional mapping | Confirm age standardization, denominator, coding/reporting practices, and dataset status. | Name similarity alone does not establish adjustment or comparability. |
| Mental Health | `mental-disability` | Years lived with disability | years | — | Years lived with disability from mental disorders (planned) | Planned/unmatched | Define whether this is total YLDs, YLD rate, or another measure, and which disorders are included. Source and unit required. | Not interchangeable with HALE or DALYs. Database has no mental-health YLD indicator. |
| Cardiovascular Diseases | `cvd-mortality` | Cardiovascular disease mortality | deaths per 100,000 people | Age-standardized cardiovascular disease death rate — `age-standardized-cvd-death-rate` | Age-standardized cardiovascular disease death rate | Duplicate/presentation-only (conditional) | Confirm frontend series is age-standardized and uses the database indicator's cause definition and denominator; source required. | Same proposed canonical series as `cardio-deaths`; normalize both UI labels to avoid duplicate cards. |
| Cardiovascular Diseases | `ischemic-heart` | Ischemic heart disease mortality | deaths per 100,000 people | Ischaemic heart disease death rate — `ischaemic-heart-disease-death-rate` | Ischaemic heart disease death rate | Conditional mapping | Confirm age adjustment, cause coding, denominator, and dataset. | Spelling differs (US “Ischemic” vs database “Ischaemic”); spelling alias is presentation/search only. |
| Cardiovascular Diseases | `stroke` | Stroke mortality | deaths per 100,000 people | Stroke death rate — `stroke-death-rate` | Stroke death rate | Conditional mapping | Confirm age adjustment, stroke definition, denominator, and source dataset. | Do not assume all stroke series have the same case definition. |
| Cardiovascular Diseases | `cvd-deaths` | Cardiovascular deaths | number of deaths | Total deaths from cardiovascular diseases — `total-cardiovascular-deaths` | Total deaths from cardiovascular diseases | Approved mapping | Confirm cause coding, time period, geographic coverage, and source dataset. | This is a **count**, not the CVD rate used by `cardio-deaths`/`cvd-mortality`; never merge count and rate series. |
| Cardiovascular Diseases | `cvd-burden` | Cardiovascular disease burden | disability-adjusted life years | Disability-adjusted life years (DALYs) from cardiovascular diseases — `cvd-dalys` | DALYs from cardiovascular diseases | Conditional mapping | Verify whether dataset value is **total DALYs** (count of healthy years lost) or a DALY rate (e.g. per population); the database unit `DALYs` does not settle this. Source required. | Do not compare a total DALY count with a DALY rate. Preserve method and age-standardization metadata. |
| Cancer | `cancer-mortality` | Cancer mortality | deaths per 100,000 people | Cancer mortality rate (age-standardized) — `cancer-mortality-rate-age-standardized` | Age-standardized cancer mortality rate | Duplicate/presentation-only (conditional) | Confirm age adjustment, cancer-site scope, denominator, and source. | Reuses `cancer-deaths`; one canonical indicator/series, not two. |
| Cancer | `cancer-incidence` | Cancer incidence | new cases per 100,000 people | Cancer incidence rate (age-standardized) — `cancer-incidence-rate-age-standardized` | Age-standardized cancer incidence rate | Conditional mapping | Confirm age adjustment, cancer-site scope, denominator, and source dataset. | Frontend wording matches broad concept but omits age-standardization. |
| Cancer | `breast-cancer` | Breast cancer mortality | deaths per 100,000 people | Death rate by cancer type — `death-rate-by-cancer-type` (candidate only) | Death rate by cancer type — breast cancer dimension (provisional) | Conditional mapping; unresolved | Define cancer-site dimension values/code system, age adjustment, denominator, site inclusion, and dataset mapping. | Explicitly unresolved by decision 9; do not activate or map observations until dimension support is defined. |
| Cancer | `lung-cancer` | Lung cancer mortality | deaths per 100,000 people | Death rate by cancer type — `death-rate-by-cancer-type` (candidate only) | Death rate by cancer type — lung cancer dimension (provisional) | Conditional mapping; unresolved | Define cancer-site dimension values/code system, age adjustment, denominator, site inclusion, and dataset mapping. | Same candidate indicator as breast/colorectal, with a distinct dimension value; do not create separate canonical indicators by assumption. |
| Cancer | `colorectal-cancer` | Colorectal cancer mortality | deaths per 100,000 people | Death rate by cancer type — `death-rate-by-cancer-type` (candidate only) | Death rate by cancer type — colorectal cancer dimension (provisional) | Conditional mapping; unresolved | Define colorectal site grouping, dimension values/code system, age adjustment, denominator, and dataset mapping. | Explicitly unresolved until the cancer-type dimension is defined and supported. |
| Maternal Mortality | `maternal-ratio` | Maternal mortality ratio | deaths per 100,000 live births | Maternal mortality ratio — `maternal-mortality-ratio` | Maternal mortality ratio | Approved mapping | Verify maternal-death definition, live-birth denominator, period, and source dataset. | Distinct from maternal death counts and lifetime risk. |
| Maternal Mortality | `maternal-deaths` | Maternal deaths | number of deaths | Number of maternal deaths — `number-maternal-deaths` | Number of maternal deaths | Approved mapping | Verify death definition, period, coverage, and source dataset. | **Count**, not the maternal mortality ratio. |
| Maternal Mortality | `maternal-risk` | Lifetime risk of maternal death | % of women | — | Lifetime risk of maternal death (planned) | Planned/unmatched | Specify model, age/fertility assumptions, competing risks, denominator, and source. | Not equivalent to maternal mortality ratio. |
| Maternal Mortality | `skilled-birth` | Skilled birth attendance | % of births | Births attended by skilled health personnel — `births-attended-skilled-personnel` | Births attended by skilled health personnel | Approved mapping | Define skilled personnel, numerator/denominator, and dataset/source. | Canonical placement is Maternal Mortality. `births-attended` is a related presentation under Child & Infant Mortality and reuses this same indicator. |
| Maternal Mortality | `antenatal` (legacy generic entry) | Antenatal care coverage | % of pregnancies | Replaced by: Antenatal care coverage (at least 1 visit) — `antenatal-care-at-least-1-visit`; Antenatal care coverage (at least 4 visits) — `antenatal-care-at-least-4-visits` | Antenatal care coverage (at least 1 visit); Antenatal care coverage (at least 4 visits) | Approved replacement; legacy entry is presentation-only | For each measure, define denominator (pregnant people, pregnancies, or live births), reporting period, visit criteria, and source. The database units are `%`; verify denominator semantics. | Approved decision: replace one generic frontend entry with two distinct canonical indicators. Do not retain generic entry as an active third measure. |
| Air Pollution | `air-deaths` | Air-pollution-attributable deaths | deaths per 100,000 people | Deaths attributed to total air pollution — `deaths-total-air-pollution` (unit: deaths) | Deaths attributed to total air pollution | Conditional mapping | Resolve **count vs rate**. Confirm whether the dataset is total deaths or a population/age-standardized rate, attribution model, denominator, and source. | Database unit is a count; frontend unit is a rate. No conversion or mapping until definition is confirmed. |
| Air Pollution | `household-air` | Household air pollution mortality | deaths per 100,000 people | Deaths attributed to household air pollution — `deaths-household-air-pollution` (unit: deaths) | Deaths attributed to household air pollution | Conditional mapping | Resolve **count vs rate**, attribution model, denominator, age adjustment, and source dataset. | Count and rate are not interchangeable. |
| Air Pollution | `ambient-air` | Ambient air pollution mortality | deaths per 100,000 people | Deaths attributed to ambient air pollution — `deaths-ambient-air-pollution` (unit: deaths) | Deaths attributed to ambient air pollution | Conditional mapping | Resolve **count vs rate**, attribution model, denominator, age adjustment, and source dataset. | Count and rate are not interchangeable. |
| Air Pollution | `pm25` | Average PM2.5 exposure | micrograms per cubic metre | Annual average PM2.5 exposure — `annual-average-pm25-exposure` (unit: µg/m³) | Annual average PM2.5 exposure | Conditional mapping | Confirm population exposure versus ambient concentration, annual aggregation, spatial coverage, and source dataset. | Normalize unit display to `µg/m³` only after confirming the source measure. |
| Air Pollution | `unsafe-air` | Population exposed to unsafe air | % of population | — | Population exposed above a defined air-quality guideline (planned) | Planned/unmatched | Define pollutant(s), guideline and threshold, population exposure method, time period, denominator, and source. | Cannot be inferred from PM2.5 concentration alone. |

### Frontend entries to keep planned/inactive

The following frontend concepts have no approved active database mapping yet: respiratory disease death rate, infectious disease death rate, mortality rate ages 1–4, mental-health years lived with disability, lifetime risk of maternal death, and population exposed to unsafe air. Breast, lung, and colorectal cancer mortality remain planned/conditional until the cancer-type dimension is defined and supported. Keep their useful descriptions and instructional text, but do not present them as available real-world indicators.

## 4. Database indicators without a frontend counterpart

These existing database indicators must remain in the catalogue. “No direct frontend counterpart” means the present frontend does not have a matching entry; it is not a recommendation to delete or hide the database record.

| Database topic | Database indicator name | Database slug | Treatment |
|---|---|---|---|
| Causes of Death | Total deaths from all causes | `total-deaths-all-causes` | Keep; distinct from all-cause death rate (`death-rate` candidate). Count series needs a dataset. |
| Causes of Death | Deaths by specific cause | `deaths-by-specific-cause` | Keep; define cause dimension and distinguish count from rate before frontend mapping. |
| Causes of Death | Share of deaths by cause | `share-of-deaths-by-cause` | Keep; define numerator, denominator, mutually exclusive cause handling, and dataset. |
| Causes of Death | Share of deaths with a registered cause | `share-deaths-registered-cause` | Keep; define registration/completeness denominator and source. |
| Child & Infant Mortality | Number of neonatal deaths | `number-neonatal-deaths` | Keep; distinct from neonatal mortality rate. Requires reliable count dataset. |
| Child & Infant Mortality | Number of under-five deaths | `number-under-five-deaths` | Keep; distinct from under-five mortality rate. Requires reliable count dataset. |
| Child & Infant Mortality | Probability of dying between ages 5 and 14 | `probability-dying-ages-5-14` | Keep; distinct from ages 1–4 mortality and requires explicit probability definition/source. |
| Life Expectancy | Adult mortality rate (ages 15–60) | `adult-mortality-rate-15-60` | Keep; frontend has no counterpart. Define denominator/unit precisely and obtain a dataset. |
| Mental Health | Prevalence of bipolar disorder | `prevalence-bipolar-disorder` | Keep; no frontend entry. Define diagnostic/source scope and obtain a dataset. |
| Mental Health | Prevalence of schizophrenia | `prevalence-schizophrenia` | Keep; no frontend entry. Define diagnostic/source scope and obtain a dataset. |
| Cardiovascular Diseases | Prevalence of hypertension among adults aged 30–79 | `hypertension-prevalence-adults-30-79` | Keep; no frontend entry. Define measurement/diagnosis and denominator; obtain a dataset. |
| Cancer | New cancer cases | `new-cancer-cases` | Keep; distinct from cancer incidence rate. Count, site coverage, and dataset required. |
| Cancer | Prevalence of cancer | `cancer-prevalence` | Keep; no frontend entry. Define point/period prevalence, survivor scope, and dataset. |
| Cancer | Death rate by cancer type | `death-rate-by-cancer-type` | Keep; potential shared indicator for subtype presentations, but do not map the three frontend cancer entries until cancer-site dimension support and definitions are approved. |
| Maternal Mortality | Number of maternal deaths | `number-maternal-deaths` | Has frontend counterpart `maternal-deaths`; retained here for completeness, so it is not database-only. |
| Maternal Mortality | Births attended by skilled health personnel | `births-attended-skilled-personnel` | Has frontend counterparts `skilled-birth` and `births-attended`; one canonical indicator, not database-only. |
| Maternal Mortality | Antenatal care coverage (at least 4 visits) | `antenatal-care-at-least-4-visits` | Approved replacement for one half of the generic frontend entry; retain distinct from 1-visit coverage. |
| Maternal Mortality | Antenatal care coverage (at least 1 visit) | `antenatal-care-at-least-1-visit` | Approved replacement for one half of the generic frontend entry; retain distinct from 4-visit coverage. |
| Air Pollution | Annual average PM10 concentration | `annual-average-pm10-concentration` | Keep; no frontend entry. Define concentration/aggregation and obtain a dataset. |
| Air Pollution | Annual average nitrogen dioxide (NO₂) concentration | `annual-average-no2-concentration` | Keep; no frontend entry. Define concentration/aggregation and obtain a dataset. |

There are **15 indicators with no frontend counterpart** in the current catalogue. `death-rate-by-cancer-type` is also not currently usable by the frontend: it is a candidate for the unresolved cancer-site presentations, pending dimension support. The other four rows in this table have approved frontend counterparts or replacements and are included to make explicit that their database records remain canonical.

## 5. Duplicate and presentation-only frontend entries

1. `births-attended` (Child & Infant Mortality) and `skilled-birth` (Maternal Mortality) describe skilled attendance at birth. Both resolve to `births-attended-skilled-personnel`. Use one canonical indicator and series; the child topic may link to it as related content.
2. `cardio-deaths` (Causes of Death) and `cvd-mortality` (Cardiovascular Diseases) both appear to describe a cardiovascular death rate. Reuse `age-standardized-cvd-death-rate` only after confirming age adjustment and definition. The Causes of Death item is not a separate count despite its name.
3. `cancer-deaths` (Causes of Death) and `cancer-mortality` (Cancer) both appear to describe a cancer death rate. Reuse `cancer-mortality-rate-age-standardized` only after confirming age adjustment/scope.
4. `cvd-deaths` is not a duplicate of either cardiovascular rate: it is a **number of deaths**. Counts and rates require separate canonical indicators/series.
5. `maternal-ratio` and `maternal-deaths` are not duplicates: one is a ratio per 100,000 live births, the other a count.
6. Air-pollution-attributable total/household/ambient mortality are distinct scopes, and each frontend unit is a rate while its database counterpart is a count. Do not merge or relabel them without unit and definition review.

## 6. Definitions, units, direction, and provenance to add/review

Before catalogue API publication, provide a reviewed definition and unit explanation for every database indicator. V2 seeds names/slugs/units but **no descriptions**. Definitions should include the population, numerator, denominator, age/sex coverage, time basis, inclusion/exclusion rules, aggregation, and whether values are observed, estimated, modeled, or projected. Dataset metadata should capture source citation/URL, license, release/version, update frequency, coverage, method, and limitations.

Resolve these unit/measure distinctions explicitly:

- Death counts (`deaths`) versus rates (`deaths per 100,000 people`) and ratios (`deaths per 100,000 live births`).
- Crude versus age-standardized rates; the database names specify age-standardization for some measures, but the source series must be checked.
- Counts of cancer cases/deaths versus incidence/mortality rates.
- Total DALYs versus DALY rates; the database unit `DALYs` does not identify the denominator. Do not treat YLDs, DALYs, and HALE as interchangeable.
- Percentages require a named denominator and reference population; “% of births,” “% of pregnancies,” and “% of population” are not interchangeable.
- Air pollution death counts in PostgreSQL versus frontend rates per 100,000.
- Life expectancy at age 60 is additional expected years, even though the database unit is simply `years`.
- PM2.5 “exposure” versus concentration and canonical unit rendering.

Keep all `preferred_direction` values **NEUTRAL** unless each direction is explicitly reviewed and documented with a rationale. Do not infer direction from indicator names. In particular, interpretation may depend on measure definition, population, inequality, and context. Store/display the database value as-is until a reviewed change.

Preserve frontend descriptions, `howToRead` text, flags, topic colors/icons, introductions, and related-topic presentation. These are not currently in the reference database and should remain presentation content keyed to canonical country/topic/indicator identifiers. Review indicator descriptions against source definitions before moving any into authoritative catalogue metadata; do not discard them or imply they are source-verified definitions.

## 7. Identifier and relationship contract recommendations

- Country public ID: ISO-3 (`PAK`, `USA`, etc.). Preserve existing frontend slugs (`pakistan`, `united-states`, etc.) as aliases/redirects. Keep numeric DB keys internal.
- Topic public ID: database slug. Keep `child-mortality` as an alias to `child-infant-mortality`; all other current topic slugs already match.
- Indicator public ID: database slug. Frontend-local IDs are aliases only during transition and must resolve through this approved crosswalk; do not expose them as canonical API IDs.
- Topic-indicator relation: one canonical indicator belongs to its authoritative topic. Related-topic placement is a reference/link, not a second indicator record. Skilled birth attendance remains owned by Maternal Mortality and can be related from Child & Infant Mortality.
- Observation relation: stable country ISO-3 + indicator slug + dataset identity + year + dimensions. Return linked country, indicator/unit, dataset and source provenance. Do not identify observations by frontend IDs.
- Availability: return catalogue metadata separately from data availability. An active/reference indicator may legitimately have no observations; the API/UI must show “no published data” rather than zero.

## 8. Approved decisions

- Countries use ISO-3 as canonical public IDs; preserve current frontend country slugs as aliases.
- Topics use database slugs; preserve `child-mortality` as an alias for `child-infant-mortality`.
- Indicators use database slugs; PostgreSQL is authoritative for the reference catalogue.
- Preserve frontend descriptions, instructional text, flags, colors, and presentation-specific information.
- Keep the 192 synthetic frontend teaching observations separate from real observations; do not migrate or represent them as verified data.
- Replace generic antenatal care with the two distinct database indicators: at least one visit and at least four visits.
- Skilled birth attendance is one canonical Maternal Mortality indicator and may be linked from Child & Infant Mortality without duplicating its record.
- Keep breast, lung, and colorectal cancer mortality unresolved until a cancer-type dimension is defined and supported.
- Retain unmatched frontend entries in a planned/inactive catalogue; do not silently delete them or present them as available.
- Preserve `NEUTRAL` preferred direction unless an alternative is explicitly reviewed and justified.

## 9. Unresolved decisions and planned indicators

### Unresolved decisions

- Confirm age standardization, denominator, scope, and dataset definitions for all conditional death-rate mappings (all-cause, cardiovascular, cancer, suicide, and air-pollution measures).
- Resolve the count-versus-rate mismatch for total, household, and ambient air-pollution deaths.
- Decide the canonical definition and unit for CVD DALYs: total DALYs or a population-standardized DALY rate.
- Define the dimensions and source mapping for cancer type before mapping breast/lung/colorectal mortality.
- Define exact case definitions and denominators for mental-health prevalence, skilled birth attendance, antenatal coverage, and life expectancy at age 60.
- Review every indicator definition, unit explanation, and preferred direction. No direction change is approved here.
- Select reliable, licensed datasets and complete source/methodology metadata. There are currently none registered.

### Planned/inactive indicators

- Respiratory disease death rate.
- Infectious disease death rate.
- Mortality rate among children ages 1–4.
- Years lived with disability from mental disorders (unit and scope unresolved).
- Lifetime risk of maternal death.
- Population exposed above a defined air-quality threshold.
- Breast, lung, and colorectal cancer mortality presentations, pending the cancer-type dimension (candidate shared indicator: `death-rate-by-cancer-type`).
- Legacy generic antenatal-care entry is not a planned third measure; it is replaced by the two distinct visit-threshold indicators.

## 10. Database-only indicators

After accounting for approved mappings and replacements, these **16 database indicators have no active frontend counterpart** and should remain in PostgreSQL. Fifteen have no frontend concept; the sixteenth, cancer-type death rate, is only a candidate for the unresolved subtype presentations:

1. `total-deaths-all-causes` — Total deaths from all causes.
2. `deaths-by-specific-cause` — Deaths by specific cause.
3. `share-of-deaths-by-cause` — Share of deaths by cause.
4. `share-deaths-registered-cause` — Share of deaths with a registered cause.
5. `number-neonatal-deaths` — Number of neonatal deaths.
6. `number-under-five-deaths` — Number of under-five deaths.
7. `probability-dying-ages-5-14` — Probability of dying between ages 5 and 14.
8. `adult-mortality-rate-15-60` — Adult mortality rate (ages 15–60).
9. `prevalence-bipolar-disorder` — Prevalence of bipolar disorder.
10. `prevalence-schizophrenia` — Prevalence of schizophrenia.
11. `hypertension-prevalence-adults-30-79` — Prevalence of hypertension among adults aged 30–79.
12. `new-cancer-cases` — New cancer cases.
13. `cancer-prevalence` — Prevalence of cancer.
14. `annual-average-pm10-concentration` — Annual average PM10 concentration.
15. `annual-average-no2-concentration` — Annual average nitrogen dioxide (NO₂) concentration.
16. `death-rate-by-cancer-type` — Death rate by cancer type; candidate for the three unresolved cancer-type presentations, but not a usable frontend counterpart until dimension support is defined.

Thus, **16 database indicators currently have no active frontend counterpart** when the unresolved cancer-type candidate is counted. No database-only entry should be deleted.

The antenatal one-visit and four-visit indicators are not in this list because the approved frontend replacement explicitly represents both. `number-maternal-deaths` and `births-attended-skilled-personnel` have frontend counterparts. All 48 database indicators still require a reliable dataset before a real observation series can be considered available.

## 11. Requirements before API contracts are finalized

1. Ratify this crosswalk at the definition/unit level, especially all conditional mappings and the duplicate presentations.
2. Define database metadata fields/DTO representation for reviewed indicator definitions, unit explanations, status/availability, source/dataset provenance, and dimension semantics. Keep preferred direction neutral until reviewed.
3. Define the cancer-type dimension and verify that observation uniqueness and dataset mappings support it before resolving subtype presentations.
4. Select/register reliable datasets with licenses, citations, versions, methods, coverage, and update frequency; validate source-to-indicator mappings and unit conversions.
5. Specify API identifier aliases/redirects for country slugs, the `child-mortality` topic alias, and frontend indicator-ID transition; ensure the API uses only canonical ISO-3/topic/indicator IDs in responses.
6. Define how no-data, missing values, counts, rates, percentages, and total/rate DALY values are represented and rendered; never encode unavailable data as zero.
7. Keep synthetic teaching examples on an isolated demo path with explicit labels and no route into verified observation storage.
8. Preserve presentation content through canonical-ID keyed frontend metadata; do not make frontend copy appear source-verified unless reviewed.
