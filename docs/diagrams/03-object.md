# Object Diagrams

Object names below are underlined in the hand drawing (`instanceName : ClassName`). These are snapshots of the real local project data and real schema relationships; database-generated numeric IDs are omitted because they are environment-specific and not required to illustrate the links.

## Snapshot O1 — WDI import batch and one accepted observation

**Moment:** After the documented local import's first batch; the first CSV row is an Australian under-five-mortality observation for 1960. The verification report records 3,586 input rows, 3,271 accepted, 315 rejected, and status `COMPLETED_WITH_ERRORS` for that initial file. Include the service/repository collaborator objects to show the actual Repository pattern in use (service code depends on the Spring Data repository interface). It is not a Strategy/Observer pattern.

### Objects and slots

| Object | Class | Concrete slots to show |
|---|---|---|
| `aus : Country` | `catalogue.model.Country` | `iso3="AUS"`, `iso2="AU"`, `name="Australia"`, `region="Oceania"`, `active=true` |
| `childMortality : Topic` | `catalogue.model.Topic` | `slug="child-infant-mortality"`, `name="Child & Infant Mortality"`, `active=true` |
| `u5mr : Indicator` | `catalogue.model.Indicator` | `slug="under-five-mortality-rate"`, `unit="deaths per 1,000 live births"`, `active=true` |
| `worldBank : DataSource` | `dataset.model.DataSource` | `name="World Bank"`, `active=true` |
| `wdiHealth : Dataset` | `dataset.model.Dataset` | `slug="world-development-indicators-health-2026-11"`, `frequency="Annual (where available)"`, `active=true` |
| `u5mrMapping : IndicatorSourceMapping` | `dataset.model.IndicatorSourceMapping` | `originalIndicatorCode="SH.DYN.MORT"`, `originalIndicatorName="Mortality rate, under-5 (per 1,000 live births)"`, `originalUnit="deaths per 1,000 live births"` |
| `initialBatch : ImportBatch` | `imports.model.ImportBatch` | `importMethod="ADMIN_CSV"`, `originalFilename="wdi-health-initial-import.csv"`, `status="COMPLETED_WITH_ERRORS"`, `totalRows=3586`, `acceptedRows=3271`, `rejectedRows=315`, `duplicateRows=0` |
| `australiaU5mr1960 : HealthObservation` | `observation.model.HealthObservation` | `referenceYear=1960`, `value=24.9`, `valueStatus="ESTIMATED"`, `dimensions={}`; from first data row in initial import CSV |
| `observationService : ObservationService` | `observation.service.ObservationService` | collaborator slot `observationRepository=healthObservationRepository` |
| `healthObservationRepository : HealthObservationRepository` | `observation.repository.HealthObservationRepository` | Runtime object is a Spring Data generated proxy; concrete generated class name is not stable/declared in the project. |

### Links

- `childMortality` — `u5mr` (`Topic`–`Indicator` association).
- `worldBank` — `wdiHealth` (`DataSource`–`Dataset`).
- `wdiHealth` — `u5mrMapping` — `u5mr` (dataset and canonical indicator mapping).
- `aus`, `u5mr`, `wdiHealth`, `u5mrMapping`, and `initialBatch` each link to `australiaU5mr1960` via the corresponding `HealthObservation` many-to-one fields.
- `observationService` — `healthObservationRepository` (constructor-injected service-to-repository dependency shown on C1); the service's `search(...)` delegates persistence queries to this repository.

**Evidence:** `planning/stage-6b-data/wdi-health-initial-import.csv` first record and `planning/stage-6b-data/IMPORT_VERIFICATION.md`. This is the locally verified import snapshot. The current Railway database returned zero observations until its separate import is performed; do not label this as a Railway snapshot unless rechecked after import.

## Snapshot O2 — Published maternal-mortality article and linked glossary entry

**Moment:** After Flyway V5 seeds and links editorial content. This object graph illustrates real JPA relationships and `Article`/`GlossaryTerm` references.

### Objects and slots

| Object | Class | Concrete slots to show |
|---|---|---|
| `healthExplainers : ArticleCategory` | `editorial.article.model.ArticleCategory` | `slug="health-explainers"`, `name="Health Explainers"` |
| `maternalTopic : Topic` | `catalogue.model.Topic` | `slug="maternal-mortality"`, `name="Maternal Mortality"` |
| `mmr : Indicator` | `catalogue.model.Indicator` | `slug="maternal-mortality-ratio"`, unit per indicator catalogue |
| `article : Article` | `editorial.article.model.Article` | `slug="what-maternal-mortality-ratio-measures"`, `status="PUBLISHED"`, `authorName="Global Health Explorer editorial team"`, `publishedAt=2026-11-15` |
| `articleRef : ArticleReference` | `editorial.article.model.ArticleReference` | `displayOrder=1`, `label="World Bank WDI: maternal mortality ratio"`, URL `https://data.worldbank.org/indicator/SH.STA.MMRT` |
| `term : GlossaryTerm` | `editorial.glossary.model.GlossaryTerm` | `slug="maternal-mortality-ratio"`, `term="Maternal mortality ratio"` |
| `termRef : GlossaryReference` | `editorial.glossary.model.GlossaryReference` | `displayOrder=1`, `label="World Bank WDI: maternal mortality ratio"`, same indicator URL |

### Links

- `healthExplainers` — `article` (required category association).
- `article` ◆— `articleRef` (composition; references owned by the article).
- `article` — `maternalTopic`; `article` — `mmr` (article many-to-many catalogue links).
- `term` ◆— `termRef` (composition).
- `term` — `maternalTopic`; `term` — `mmr`; `term` — `article` (glossary link tables).

**Evidence:** Flyway `V5__seed_wdi_methodology_and_editorial_content.sql` seeds article/reference/topic/indicator/glossary links. Exact IDs and generated timestamps vary; omit them. The graph is data association only—there is no Observer notification pattern.
