# Stage 6A — Real Health Data Source Assessment

**Status:** partial assessment and verified sample only; no database import performed.  
**Data checked:** World Bank Indicators API and indicator pages, accessed 2026-11-15.  
**Important limitation:** bulk indicator requests intermittently returned HTTP 502/503. The prepared CSV is a traceable sample, not a complete extraction of the available series. Do not describe the 5–8-indicator selection target as complete.

## Project and importer findings

- The crosswalk and V2 seed migration agree on the relevant canonical slugs and units. V2 seeds 12 active countries, 48 indicators, and these eight source organizations: WHO, IHME, World Bank, UNICEF, UN IGME, IARC, UN MMEIG, and Our World in Data. The crosswalk reports zero datasets and observations.
- Existing country identifiers are ISO-3. The included CSV codes (`PAK`, `NGA`) are active catalogue country codes.
- The importer requires UTF-8 CSV columns `country_iso3,indicator,year,value,unit`. `indicator` can be a canonical indicator slug or a code mapped in the dataset. Optional `value_status` and `notes` are supported. Missing values must be omitted, not encoded as zero. A row is accepted only if its unit exactly matches both the dataset mapping unit and canonical indicator unit; no conversions are performed.
- Each dataset mapping needs a unique source code and an `originalUnit` exactly equal to the canonical indicator unit. Dataset requests identify a source by its slug (for example, `world-bank`), not a numeric database ID.
- The file includes national aggregate observations only. It has no additional dimensions to flatten.

## Proposed first indicators

| Existing indicator slug | WDI series name and code | Canonical unit / measure | Actual availability inspected | Decision |
|---|---|---|---|---|
| `life-expectancy-birth-total` | Life expectancy at birth, total (years) — `SP.DYN.LE00.IN` | `years`; life expectancy at birth, total | API response contained values for all 12 project countries, 780 non-null rows, 1960–2024. The CSV contains the inspected Pakistan 2010–2023 values only. | Include in sample. Existing catalogue mapping is approved; the WDI source metadata identifies World Population Prospects, national statistical offices, and Eurostat inputs. The API does not expose a per-row observed/estimated status, so the sample marks the values `ESTIMATED` based on the stated WPP/derived-series provenance; review that classification before a full import. |
| `maternal-mortality-ratio` | Maternal mortality ratio (modeled estimate, per 100,000 live births) — `SH.STA.MMRT` | `deaths per 100,000 live births`; modelled ratio | API response contained values for all 12 project countries, 468 non-null rows, 1985–2023; the latest inspected record was Nigeria 2023 = 993. The CSV includes that row only. | Include in sample. Existing mapping is approved. This is a regression-model estimate, not an officially reported national count; CSV status is `MODELLED`. |
| `under-five-mortality-rate` | Mortality rate, under-5 (per 1,000 live births) — `SH.DYN.MORT` | `deaths per 1,000 live births`; probability per 1,000 of dying before age five under the year's age-specific mortality rates | Direct API response verified Pakistan 2023 = 57.8. The WDI page lists series years 1960–2024, but complete country-by-country coverage for this project's 12 countries was not confirmed. The CSV includes only the verified Pakistan row. | Include as a verified sample row, not as evidence of complete coverage. Existing mapping is approved. The WDI metadata attributes this series to UN IGME and partners; treat values as estimates. |

The WDI API's `unit` metadata property is blank for these indicators; their exact units are stated in the official series names and match the existing indicator units above. No unit conversion is proposed.

### Deferred candidates and mapping cautions

- Infant mortality (`infant-mortality-rate`; `SP.DYN.IMRT.IN`) has compatible WDI metadata: infants dying before age one per 1,000 live births, with UN IGME provenance. No actual project-country data values could be checked during this pass, so it is not in the CSV.
- Skilled birth attendance (`births-attended-skilled-personnel`; `SH.STA.BRTC.ZS`) is a percentage of deliveries attended by qualified personnel, but survey-based year coverage and actual project-country values were not verified. Do not treat it as annual complete data.
- PM2.5 (`annual-average-pm25-exposure`; `EN.ATM.PM25.MC.M3`) describes population-weighted ambient exposure in µg/m³, not a generic ambient concentration. WDI metadata names the GBD 2023 exposure estimates as its provider. The crosswalk marks this mapping conditional; actual values and mapping approval remain outstanding.
- No assertion is made for neonatal mortality because its metadata request did not complete successfully. Similar names are not enough to establish a mapping.
- These are not rejections of the indicators. They are deferred pending direct data verification and, where needed, methodology/dimension review.

## Source methodology, coverage, and attribution

World Bank WDI is the distribution source for the three proposed series; it is not the sole primary data collector:

- **Life expectancy:** the WDI metadata names World Population Prospects (UN Population Division), national statistical offices, and Eurostat. The definition is the expected years a newborn would live if the mortality pattern at birth persisted throughout life. The series combines/derives from those sources; WDI does not expose row-level reported-versus-estimated flags. Time series are annual, but a specific refresh cadence is not documented in the metadata inspected.
- **Maternal mortality ratio:** number of pregnancy-related deaths during pregnancy or within 42 days after termination per 100,000 live births. WDI says values are estimated with a regression model using maternal-death proportions, fertility, birth attendants, and GDP at PPP. Provider metadata lists WHO, UNICEF, UNFPA, and the World Bank Group. These are modelled estimates, not official national counts.
- **Under-five mortality:** probability per 1,000 of a newborn dying before age five under the year's age-specific mortality rates. WDI attributes the estimates to UN IGME and partners. The prepared row is marked estimated, not reported.
- WDI indicator pages displayed a **CC BY 4.0** license. Preserve attribution to World Bank WDI and each series' named upstream providers; do not imply World Bank endorsement. The WDI API documentation says API access needs no key.
- API data responses inspected for life expectancy and under-five mortality reported `lastupdated=2026-11-11`. This is an API dataset-update timestamp, not a documented per-series refresh schedule. No `published_at` date is proposed.
- The annual observations are national aggregates. The sample contains no sex or other dimension values, and no missing value is represented as zero.

Official references:

- [World Bank Indicators API documentation](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)
- [Life expectancy metadata and license](https://data.worldbank.org/indicator/SP.DYN.LE00.IN)
- [Under-five mortality metadata and license](https://data.worldbank.org/indicator/SH.DYN.MORT)
- [Maternal mortality metadata and license](https://data.worldbank.org/indicator/SH.STA.MMRT)
- [World Bank data license link](https://datacatalog.worldbank.org/public-licenses#cc-by)
- [WHO Trends in Maternal Mortality reference listed by WDI](https://www.who.int/news/item/23-02-2023-a-woman-dies-every-two-minutes-due-to-pregnancy-or-childbirth--un-agencies)

## Dataset, source, and mapping setup

No dataset or mapping currently exists. Create **one** dataset record for the WDI subset before import, with:

- **Source:** existing `World Bank` organization (`sourceId: "world-bank"`).
- **Suggested dataset name/slug:** `World Development Indicators — Health subset` / `world-development-indicators-health-2026-11`.
- **Suggested source URL:** `https://api.worldbank.org/v2/source/2` (WDI source); retain the exact indicator API URLs and retrieval date in the citation/provenance record.
- **License:** `CC BY 4.0`; use the official license URL above. The dataset citation should name the three WDI series codes and upstream providers.
- **Methodology/frequency:** describe the mixed provider methods above. Record annual observations; leave refresh frequency unspecified because no specific frequency was documented.
- **Coverage:** the API evidence spans 1960–2024 for life expectancy and 1985–2023 for maternal mortality. Under-five coverage is not fully checked for the project's country list. Do not use the combined coverage range as proof each indicator has data in every year.
- Add three mappings with the codes/names in the table and exactly these `originalUnit` values: `years`, `deaths per 100,000 live births`, and `deaths per 1,000 live births`. No conversions or dimensions are required for these mappings.

The existing organizations `World Bank`, `WHO`, `UNICEF`, and `UN IGME` cover the primary attribution named above. **UNFPA** (and the **UN Population Division**, if upstream organizations are registered individually) are not separate V2 source records. They can be named in the dataset citation/methodology without creating extra organizations; add organization records only if the project wants each upstream institution independently catalogued.

## Prepared file and recommended import order

Prepared file: [`stage-6a-data/wdi-health-first-batch.csv`](stage-6a-data/wdi-health-first-batch.csv). It contains 16 genuine, inspected observations: 14 annual Pakistan life-expectancy values (2010–2023), Pakistan under-five mortality (2023), and Nigeria maternal mortality ratio (2023). It is intentionally a small sample and is not a full WDI extract.

Recommended order:

1. Review the estimates/status treatment and approve the limited sample and attribution.
2. Create the World Bank WDI subset dataset and its three exact-unit mappings.
3. Before uploading the CSV, expand the extraction to the intended country/year coverage and confirm under-five coverage for all target countries; re-check current API values because WDI can be revised.
4. Import only after that review. The file is not imported by this assessment.

The original target of 5–8 indicators is **not met**. Expanding it without successful actual-data verification would violate the project's no-invention/no-assumed-mapping constraints.
