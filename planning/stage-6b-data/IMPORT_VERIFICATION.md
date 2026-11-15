# Stage 6C/6D — WDI import and live application verification

> **Finalization update — 2026-11-15:** Flyway V1–V5 were validated and applied successfully to the primary local database. V1–V4 were already recorded successful; V5 added three published WDI articles and brought the public glossary to eight terms. The WDI dataset remains at six mappings and 3,586 observations. Backend tests passed (15/15); frontend tests (8/8), lint, TypeScript check and production build passed. The local app at `http://localhost:8080` returned HTTP 200 for the verified public and admin page routes. The CORS configuration now allows credentialed PUT/DELETE, and the Vite API proxy uses `127.0.0.1` to avoid a local `localhost` resolution failure. External deployment was not available: no hosting CLI or credentials are configured.

**Verified:** 2026-11-15 against the local `global_health_explorer` PostgreSQL 18.3 database and Spring Boot application.

## Dataset registration and import

- Registered dataset: `world-development-indicators-health-2026-11` (World Bank WDI health subset).
- Registered six source mappings: `SP.DYN.LE00.IN`, `SH.DYN.MORT`, `SP.DYN.IMRT.IN`, `SH.DYN.NMRT`, `SH.STA.MMRT`, and `SH.STA.BRTC.ZS`.
- The first 3,586-row import accepted 3,271 records and rejected 315 life-expectancy rows because the backend accepts at most eight decimal places.
- The first batch and its validation errors were retained for audit. No database rows were deleted or overwritten.
- A repair CSV was derived from the retained source CSV, containing only the 315 rejected rows. Those values were rounded to the importer's supported eight decimal places using decimal arithmetic and an explicit note. The original WDI extract remains unchanged and is the precision reference.
- The repair batch completed with 315 accepted, zero rejected, and zero duplicates.
- Verified dataset total: **3,586 observations across all 12 seeded countries**, spanning 1960–2024 overall.

| Indicator slug | Accepted observations |
|---|---:|
| `life-expectancy-birth-total` | 780 |
| `under-five-mortality-rate` | 733 |
| `infant-mortality-rate` | 731 |
| `neonatal-mortality-rate` | 655 |
| `maternal-mortality-ratio` | 468 |
| `births-attended-skilled-personnel` | 219 |

The import history intentionally has two batches: the original partial batch (`COMPLETED_WITH_ERRORS`) and the clean precision-repair batch (`COMPLETED`). Together they account for the full accepted dataset. The rejected-row validation history remains available to administrators.

## Live API and frontend checks

- Public catalogue: 12 countries, 9 topics, 48 indicators; one public WDI dataset and eight sources.
- Public observation query returned all 3,586 records as the filtered total. Each of the six indicator totals matched the table above.
- A Pakistan life-expectancy series returned 65 historical records. Country profile, indicator, source, dataset, search, published article, and glossary APIs returned the expected records.
- At the time of the initial Stage 6 verification, search for `indicator` returned a published article and six glossary entries were public. The finalization update above records the post-V5 counts.
- Admin dataset/import history, article, glossary, and donation-summary endpoints were accessible after authentication. Unauthenticated admin dataset access returned HTTP 401.
- Frontend route requests for the overview, country, topic, comparison, search, articles, glossary, sources, and admin screens returned HTTP 200 from the running Vite server.
- Observation query repair: optional country filtering no longer calls PostgreSQL `upper()` on a null untyped query parameter. The service normalizes a provided ISO-3 value, and the repository compares the normalized value directly.

## Interpretation limits

These are WDI distributed series with indicator-specific upstream providers and methods, not six measurements produced by a single institution. The source CSV has no row-level uncertainty intervals or source-status flags. Values in the precision-repair file preserve eight decimal places for import; the original source extract retains its full precision. WDI values may be revised. Read `SOURCES_AND_PROVENANCE.md` and each dataset/indicator record before interpreting a trend.
