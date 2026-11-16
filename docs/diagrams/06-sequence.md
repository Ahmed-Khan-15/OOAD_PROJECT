# Sequence Diagrams

Each sequence is an independent request/use case. Return arrows are dashed; `alt` guards are shown literally. Framework/library lifelines may be labelled `Spring Security` or `Spring Data` when the method is an interface call into framework code rather than a project class.

## SD1 — Query observations for a country/indicator

**Actor:** Reader. **Entry:** `GET /api/v1/observations?country=PAK&indicator=under-five-mortality-rate&page=0&size=50`. **Lifelines left→right:** `reader : Reader`, `observationController : ObservationController`, `observationService : ObservationService`, `countryRepository : CountryRepository`, `indicatorRepository : IndicatorRepository`, `observationRepository : HealthObservationRepository`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Reader → `ObservationController` | `search("PAK", "under-five-mortality-rate", null, null, null, 0, 50, "year", "ASC")` | Controller receives query params. |
| 1.1 | Controller → `ObservationService` | `search(countryIso3, indicatorSlug, datasetSlug, fromYear, toYear, page, size, sortBy, direction)` | Exact service method. |
| 1.2 | Service → `CountryRepository` | `findByIso3IgnoreCaseAndActiveTrue("PAK")` | `opt [country filter provided]`; absent/blank normalized to null. |
| 1.3 | Service → `IndicatorRepository` | `findActiveBySlugWithTopic("under-five-mortality-rate")` | `opt [indicator filter provided]`. |
| 1.4 | Service → `HealthObservationRepository` | `search("PAK", "under-five-mortality-rate", null, null, null, PageRequest.of(0,50,sort))` | Active records and import batch statuses filtered in repository query. |
| 1.5 | Repository → Service | `Page<HealthObservation>` | Result may be empty; an empty page is not an exception. |
| 1.6 | Service → Service | `toResponse(observation)` for each returned row | `loop [each observation in result.content]`; maps country, indicator, dataset/source metadata. |
| 1.7 | Service → Controller → Reader | `ObservationPageResponse` | JSON content + page/size/counts/hasNext. |
| alt | Service → Controller → Reader | `IllegalArgumentException` or `ResourceNotFoundException` mapped by `ApiExceptionHandler` | `[invalid page/size/year/sort]` → 400; `[unknown/inactive filter identifier]` → 404. |

## SD2 — Unified search

**Actor:** Reader. **Entry:** `GET /api/v1/search?q=mortality`. **Lifelines:** `reader : Reader`, `searchController : SearchController`, `searchService : SearchService`, `CountryRepository`, `TopicRepository`, `IndicatorRepository`, `ArticleRepository`, `GlossaryTermRepository`, `DatasetRepository`, `DataSourceRepository`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Reader → `SearchController` | `search("mortality")` | `GET /api/v1/search`, `q` optional. |
| 1.1 | Controller → `SearchService` | `search(rawQuery)` | Trim; validate max 100 chars/control characters. |
| alt | SearchService → Controller | `SearchResponse` with seven empty category lists | `[query.length() < MINIMUM_QUERY_LENGTH (2)]`; repositories are not searched. |
| 1.2 | SearchService → `CountryRepository` | `searchActive(pattern, page("name"))` | For `[length >= 2]`, pattern is lowercased `%mortality%`, limit 8. |
| 1.3 | SearchService → `TopicRepository` | `searchActive(pattern, page("name"))` | Same branch. |
| 1.4 | SearchService → `IndicatorRepository` | `searchActive(pattern, page("name"))` | Same branch. |
| 1.5 | SearchService → `ArticleRepository` | `searchPublic(pattern, page("title"))` | Published-only repository query. |
| 1.6 | SearchService → `GlossaryTermRepository` | `searchPublic(pattern, page("term"))` | Published/public terms query. |
| 1.7 | SearchService → `DatasetRepository` | `searchPublic(pattern, page("name"))` | Active public datasets. |
| 1.8 | SearchService → `DataSourceRepository` | `searchActive(pattern, page("name"))` | Active sources. |
| 1.9 | SearchService → SearchService | `response(query,countries,topics,indicators,articles,glossary,datasets,sources)` | Maps to `SearchResult` and sums result counts. |
| 1.10 | SearchService → Controller → Reader | `SearchResponse` | Categories each capped at 8. |
| alt | SearchService → Controller → Reader | `IllegalArgumentException` → problem response | `[query > 100 chars or has ISO control char]`; HTTP 400. |

## SD3 — Administrator login with CSRF and session

**Actor:** Administrator. **Entry:** first `GET /api/v1/admin/auth/csrf`, then `POST /api/v1/admin/auth/login`. **Lifelines:** `administrator : Administrator`, `adminAuthController : AdminAuthController`, `adminAuthenticationService : AdminAuthenticationService`, `authenticationManager : AuthenticationManager`, `userDetailsService : AdminUserDetailsService`, `adminUserRepository : AdminUserRepository`, `securityContextRepository : SecurityContextRepository`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Administrator → Controller | `getCsrfToken(csrfToken)` | Public CSRF bootstrap endpoint. |
| 1.1 | Controller → Administrator | `Map.of("headerName", "X-CSRF-TOKEN", "token", token)` | Frontend caches token. |
| 2 | Administrator → Controller | `login(AdminLoginRequest, servletRequest, servletResponse)` | Request carries CSRF header and JSON email/password. |
| 2.1 | Controller → `AdminAuthenticationService` | `authenticate(request.email(), request.password())` | Email is trimmed/lowercased. |
| 2.2 | Service → `AuthenticationManager` | `authenticate(UsernamePasswordAuthenticationToken.unauthenticated(email,password))` | Spring DaoAuthenticationProvider delegates user lookup/password checking. |
| 2.3 | AuthenticationManager → `AdminUserDetailsService` | `loadUserByUsername(email)` | Spring framework call. |
| 2.4 | UserDetailsService → `AdminUserRepository` | `findByEmailIgnoreCase(email.trim())` | Maps account to `AdminPrincipal` via `new AdminPrincipal(adminUser)`. |
| 2.5 | AuthenticationManager → Service | authenticated `Authentication` with `AdminPrincipal` | `alt [password matches and principal enabled]` success; `[unknown/bad password/inactive]` throws `AuthenticationException`. |
| 2.6 | Service → `AdminUserRepository` | `updateLastLogin(principal.getAdminId())` | Success only. |
| 2.7 | Service → Controller | `AdminPrincipal` |  |
| 2.8 | Controller → Spring Security | `sessionAuthenticationStrategy.onAuthentication(authentication,request,response)` | Changes session ID. |
| 2.9 | Controller → Spring Security | `SecurityContextHolder.setContext(context)` then `securityContextRepository.saveContext(context,request,response)` | Saves session-backed auth context. |
| 2.10 | Controller → Administrator | `AdminSessionResponse.from(principal)` | Password/hash not returned. |
| alt | Controller → Administrator | 401 `Authentication failed` problem | `[AuthenticationException]`; invalid DTO validation is 400; CSRF failure is rejected before controller. |

## SD4 — Register WDI dataset, then upload CSV

**Actor:** Administrator. **Entry:** `POST /api/v1/admin/datasets`, followed by multipart `POST /api/v1/admin/datasets/{slug}/imports`. **Lifelines:** `administrator : Administrator`, `adminDatasetController : AdminDatasetController`, `datasetService : DatasetService`, `datasetRepository : DatasetRepository`, `dataSourceRepository : DataSourceRepository`, `indicatorRepository : IndicatorRepository`, `mappingRepository : IndicatorSourceMappingRepository`, `csvImportService : CsvImportService`, `csvParser : CsvDocumentParser`, `countryRepository : CountryRepository`, `batchRepository : ImportBatchRepository`, `observationRepository : HealthObservationRepository`, `errorRepository : ImportErrorRepository`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Administrator → Controller | `createDataset(DatasetRequest)` | Authenticated `POST`; includes source ID and six mapping request records. |
| 1.1 | Controller → DatasetService | `createDataset(request)` |  |
| 1.2 | DatasetService → DatasetRepository | `existsBySlug(request.slug())` | `alt [slug exists]` throw `IllegalArgumentException`; otherwise continue. |
| 1.3 | DatasetService → DataSourceRepository | `findAllByActiveTrueOrderByNameAsc()` | `findActiveSource` resolves source slug. |
| 1.4 | DatasetService → IndicatorRepository | `findActiveBySlugWithTopic(request.indicatorSlug())` | `loop [each mapping]`; reject unknown/inactive or duplicate source code. |
| 1.5 | DatasetService → DatasetRepository | `saveAndFlush(new Dataset(...))` | Persists dataset row. |
| 1.6 | DatasetService → MappingRepository | `saveAll(...)`; `flush()` | Saves six `IndicatorSourceMapping` rows. |
| 1.7 | Controller → Administrator | `DatasetResponse` | Registry is ready before import. |
| 2 | Administrator → Controller | `importCsv(slug,file,principal)` | Authenticated multipart `file` field. |
| 2.1 | Controller → CsvImportService | `importCsv(slug,file,principal.getName())` |  |
| 2.2 | CsvImportService → DatasetService | `findDataset(slug)` | Resolve active or registered dataset. |
| 2.3 | CsvImportService → AdminUserRepository | `findByEmailIgnoreCase(adminEmail)` | Optional audit identity. |
| 2.4 | CsvImportService → ImportBatchRepository | `saveAndFlush(new ImportBatch(...))` | `PROCESSING` audit batch before row processing. |
| 2.5 | CsvImportService → CsvDocumentParser | `parse(csv)` | UTF-8 decode; parser handles RFC-4180 quoted comma/newline cells. |
| alt | CsvImportService → ImportErrorRepository/Batch | `saveAll(errors)`; `batch.complete("FAILED",...)` | `[invalid UTF-8, invalid CSV, missing required header]`; returns failed import response. |
| 2.6 | CsvImportService → MappingRepository | `findAllByDatasetIdOrderByIdAsc(dataset.getId())` | Build lookup by source code and canonical slug. |
| loop | CsvImportService → repositories | For each `ParsedRow`: `findByIso3IgnoreCaseAndActiveTrue`; validate source mapping/unit/year/value/status/dimensions; `insertIfNotDuplicate(...)` | Row errors are caught and counted; duplicate DB conflict is non-fatal. |
| 2.7 | CsvImportService → ImportErrorRepository | `saveAll(errors)` when non-empty | Persists row-level errors. |
| 2.8 | CsvImportService → ImportBatch | `complete(status,completedAt,total,accepted,rejected,duplicates,summary)` | `COMPLETED` if no rejects/dupes, else `COMPLETED_WITH_ERRORS`. |
| 2.9 | Controller → Administrator | `ImportBatchResponse` | Counts and row errors shown in admin UI. |

## SD5 — Publish and read an article

**Actor:** Administrator, then Reader. **Entry:** `PUT /api/v1/admin/articles/{slug}` to change status to `PUBLISHED`, then `GET /api/v1/articles/{slug}`. **Lifelines:** `administrator`, `adminArticleController : AdminArticleController`, `articleService : ArticleService`, `articleRepository : ArticleRepository`, `articleCategoryRepository : ArticleCategoryRepository`, `topicRepository : TopicRepository`, `countryRepository : CountryRepository`, `indicatorRepository : IndicatorRepository`, `reader`, `publicArticleController : PublicArticleController`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Administrator → AdminArticleController | `update(slug, ArticleRequest)` | Authenticated, CSRF-protected request. |
| 1.1 | Controller → ArticleService | `update(slug,request)` |  |
| 1.2 | ArticleService → ArticleRepository | `findBySlug(slug)` (inside `findArticle`) | `alt [not found]` return 404. |
| 1.3 | ArticleService → ArticleCategoryRepository | `findBySlug(categorySlug)` (inside `findCategory`) |  |
| 1.4 | ArticleService → Article | `update(category,...,status,publishedAt,Instant.now())` | `validateForPublication` requires publishable fields; `publicationDate` resolves date. |
| 1.5 | ArticleService → ArticleService | `applyRelationships(article,request)` | Resolve tag/topic/country/indicator/reference/related-article IDs; reject missing/self related link. |
| 1.6 | ArticleService → ArticleRepository | `save(article)` | Response mapped by `toResponse(article,false)`. |
| 1.7 | Controller → Administrator | `ArticleResponse` with `status="PUBLISHED"` |  |
| 2 | Reader → PublicArticleController | `get(slug)` | `GET /api/v1/articles/{slug}`. |
| 2.1 | PublicArticleController → ArticleService | `getPublic(slug)` |  |
| 2.2 | ArticleService → ArticleRepository | `findBySlugAndStatus(slug,"PUBLISHED")` | Draft/archived do not match. |
| 2.3 | Service → Reader via controller | `ArticleResponse` | `alt [missing/nonpublished]` → `ResourceNotFoundException`/404. |

## SD6 — Submit simulated donation pledge

**Actor:** Donor. **Entry:** `POST /api/v1/donations`. **Lifelines:** `donor : Donor`, `donationController : DonationController`, `donationService : DonationService`, `donationRepository : DonationRepository`.

| # | From → to | Message / return | Fragment / note |
|---|---|---|---|
| 1 | Donor → DonationController | `submit(DonationRequest)` | Jakarta validation runs on request. Unexpected JSON fields, including card data, are rejected by `rejectUnexpectedField`. |
| 1.1 | Controller → DonationService | `submit(request)` |  |
| 1.2 | Service → Service | `newReference()` | `loop [attempt < 5]`; create `GHE-<UTC year>-<8-char UUID>` and check uniqueness. |
| 1.3 | Service → DonationRepository | `existsByReference(reference)` | `alt [reference collision]` retries; after five collisions throws `IllegalStateException`. |
| 1.4 | Service → DonationRepository | `saveAndFlush(new Donation(...))` | `alt [frequency is neither ONCE nor MONTHLY]` throws `IllegalArgumentException` before persistence. No card/payment system call. |
| 1.5 | Service → Donor via controller | `DonationReceiptResponse` | `simulated=true`; says no payment was processed. |

