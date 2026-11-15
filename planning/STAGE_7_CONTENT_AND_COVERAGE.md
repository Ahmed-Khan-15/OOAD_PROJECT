# Stage 7 — Content and data coverage

## Editorial content and source documentation

Flyway migration `V5__seed_wdi_methodology_and_editorial_content.sql` adds three published, source-linked articles and seeds eight WDI-related glossary definitions, enriching existing terms with the same slugs. The articles explain the six imported WDI series, distinguish neonatal/infant/under-five mortality, and describe the maternal mortality ratio. Article and glossary records link to the relevant catalogue topics, indicators and primary references.

The migration also replaces generic organization descriptions with source-specific summaries and fills the registered WDI dataset description, citation, methodology and coverage dates when that dataset is present. The database migration does not alter observations. The full retrieval record, per-series counts, upstream attribution and interpretation limits remain in [`stage-6b-data/SOURCES_AND_PROVENANCE.md`](stage-6b-data/SOURCES_AND_PROVENANCE.md) and [`stage-6b-data/IMPORT_VERIFICATION.md`](stage-6b-data/IMPORT_VERIFICATION.md).

Backend CORS now allows credentialed PUT and DELETE requests from configured frontend origins, which the admin content screens need for edits and removals. Cookie SameSite policy is configurable with `SESSION_COOKIE_SAME_SITE` for HTTPS deployments where frontend and API are cross-site.

## Coverage decision

The verified WDI subset has six indicators and 3,586 observations across the twelve seeded countries. No seventh series was added in this pass:

- Antenatal care (at least one visit) is available for only nine of the twelve catalogue countries, with 73 observations. It is a sparse, irregular survey series and its denominator/mapping needs review before publication as a comparable trend.
- PM2.5 has broad WDI coverage, but its upstream IHME GBD 2023 record describes non-commercial terms while the WDI page displays CC BY 4.0. That license relationship needs resolution before inclusion.

These candidates and their evidence are recorded in the WDI provenance document. Avoid presenting either as a balanced annual panel. Revisit them when the unit/denominator and licensing review is complete.

## Verification status

- Primary database: Flyway V1–V5 are all successful; Flyway validated all five migrations and Hibernate startup passed schema validation. V5 applied without changing observation rows.
- Live API: 12 countries, 9 topics, 48 indicators, one WDI dataset with six mappings, and 3,586 observations. Per-series counts: 780 life-expectancy, 733 under-five mortality, 731 infant mortality, 655 neonatal mortality, 468 maternal mortality and 219 skilled-attendance rows. Pakistan life expectancy returned 65 years; search returned 11 results for `indicator` before V5 and 2 for `WDI health series` afterward. Unauthenticated admin dataset access returned HTTP 401.
- The primary database has one active administrator account. The account identity and credentials are not included in this record; administrator authentication and CRUD flows passed against the isolated integration-test database.
- Live editorial content after V5: seven published articles total, including the three Stage 7 articles; eight glossary terms total, covering the eight WDI definitions. The public API returns all three new article slugs and all eight glossary slugs.
- Frontend routes for overview, country, topic, comparison, search, article listing, glossary, sources, admin login and admin pages returned HTTP 200. The development API proxy initially failed because `localhost` resolved incorrectly on this machine; it now targets `127.0.0.1:8081`, and proxied catalogue, observation, dataset, editorial and search requests pass. Unauthenticated admin access remains HTTP 401.
- Local demonstration URL: `http://localhost:8080` (frontend) with backend API at `http://localhost:8081`.
- `npm test -- --run` passed (8 tests); `npm run lint` passed; `npx tsc --noEmit` passed; `npm run build` passed.
- Backend integration tests passed: 15 tests, 0 failures/errors. This includes migration V5 on the isolated test database, CORS preflight for credentialed admin PUT, authentication, catalogue, imports, editorial workflows, donations and search.
- No deployment CLI, hosting credentials or deployment manifest is configured. Deployment is not claimed; configure the secrets and origins described in the backend README and deploy through the selected host.
- The earlier Stage 6C/6D import and API checks remain recorded in `stage-6b-data/IMPORT_VERIFICATION.md`.
