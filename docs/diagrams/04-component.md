# Component Diagram

**Scope:** runtime software components of the whole application. Draw package groupings as `<<component>>` boxes; use ports/lollipops for REST contracts and actual Java repository/framework interfaces. Put PostgreSQL outside the application component as a database store. The package dependency arrows below point from caller to required component.

## Components and interfaces

| Component | Real packages/classes | Provided interface | Required interfaces |
|---|---|---|---|
| Browser UI | `frontend/src/routes`, `src/components` | Pages/UI; browser HTTP requests | `Global Health Explorer REST API` via `src/lib/api.ts`; Vercel/browser runtime. |
| REST API / Controllers | `catalogue.api`, `observation.api`, `dataset.api`, `search.api`, `editorial.article.api`, `editorial.glossary.api`, `donation.api`, `security.AdminAuthController` | HTTP endpoints under `/api/v1/**` | Application services; Spring MVC/Jackson/Bean Validation; Spring Security; DTOs. |
| Catalogue application | `catalogue.service.CatalogueService` | Country/topic/indicator read use cases | `CountryRepository`, `TopicRepository`, `IndicatorRepository`. |
| Observation application | `observation.service.ObservationService` | Observation search/paging | `HealthObservationRepository`, `CountryRepository`, `IndicatorRepository`, `DatasetRepository`. |
| Dataset/provenance application | `dataset.service.DatasetService` | Public source/dataset reads and admin registry writes | `DatasetRepository`, `DataSourceRepository`, `IndicatorSourceMappingRepository`, `IndicatorRepository`. |
| CSV ingestion | `imports.service.CsvImportService`, `CsvDocumentParser` | Protected upload/history use cases | `DatasetService`; `CountryRepository`, `AdminUserRepository`, mapping/batch/error/observation repositories; Jackson `ObjectMapper`. |
| Editorial application | `editorial.article.service.ArticleService`, `editorial.glossary.service.GlossaryService` | Article and glossary CRUD/read/search | Article/glossary repositories plus catalogue repositories for relationships. |
| Search application | `search.service.SearchService` | Search endpoint result aggregation | Country/topic/indicator/article/glossary/dataset/source repository interfaces. |
| Donation application | `donation.service.DonationService` | Simulated pledge, admin list/detail/summary | `DonationRepository`; Spring validation. |
| Authentication/security | `security.*`, `SecurityConfiguration` | Admin login/current-session/CSRF/logout and authorization | Spring Security `AuthenticationManager`, `UserDetailsService`, `PasswordEncoder`, HTTP session; `AdminUserRepository`. |
| Persistence adapters | `*Repository` interfaces; Spring Data generated proxies | Domain-specific repository interfaces such as `HealthObservationRepository`, `DatasetRepository`, `ArticleRepository` | Spring Data JPA `JpaRepository`, Hibernate/JPA, JDBC driver, PostgreSQL. |
| Database | PostgreSQL database; schema in `db/migration/V1..V5` | SQL storage/query execution | JDBC connection from backend. |

REST and UI are architectural interfaces, not Java `interface` types. The actual Java interface providers are Spring Data repository interfaces, `UserDetailsService`, `UserDetails`, and Spring Security contracts. `JpaRepository` is supplied by Spring Data.

## Dependencies to draw

```text
Browser UI --HTTPS/JSON + session cookie--> REST API / Controllers
Controllers ..use..> application services
Catalogue application ..use..> catalogue repositories
Observation application ..use..> observation + catalogue + dataset repositories
Dataset application ..use..> dataset + source + mapping + indicator repositories
CSV ingestion ..use..> DatasetService + country/admin/import/observation repositories
Editorial application ..use..> article/glossary + catalogue repositories
Search application ..use..> seven public-search repositories
Donation application ..use..> DonationRepository
Authentication/security ..use..> Spring Security + AdminUserRepository
All Spring Data repositories ..realize..> JpaRepository
Spring Data/Hibernate/JDBC ..connects..> PostgreSQL store
Flyway migration runner ..migrates..> PostgreSQL schema
```

## External systems and libraries

- **PostgreSQL:** real persistent store, reached through PostgreSQL JDBC/JPA. Flyway V1–V5 manage schema/reference/editorial seeds.
- **Spring Boot 4 / Spring MVC:** REST server and dependency container.
- **Spring Data JPA + Hibernate:** repository implementation and ORM.
- **Spring Security:** roles, BCrypt password encoder, CSRF token, session and CORS integration.
- **Flyway:** schema migration runner.
- **Jakarta Validation / Jackson:** input DTO validation and JSON conversion.
- **World Bank WDI:** source of CSV files and cited data, but **no runtime HTTP client** appears; an administrator uploads CSV.
- **Payment/email/SMS services:** none present. Donations are marked simulated; no transaction is sent to a provider.
- **Hosting:** `backend/Dockerfile` describes a Java container. Vercel/Railway deployment is documented in `DEPLOYMENT.md` and was user-reported in the project conversation; it is not configured as a checked-in IaC project.

## Layering observations

- Normal dependency direction is controller → service → repository → entity/database.
- `CsvImportService` creates concrete `CsvDocumentParser` with `new`; this couples the ingestion service to a package-private parser. It is a small testability seam, not a package-layer inversion.
- `SearchService` depends on seven repositories to serve one cross-category search. This is intentional aggregation but is a broad service dependency set; no explicit search-port interface exists.
- No dependency from domain entities to controllers or frontend code was found.
- No email/payment adapter, WDI client, strategy interface, event bus, or observer port is present. Do not draw an imagined external integration.
