# Use Case Diagram

## Boundary and actors

**System boundary:** Global Health Explorer (frontend + Spring Boot backend). PostgreSQL is drawn outside the backend system boundary as a secondary external system dependency. Vercel/Railway are deployment hosts, not business actors.

| Actor | Type | Role | Code evidence |
|---|---|---|---|
| Reader | Primary | Browses public health and editorial information | Public controllers: `CountryController`, `TopicController`, `IndicatorController`, `ObservationController`, `PublicDatasetController`, `PublicArticleController`, `PublicGlossaryController`, `SearchController`. |
| Donor | Primary | Submits a simulated donation pledge | `DonationController.submit`, `DonationRequest`. |
| Administrator | Primary | Authenticates and manages datasets/imports, articles, glossary, and donation reports | `AdminAuthController`; protected `AdminDatasetController`, `AdminArticleController`, `AdminGlossaryController`, `AdminDonationController`; Spring Security `ROLE_ADMIN`. |
| PostgreSQL database | Secondary system | Persists catalogue, observations, content, admin, import, and donation records | JPA repositories, `spring.datasource.*`, Flyway migrations. |

## Use case inventory

| ID | Use case | Actor | Module / route |
|---|---|---|---|
| UC01 | Browse countries and country profile | Reader, PostgreSQL | `GET /api/v1/countries`, `/countries/{identifier}` |
| UC02 | Browse topics and indicators | Reader, PostgreSQL | `GET /api/v1/topics[/{slug}]`, `/indicators[/{slug}]` |
| UC03 | Explore/filter/paginate observations | Reader, PostgreSQL | `GET /api/v1/observations` |
| UC04 | Browse dataset and source provenance | Reader, PostgreSQL | `GET /api/v1/datasets[/{slug}]`, `/sources[/{slug}]` |
| UC05 | Search public content | Reader, PostgreSQL | `GET /api/v1/search?q=...` |
| UC06 | Read published articles | Reader, PostgreSQL | `GET /api/v1/articles[/{slug}]` |
| UC07 | Search/read glossary | Reader, PostgreSQL | `GET /api/v1/glossary[/{slug}]` |
| UC08 | Submit simulated donation | Donor, PostgreSQL | `POST /api/v1/donations` |
| UC09 | Start admin session | Administrator, PostgreSQL | `GET /api/v1/admin/auth/csrf`, `POST /login`, `GET /me` |
| UC10 | End admin session | Administrator | `POST /api/v1/admin/auth/logout` (Spring Security logout path; see security configuration) |
| UC11 | Register/update dataset and mappings | Administrator, PostgreSQL | `GET/POST /api/v1/admin/datasets`, `GET/PUT /{slug}` |
| UC12 | Import CSV health observations | Administrator, CSV source file, PostgreSQL | `POST /api/v1/admin/datasets/{slug}/imports` |
| UC13 | Review import history | Administrator, PostgreSQL | `GET /api/v1/admin/datasets/{slug}/imports` |
| UC14 | Create/update/archive articles | Administrator, PostgreSQL | `GET/POST /api/v1/admin/articles`, `GET/PUT/DELETE /{slug}` |
| UC15 | Create/update/delete glossary terms | Administrator, PostgreSQL | `GET/POST /api/v1/admin/glossary`, `GET/PUT/DELETE /{slug}` |
| UC16 | Review donation records and summary | Administrator, PostgreSQL | `GET /api/v1/admin/donations`, `/summary`, `/{reference}` |

The backend has no public registration, payment processing, email, SMS, data-export, or external API synchronization use case. Do not add these actors/use cases.

## Relationships

- Reader — UC01–UC07 associations (initiates public reads).
- Donor — UC08 association.
- Administrator — UC09–UC16 associations.
- PostgreSQL — UC01–UC09 and UC11–UC16 associations wherever a repository reads/writes durable data; UC10 uses the security session store/configuration and may be drawn with PostgreSQL only if the session implementation is confirmed to persist there (it is not explicitly configured as JDBC session storage).
- CSV file is an input artifact selected by the Administrator, not an actor; show it as a note/artifact on UC12 if desired.
- UC09 `Start admin session` `<<include>>` `Obtain CSRF token` (GET `/auth/csrf` before login/mutations; frontend client obtains it before unsafe requests). Treat “Obtain CSRF token” as a supporting sub-use-case if the teacher expects include relationships.
- No `<<extend>>` or actor generalization is implemented. Do not invent relationships.
- UC03 may be shown as a specialized goal of UC02 only if your notation represents indicator selection as user interaction; there is no use-case inheritance in code, so plain associations are safer.

## Use case descriptions

### UC01 — Browse countries and country profile

- **Primary / secondary actors:** Reader / PostgreSQL.
- **Interaction:** Reader opens country list or a profile by ISO-3 or recognized country slug; receives active country metadata.
- **Preconditions:** Application and database available; country is active for detail request.
- **Trigger:** `GET /api/v1/countries` or `GET /api/v1/countries/{identifier}`.
- **Main flow:** (1) `CountryController.getCountries()` or `getCountry(identifier)` receives request. (2) `CatalogueService` queries `CountryRepository`. (3) Service maps entities to `CountryResponse`. (4) Controller returns JSON.
- **Alternate/exception:** Unknown/inactive identifier throws `ResourceNotFoundException`; `ApiExceptionHandler.handleNotFound` returns problem response. Database failure becomes server error.
- **Postcondition:** No state change; country response returned.
- **Relationships:** None.
- **Traceability:** `catalogue.api.CountryController`; `catalogue.service.CatalogueService.getCountries/getCountry`; `catalogue.repository.CountryRepository`.

### UC02 — Browse topics and indicators

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader requests topic/indicator lists or one topic/indicator detail.
- **Preconditions:** Seeded active catalogue exists.
- **Trigger:** `GET /api/v1/topics[/{slug}]`, `GET /api/v1/indicators[/{slug}]`.
- **Main flow:** Controller delegates to `CatalogueService.getTopics/getTopic/getIndicators/getIndicator`; service queries `TopicRepository` and `IndicatorRepository`, combines topic-indicator data, maps response records, and marks whether observations exist.
- **Alternate/exception:** Unknown/inactive slug gives not found. `getTopic` canonicalizes legacy `child-mortality` to `child-infant-mortality`.
- **Postcondition:** Read-only catalogue data returned.
- **Relationships:** None.
- **Traceability:** `TopicController`, `IndicatorController`, `CatalogueService`.

### UC03 — Explore/filter/paginate observations

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader selects country, indicator, dataset, year bounds, page/size, and sort; receives records and page metadata for charts/comparisons.
- **Preconditions:** Requested referenced entities exist and are active where filters are supplied.
- **Trigger:** `GET /api/v1/observations` with optional `country`, `indicator`, `dataset`, `fromYear`, `toYear`, `page`, `size`, `sortBy`, `direction`.
- **Main flow:** (1) `ObservationController.search(...)`. (2) `ObservationService.search(...)` validates pagination/year range/filter identifiers/sort. (3) `HealthObservationRepository.search(...)` queries. (4) Service maps rows through `toResponse` to `ObservationResponse`; returns `ObservationPageResponse`.
- **Alternate/exception:** Negative page, size outside 1–100, year outside 1800–2200, `fromYear > toYear`, unsupported sort/direction → `IllegalArgumentException` mapped by `ApiExceptionHandler`; unknown country/indicator/dataset → not found. Empty result is a valid page (`totalElements=0`).
- **Postcondition:** No state change; filtered page returned.
- **Relationships:** None.
- **Traceability:** `ObservationController.search`; `ObservationService.search/toResponse`; `HealthObservationRepository.search`.

### UC04 — Browse dataset and source provenance

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader lists or opens public dataset/source descriptions and mappings.
- **Preconditions:** Dataset/source active for detail endpoint.
- **Trigger:** `GET /api/v1/datasets`, `/datasets/{slug}`, `/sources`, `/sources/{slug}`.
- **Main flow:** `PublicDatasetController` delegates to `DatasetService.getPublicDatasets/getPublicDataset/getPublicSources/getPublicSource`; service queries repositories and builds response DTOs including mappings.
- **Alternate/exception:** Unknown or inactive dataset/source → `ResourceNotFoundException` and problem response.
- **Postcondition:** Read-only provenance returned.
- **Relationships:** None.
- **Traceability:** `PublicDatasetController`; `DatasetService`; dataset/source/mapping repositories.

### UC05 — Search public content

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader submits query text and receives categorized navigation results.
- **Preconditions:** Public catalogue available.
- **Trigger:** `GET /api/v1/search?q=...`.
- **Main flow:** `SearchController.search(q)` → `SearchService.search(rawQuery)` → repositories for each searchable category → `SearchResponse` with limited category results.
- **Alternate/exception:** Query under two characters returns empty result without category searches; category results are capped by `PER_CATEGORY_LIMIT=8`; unpublished articles are excluded by public repository query.
- **Postcondition:** No state change.
- **Relationships:** None.
- **Traceability:** `SearchController.search`; `SearchService.search`.

### UC06 — Read published articles

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader lists or opens article by slug; optional category/tag filters and page/size on list.
- **Preconditions:** Article is `PUBLISHED` for public access.
- **Trigger:** `GET /api/v1/articles` or `/articles/{slug}`.
- **Main flow:** `PublicArticleController.list/get` → `ArticleService.listPublic/getPublic` → `ArticleRepository` plus related metadata repositories → `ArticleResponse`/`EditorialPageResponse`.
- **Alternate/exception:** Draft/archived article is not exposed publicly; unknown/non-published slug returns not found. Invalid page/size is rejected.
- **Postcondition:** Read-only published content returned.
- **Relationships:** None.
- **Traceability:** `PublicArticleController`; `ArticleService`.

### UC07 — Search/read glossary

- **Actors:** Reader / PostgreSQL.
- **Interaction:** Reader searches/list terms and opens a term by slug.
- **Preconditions:** Term exists. `GlossaryTerm` has no publication-status or active field; public reads are available for stored terms.
- **Trigger:** `GET /api/v1/glossary?q=...` or `/glossary/{slug}`.
- **Main flow:** `PublicGlossaryController.search/get` → `GlossaryService.searchPublic/getPublic` → `GlossaryTermRepository` and relation repositories → response DTO.
- **Alternate/exception:** Invalid pagination rejected; unknown slug gives not found.
- **Postcondition:** No state change.
- **Relationships:** None.
- **Traceability:** `PublicGlossaryController`; `GlossaryService`.

### UC08 — Submit simulated donation

- **Actors:** Donor / PostgreSQL.
- **Interaction:** Donor provides name, email, amount, frequency, anonymity preference; receives a receipt/reference.
- **Preconditions:** Request passes Jakarta validation.
- **Trigger:** `POST /api/v1/donations` JSON body.
- **Main flow:** `DonationController.submit(request)` → `DonationService.submit` trims/normalizes inputs, validates frequency, creates a reference and `Donation`, saves it, returns `DonationReceiptResponse`.
- **Alternate/exception:** Invalid fields or unsupported frequency (`ONCE`/`MONTHLY` only) returns validation/client problem. No money is charged.
- **Postcondition:** Simulated donation record with `SIMULATED_SUCCESS` is persisted.
- **Relationships:** None.
- **Traceability:** `DonationController.submit`; `DonationService.submit`; `DonationRepository`.

### UC09 — Start administrator session

- **Actors:** Administrator / PostgreSQL.
- **Interaction:** Admin fetches CSRF token, supplies email/password, receives session identity; can query current session.
- **Preconditions:** Admin account exists and is active; HTTPS cookie settings are correct in production.
- **Trigger:** `GET /api/v1/admin/auth/csrf`, then `POST /api/v1/admin/auth/login`; `GET /me` checks current identity.
- **Main flow:** CSRF token is issued; `AdminAuthController.login` calls `AdminAuthenticationService.authenticate`; Spring `AuthenticationManager` resolves `AdminUserDetailsService`/`AdminUserRepository`; controller applies `SessionAuthenticationStrategy`, stores `SecurityContext`, returns `AdminSessionResponse`.
- **Alternate/exception:** Bad password or inactive account is rejected; invalid request body returns 400; `/me` without a session returns 401. Unsafe requests without valid CSRF are rejected.
- **Postcondition:** Authenticated HTTP session exists; no password is returned.
- **Relationships:** Includes CSRF acquisition before unsafe auth operations.
- **Traceability:** `AdminAuthController`, `AdminAuthenticationService`, `AdminUserDetailsService`, `SecurityConfiguration`.

### UC10 — End administrator session

- **Actors:** Administrator.
- **Interaction:** Admin requests logout with session cookie and CSRF header.
- **Preconditions:** Active session and valid CSRF token.
- **Trigger:** `POST /api/v1/admin/auth/logout` (logout URL/method is configured in `SecurityConfiguration`).
- **Main flow:** Spring Security logout clears security context and invalidates session; frontend `api.logout()` clears its cached CSRF token.
- **Alternate/exception:** Missing/invalid CSRF rejects unsafe logout; already expired session remains unauthenticated.
- **Postcondition:** Session is no longer authenticated.
- **Relationships:** Uses CSRF acquisition.
- **Traceability:** `SecurityConfiguration`; `frontend/src/lib/api.ts`.

### UC11 — Register/update dataset and mappings

- **Actors:** Administrator / PostgreSQL.
- **Interaction:** Authenticated admin enters source, dataset provenance, active state and one or more canonical/source indicator mappings.
- **Preconditions:** Administrator session and CSRF; source and canonical indicator rows exist.
- **Trigger:** `POST /api/v1/admin/datasets` or `PUT /api/v1/admin/datasets/{slug}`.
- **Main flow:** `AdminDatasetController.createDataset/updateDataset` → `DatasetService.createDataset/updateDataset` → validate source, coverage, URLs, unique mappings and referenced indicators → save `Dataset`/`IndicatorSourceMapping` → return `DatasetResponse`.
- **Alternate/exception:** Duplicate slug/code, invalid source/indicator/year/URL, mapping changes after observations exist → client error; unauthenticated → 401/403.
- **Postcondition:** Dataset and mapping registry persisted; no observations yet.
- **Relationships:** Requires admin session.
- **Traceability:** `AdminDatasetController`; `DatasetService`.

### UC12 — Import CSV health observations

- **Actors:** Administrator, CSV source file / PostgreSQL.
- **Interaction:** Admin chooses dataset and multipart CSV file; receives accepted/rejected/duplicate counts and row errors.
- **Preconditions:** Authenticated admin, active dataset, six mappings registered, valid UTF-8 CSV within 10 MB.
- **Trigger:** `POST /api/v1/admin/datasets/{slug}/imports` multipart field `file`.
- **Main flow:** `AdminDatasetController.importCsv` → `CsvImportService.importCsv` creates batch → `CsvDocumentParser.parse` → validates headers and each row against country, mapping, unit, year/value/status → saves accepted `HealthObservation` rows, `ImportError` rows and batch result → response.
- **Alternate/exception:** Missing/oversized/invalid CSV; unknown country/code; unit mismatch; malformed numeric/status; duplicate observations. Row-level failures are recorded; invalid file-level structure aborts/returns error according to parser/import logic.
- **Postcondition:** Batch history and accepted observations persisted; rejected rows auditable.
- **Relationships:** Requires UC09; CSV input association.
- **Traceability:** `AdminDatasetController.importCsv`; `CsvImportService.importCsv`; `CsvDocumentParser.parse`.

### UC13 — Review import history

- **Actors:** Administrator / PostgreSQL.
- **Interaction:** Admin selects a dataset to see batch counts/status/errors.
- **Preconditions:** Authenticated session and dataset.
- **Trigger:** `GET /api/v1/admin/datasets/{slug}/imports`.
- **Main flow:** `AdminDatasetController.getImports` → `CsvImportService.getImports` → batch/error repositories → response list.
- **Alternate/exception:** Unknown dataset or missing session returns not found/401.
- **Postcondition:** Read-only audit result.
- **Traceability:** `AdminDatasetController.getImports`; `CsvImportService.getImports`.

### UC14 — Manage articles

- **Actors:** Administrator / PostgreSQL; Reader for public read variant.
- **Interaction:** Admin lists/reads drafts, creates/updates or archives articles. Reader lists/reads published articles.
- **Preconditions:** Admin session for write/admin routes; category exists; referenced topics/countries/indicators resolve.
- **Trigger:** Admin `GET/POST /api/v1/admin/articles`, `GET/PUT/DELETE /{slug}`; public `GET /api/v1/articles[/{slug}]`.
- **Main flow:** Controller delegates to `ArticleService`; service normalizes status, validates publication fields and references, replaces tag/reference/relationship collections and saves repository; public path filters published content.
- **Alternate/exception:** Invalid status/slug/URL/relation, invalid publication fields, unknown slug; the admin delete endpoint invokes `ArticleService.deleteOrArchive` and always changes status to `ARCHIVED` rather than physically deleting.
- **Postcondition:** Article saved/updated/archived or public DTO returned.
- **Relationships:** Admin write requires UC09.
- **Traceability:** `AdminArticleController`, `PublicArticleController`, `ArticleService`.

### UC15 — Manage glossary

- **Actors:** Administrator / PostgreSQL; Reader for public read variant.
- **Interaction:** Admin lists/creates/updates/deletes definitions; reader searches and reads public terms.
- **Preconditions:** Admin session for writes; referenced articles/topics/indicators exist.
- **Trigger:** `/api/v1/admin/glossary` CRUD; `/api/v1/glossary` public search/detail.
- **Main flow:** `AdminGlossaryController`/`PublicGlossaryController` → `GlossaryService` → resolve relations and references → persist/map response.
- **Alternate/exception:** Invalid slug/reference/relationship, unknown term, invalid pagination; errors map to API problem responses.
- **Postcondition:** Definition persisted or public response returned.
- **Relationships:** Admin write requires UC09.
- **Traceability:** Both glossary controllers; `GlossaryService`.

### UC16 — Review donation records and summary

- **Actors:** Administrator / PostgreSQL.
- **Interaction:** Admin lists donation records, opens a reference, or reads aggregate summary.
- **Preconditions:** Admin session.
- **Trigger:** `GET /api/v1/admin/donations`, `/summary`, `/{reference}`.
- **Main flow:** `AdminDonationController` delegates to `DonationService.list/get/summary`, which reads `DonationRepository` and maps DTOs.
- **Alternate/exception:** Unknown reference → not found; invalid pagination rejected; unauthenticated → 401.
- **Postcondition:** Read-only administrative view.
- **Relationships:** Requires UC09.
- **Traceability:** `AdminDonationController`; `DonationService`.

## Modelio build checklist

Create boundary `Global Health Explorer`; actors `Reader`, `Donor`, `Administrator`, and optionally external-system actor `PostgreSQL database`. Add UC01–UC16 from the inventory and associations above. Show UC09 `<<include>>` CSRF acquisition only if you add that supporting use case as a separate oval. Do not draw payment gateway, World Bank API, email/SMS actor, registration, strategy/observer, or extension relationships; they are absent.
