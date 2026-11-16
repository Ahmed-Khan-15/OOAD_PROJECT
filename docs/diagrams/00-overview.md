# Global Health Explorer — diagram overview

## System summary

Global Health Explorer is a browser-based explorer for a curated health catalogue, country and indicator metadata, annual health observations, source/dataset provenance, editorial articles, glossary terms, unified search, simulated donation pledges, and administrator tools. The frontend is a TanStack Start/React application in `frontend/src`; it calls a Spring MVC REST API in `backend/src/main/java/com/globalhealthexplorer`. The backend is layered into `api` controllers/DTOs, `service` application logic, `model` JPA entities, and Spring Data `repository` interfaces. Flyway owns schema and seed migrations; PostgreSQL stores durable state. CSV data enters only through the authenticated administrator import endpoint.

## Package tree (backend)

```text
com.globalhealthexplorer
├── GlobalHealthExplorerApplication
├── catalogue/{api,model,repository,service}
├── common
├── dataset/{api,model,repository,service}
├── donation/{api,model,repository,service}
├── editorial
│   ├── api
│   ├── article/{api,model,repository,service}
│   └── glossary/{api,model,repository,service}
├── imports/{api,model,repository,service}
├── observation/{api,model,repository,service}
├── search/{api,service}
└── security
```

Frontend notable modules: `src/routes` (TanStack file routes), `src/lib/api.ts` (REST client), `src/data/backend-catalogue.ts` (loads API catalogue/observations), `src/data` (view/domain data), and `src/components` (shared UI/admin panels).

## OOAD principles and patterns found

| Pattern/principle | Actual participants and evidence | How to draw it |
|---|---|---|
| Layered architecture / MVC | `*Controller` classes in `api`, `*Service`, JPA `model`, `repository` packages | Request travels Controller → Service → Repository → Entity/DB; response DTO returns upward. |
| Repository pattern | `CountryRepository`, `IndicatorRepository`, `HealthObservationRepository`, `DatasetRepository`, `ArticleRepository`, `GlossaryTermRepository`, `DonationRepository`, etc. extend Spring Data `JpaRepository` | Services depend on repository interfaces; Spring supplies runtime implementations. |
| Dependency inversion through constructor injection | Services/controllers take repositories/services as constructor parameters, e.g. `ObservationService(HealthObservationRepository, CountryRepository, IndicatorRepository, DatasetRepository)` | Show required interface dependencies; no service manually constructs its repository. |
| DTO / Data Mapper boundary | API records such as `ObservationResponse`, `DatasetResponse`, `ArticleResponse`; services map entities into response records | Entity is not returned directly by public controllers. |
| Application Service | `CatalogueService`, `ObservationService`, `DatasetService`, `CsvImportService`, `ArticleService`, `GlossaryService`, `DonationService`, `SearchService` coordinate each use case | These are service-layer classes, not GoF Facades by explicit code contract. |
| Aggregate-like ownership | `Article` owns ordered `ArticleReference` children; `GlossaryTerm` owns `GlossaryReference` children using cascade and orphan removal | Filled composition diamond at Article/GlossaryTerm side for the reference collection. |
| Spring-managed singleton scope | `@Service`/`@Repository` beans use Spring's default singleton scope | Framework lifecycle fact, not a hand-written GoF Singleton. |

**Not found in the inspected project:** a Strategy family, Observer/Subject notification flow, Factory Method, Adapter, or explicit Facade abstraction. Do not draw these. `CsvImportService` directly creates `CsvDocumentParser`; this is a concrete helper collaboration, not an Adapter or Factory.

## Key scenarios reused across behavioral diagrams

| ID | Scenario / goal | Entry point | Real call chain | Why selected |
|---|---|---|---|---|
| S1 | Explore an indicator series for a country | `GET /api/v1/observations`; `ObservationController.search(...)` | `ObservationController.search` → `ObservationService.search` → validate/filter → `HealthObservationRepository.search` → `ObservationService.toResponse` → `ObservationPageResponse` | Core chart/profile data path; spans API, validation, query, entities, DTO. |
| S2 | Search the published catalogue | `GET /api/v1/search?q=...`; `SearchController.search` | `SearchController.search` → `SearchService.search` → public repositories for countries/topics/indicators/articles/glossary/datasets/sources → `SearchResponse` | Cross-module read flow with minimum-query and result-limit branches. |
| S3 | Administrator signs in | `GET /api/v1/admin/auth/csrf`, then `POST /api/v1/admin/auth/login` | `AdminAuthController.getCsrfToken` → Spring CSRF; then `AdminAuthController.login` → `AdminAuthenticationService.authenticate` → `AuthenticationManager`/`AdminUserDetailsService` → `AdminUserRepository` → session security context | Security-critical flow with CSRF, credentials, account-state branch, and session creation. |
| S4 | Register a WDI dataset and import CSV observations | Admin UI → `POST /api/v1/admin/datasets`, then `POST /api/v1/admin/datasets/{slug}/imports` | `AdminDatasetController.createDataset` → `DatasetService.createDataset`/mapping validation → repositories; then `AdminDatasetController.importCsv` → `CsvImportService.importCsv` → `CsvDocumentParser.parse` → row validation/persist batch, observations/errors | Main data-ingestion business flow; includes real validation, partial rejection, transaction/persistence. |
| S5 | Publish and read an article | `POST`/`PUT /api/v1/admin/articles[/{slug}]`; public `GET /api/v1/articles/{slug}` | `AdminArticleController.create/update` → `ArticleService.create/update` → resolve category/tags/relationships → `ArticleRepository`; public `PublicArticleController.get` → `ArticleService.getPublic` → DTO | Content lifecycle with draft/published/archived visibility branches and many-to-many metadata. |
| S6 | Submit a donation pledge | `POST /api/v1/donations` | `DonationController.submit` → `DonationService.submit` → validate normalized request/create reference → `DonationRepository.saveAndFlush` → receipt DTO | Separate public write flow; amount/frequency validation and simulated-success branch. No payment processor is called. |

Database is an external execution system to the backend and appears as a secondary system participant where useful; it is not a human actor. There is no email/SMS/payment gateway or runtime World Bank API client in this code. Source data is uploaded as an administrator-provided CSV.

## Evidence inspected

`backend/pom.xml`, `backend/src/main/resources/application.properties`, `backend/Dockerfile`, `backend/src/main/resources/README.md`, all backend Java source and tests, `backend/src/main/resources/db/migration/V1__...` through `V5__...`, `frontend/README.md`, `frontend/src/lib/api.ts`, frontend route/admin files, `DEPLOYMENT.md`, and `planning/stage-6b-data/{IMPORT_VERIFICATION.md,SOURCES_AND_PROVENANCE.md}`.

## Diagram count recommendation

Draw one Use Case diagram, seven focused Class diagrams (C2 is split into C2a/C2b), two Object snapshots, one Component diagram (split across a page if needed), one Deployment diagram, six Sequence diagrams, three Communication diagrams, and six Activity diagrams. The class/activity/sequence notes below label module and scenario boundaries so the hand drawings remain legible.
