# Stage 6B — WDI Health Batch: Sources, Coverage, and Import Setup

> **Import follow-up:** The dataset was registered and imported in Stage 6C. The first upload hit the importer's eight-decimal-place limit for 315 life-expectancy rows; those rows were retried from a precision-preserving derived CSV with an explicit rounding note. The source CSV and raw WDI archives were retained unchanged. Final coverage and batch verification are in [`IMPORT_VERIFICATION.md`](IMPORT_VERIFICATION.md).

**Retrieved:** 2026-11-15  
**World Bank WDI release timestamp in the downloaded archives:** 2026-11-11  
**Status:** six-series filtered extract prepared and validated against the original WDI ZIPs. No database was changed.

## Retrieval method and reproducibility

Stage 6A JSON data requests were intermittently unavailable. For this stage, the data were retrieved with the World Bank's documented CSV-download endpoint, which returns a ZIP:

```text
https://api.worldbank.org/v2/country/all/indicator/{INDICATOR_CODE}?source=2&downloadformat=csv
```

The official [Indicators API documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures) documents CSV downloads as ZIP files. The downloaded archives contain the full WDI country/year table plus `Metadata_Indicator` and `Metadata_Country` CSVs. `source=2` is World Development Indicators. The source data table is stamped `Last Updated Date,2026-11-11`.

The import CSV was produced by retaining only the 12 ISO-3 codes seeded in this project and each non-empty annual cell for the six selected series. The code used in the CSV is the original WDI indicator code; the dataset mapping must resolve it to the database slug. Blank source cells were omitted; no values were interpolated, rounded, or replaced with zero. Literal numeric zeros, if present, remain numeric zeros. Each selected archive and the filtered CSV are retained below for reproducibility.

The import file has no dimensions column because these six WDI rows are national aggregate series without additional disaggregations. The source CSV does not provide a row-level status field. `value_status` therefore records the status supported by each series' metadata, not a row-specific flag; details and limits are stated below.

## Selected indicators and coverage

| Database indicator slug | WDI series name and code | Unit (exact CSV/mapping unit) | Source-defined measure and provider | Status in CSV | Rows | Countries | Years with observations |
|---|---|---|---|---|---:|---:|---|
| `life-expectancy-birth-total` | Life expectancy at birth, total (years) — `SP.DYN.LE00.IN` | `years` | Expected years a newborn would live if mortality patterns at birth persisted through life. WDI lists UN World Population Prospects, national statistical offices, and Eurostat inputs. | `ESTIMATED`* | 780 | 12 | 1960–2024 |
| `under-five-mortality-rate` | Mortality rate, under-5 (per 1,000 live births) — `SH.DYN.MORT` | `deaths per 1,000 live births` | Probability per 1,000 of a newborn dying before age five under the year's age-specific mortality rates. WDI attributes the series to UN IGME and partners. | `ESTIMATED` | 733 | 12 | 1960–2024 |
| `infant-mortality-rate` | Mortality rate, infant (per 1,000 live births) — `SP.DYN.IMRT.IN` | `deaths per 1,000 live births` | Infants dying before age one per 1,000 live births in a given year. WDI attributes the series to UN IGME and partners. | `ESTIMATED` | 731 | 12 | 1960–2024 |
| `neonatal-mortality-rate` | Mortality rate, neonatal (per 1,000 live births) — `SH.DYN.NMRT` | `deaths per 1,000 live births` | Neonates dying before 28 days of age per 1,000 live births in a given year. WDI attributes the series to UN IGME and partners. | `ESTIMATED` | 655 | 12 | 1960–2024 |
| `maternal-mortality-ratio` | Maternal mortality ratio (modeled estimate, per 100,000 live births) — `SH.STA.MMRT` | `deaths per 100,000 live births` | Pregnancy-related deaths during pregnancy or within 42 days after termination per 100,000 live births. WDI documents regression estimation using maternal-death proportions, fertility, birth attendants, and GDP at PPP. Providers named by WDI: WHO, UNICEF, UNFPA, and World Bank Group. | `MODELLED` | 468 | 12 | 1985–2023 |
| `births-attended-skilled-personnel` | Births attended by skilled health staff (% of total) — `SH.STA.BRTC.ZS` | `%` | Percentage of deliveries attended by trained personnel able to supervise and care for pregnancy, delivery, and newborns. WDI names UNICEF's State of the World's Children/Childinfo and the Demographic and Health Surveys Program. | `ESTIMATED`* | 219 | 12 | 1986–2022 |
| **Total** | **6 indicators** |  |  |  | **3,586** |  |  |

`ESTIMATED`* denotes a series-level classification based on WDI source metadata; it is not a per-observation status supplied by WDI.

The value rows were checked against the corresponding raw WDI table cells. Each selected series has observations for all 12 seeded ISO-3 country codes: `AUS`, `BRA`, `CHN`, `DEU`, `GBR`, `IND`, `JPN`, `NGA`, `PAK`, `SAU`, `USA`, and `ZAF`. These are not balanced panels: country/year gaps are left absent. The min/max year is a series-level span and does not mean every country has every year.

Per-country row counts (in the same indicator order as the coverage table):

| ISO-3 | Life expectancy | Under-five | Infant | Neonatal | Maternal ratio | Skilled attendance |
|---|---:|---:|---:|---:|---:|---:|
| `AUS` | 65 | 65 | 65 | 57 | 39 | 30 |
| `BRA` | 65 | 65 | 65 | 62 | 39 | 26 |
| `CHN` | 65 | 56 | 56 | 36 | 39 | 26 |
| `DEU` | 65 | 57 | 57 | 56 | 39 | 22 |
| `GBR` | 65 | 65 | 65 | 65 | 39 | 1 |
| `IND` | 65 | 65 | 65 | 56 | 39 | 8 |
| `JPN` | 65 | 65 | 65 | 57 | 39 | 24 |
| `NGA` | 65 | 61 | 61 | 58 | 39 | 9 |
| `PAK` | 65 | 65 | 65 | 65 | 39 | 17 |
| `SAU` | 65 | 53 | 53 | 36 | 39 | 17 |
| `USA` | 65 | 65 | 65 | 57 | 39 | 32 |
| `ZAF` | 65 | 51 | 49 | 50 | 39 | 7 |

Skilled birth-attendance observations are irregular survey-year observations, not annual values for each country. The file preserves only years present in WDI. In particular, GBR has one observation and should not be presented as a continuous time series.

## Status and methodology limits

WDI's downloaded data tables have annual values but do **not** contain row-level status/uncertainty flags. Statuses in the import CSV are explicitly series-level classifications informed by the matching WDI indicator metadata:

- The three child-mortality indicators are UN IGME series, classified as `ESTIMATED`; they are not direct counts of deaths.
- Maternal mortality is expressly titled a modelled estimate and WDI describes its regression method; it is `MODELLED`.
- Life expectancy is a life-table measure and WDI lists World Population Prospects plus statistical-office/Eurostat inputs. It is classified as `ESTIMATED`, but WDI does not identify which input source applies to each country-year.
- Skilled attendance is sourced from UNICEF/DHS survey programs. It is classified as `ESTIMATED` survey statistics; the release does not provide a per-row survey/source-status flag.

Consequently, do not interpret these status labels as WDI-supplied row-level flags, confidence bounds, or uncertainty estimates. If a stricter row-specific reported-versus-estimated classification is required, the source must provide country/year-level provenance before changing these labels. No confidence intervals were added because they were not present in the downloaded source tables.

The series are annual, but the inspected WDI/API metadata did not state a guaranteed refresh cadence. Values are subject to later WDI revisions. For child mortality and maternal mortality, retain the named international estimation methodology and avoid describing the values as officially reported national statistics.

## Considered but not included

| Candidate | Verified data availability in its WDI archive | Reason not selected |
|---|---|---|
| Antenatal care, at least one visit — `SH.STA.ANVC.ZS` → `antenatal-care-at-least-1-visit` | 73 values, 9 countries, 1986–2021 | Sparse; no values for three seeded countries. The crosswalk also calls for a reviewed denominator (women/pregnancies/live births). Retain as a future candidate, not an annual complete series. |
| PM2.5 mean annual exposure — `EN.ATM.PM25.MC.M3` → `annual-average-pm25-exposure` | 408 values, all 12 countries, 1990–2023 | The WDI definition confirms population-weighted annual exposure, resolving the exposure-versus-concentration question. However, the upstream IHME GBD 2023 record states its downloads are under a non-commercial user agreement, while the WDI page displays CC BY 4.0. Keep it out until the project's intended use and the applicable upstream license terms are formally reconciled. The WDI data page and [IHME record](https://ghdx.healthdata.org/record/ihme-data/gbd-2023-air-pollution-exposure-estimates-1990-2023) document this concern. |

## Licensing and attribution

Each selected WDI indicator page displays **CC BY 4.0**. Attribute the distribution as **World Bank, World Development Indicators (WDI)**, cite the indicator codes, and identify the upstream organizations named in the table. Preserve each source note and do not imply World Bank endorsement. The raw ZIPs contain the World Bank indicator metadata needed to reproduce this attribution.

Official references:

- [World Bank Indicators API: CSV ZIP downloads and query syntax](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures)
- WDI series pages and license: [life expectancy](https://data.worldbank.org/indicator/SP.DYN.LE00.IN), [under-five](https://data.worldbank.org/indicator/SH.DYN.MORT), [infant](https://data.worldbank.org/indicator/SP.DYN.IMRT.IN), [neonatal](https://data.worldbank.org/indicator/SH.DYN.NMRT), [maternal mortality ratio](https://data.worldbank.org/indicator/SH.STA.MMRT), [skilled birth attendance](https://data.worldbank.org/indicator/SH.STA.BRTC.ZS)
- [World Bank CC BY 4.0 license reference](https://datacatalog.worldbank.org/public-licenses#cc-by)

## Raw archives and checksums

The following archives are the unchanged ZIP responses from the official per-indicator WDI download route. SHA-256 values are included to identify the exact extracts used. The antenatal and PM2.5 archives are retained as selection evidence but their data are not included in the import CSV.

| Archive | SHA-256 |
|---|---|
| `raw/SP.DYN.LE00.IN.zip` | `0AA49ABC3E7054232E051B510B5E26BB2E4F3F5A922292CAF680F607DE4196BA` |
| `raw/SH.DYN.MORT.zip` | `FD6B00042C4378019D267DDBE31338B6E4D1B4AEBC3A0AF8978A25B9294CF78D` |
| `raw/SP.DYN.IMRT.IN.zip` | `CEE23C65FDB752372B5F08618B25CBEDC1BBEFAD9ACBC8FE48ACE172AD0B4B86` |
| `raw/SH.DYN.NMRT.zip` | `B2CF5CC56E511C714B6FA59337CEAF36218B358FC1BBEC96D9ED690159B52CE6` |
| `raw/SH.STA.MMRT.zip` | `055A603CF0749F49C00323DB6D063C2A83517A8BCE3650B1BA171218920EF67E` |
| `raw/SH.STA.BRTC.ZS.zip` | `B1999F2284BAAC761F1C5D811D7D977D4EC328CD5EA0F8EFC8F9CF2EDC56FC6F` |
| `raw/SH.STA.ANVC.ZS.zip` (not selected) | `82C07D4603C048C35AD8A44128937EA3DCB02F58AD1BCCD63BE2BEF4E784D21E` |
| `raw/EN.ATM.PM25.MC.M3.zip` (not selected) | `648C31492F97166231F3843350E43A4851EE60EB7CDC6A41AB4558C4695BE04A` |

Filtered import CSV SHA-256: `94B3098C5D54D37D832F9597EC5B10BD0D223B94FCB131DCE1971E5522B73645`.

## Importer and database setup

The prepared file is [`wdi-health-initial-import.csv`](wdi-health-initial-import.csv). It uses the importer header `country_iso3,indicator,year,value,unit,value_status,notes`. Its `indicator` field intentionally contains WDI source codes, **not** database slugs; each code below must be configured as `originalIndicatorCode` for its canonical slug:

| `originalIndicatorCode` | `originalIndicatorName` | Database indicator slug | `originalUnit` |
|---|---|---|---|
| `SP.DYN.LE00.IN` | Life expectancy at birth, total (years) | `life-expectancy-birth-total` | `years` |
| `SH.DYN.MORT` | Mortality rate, under-5 (per 1,000 live births) | `under-five-mortality-rate` | `deaths per 1,000 live births` |
| `SP.DYN.IMRT.IN` | Mortality rate, infant (per 1,000 live births) | `infant-mortality-rate` | `deaths per 1,000 live births` |
| `SH.DYN.NMRT` | Mortality rate, neonatal (per 1,000 live births) | `neonatal-mortality-rate` | `deaths per 1,000 live births` |
| `SH.STA.MMRT` | Maternal mortality ratio (modeled estimate, per 100,000 live births) | `maternal-mortality-ratio` | `deaths per 100,000 live births` |
| `SH.STA.BRTC.ZS` | Births attended by skilled health staff (% of total) | `births-attended-skilled-personnel` | `%` |

There are no dataset records or indicator-source mappings in the Stage 6A baseline. Create one dataset for the WDI health subset, with the existing `World Bank` source (`sourceId: "world-bank"`), then add the six mappings above. A combined dataset coverage span of 1960–2024 can contain every prepared row; it does not imply each indicator has that entire span. No unit conversions or dimensions are required.

Source organizations already present in V2 include World Bank, WHO, UNICEF, and UN IGME. WDI also names UN Population Prospects/UN Population Division, Eurostat, UNFPA, and the DHS Program; these are not separate seeded source records. They can be retained in the dataset citation/methodology without creating extra organizations because the dataset's registered publisher is World Bank. Do not register IHME as the source for this CSV; PM2.5 is excluded.

## Validation and readiness

The expanded CSV contains **3,586 observations**, under the importer's 10 MB limit. A validation pass checked every row against the matching original WDI archive cell and verified exact source value equality, 12 allowed country codes, six mapped source codes, importer-supported status values, numeric years/values, exact canonical units, and uniqueness of `(country_iso3, indicator, year)` keys. Missing WDI cells are omitted and no dimensions are lost.

**File-level importer readiness:** yes, after creating the dataset and six mappings above. **No import has been performed.** Review the series-level value-status caveat and survey-year sparsity before uploading.
