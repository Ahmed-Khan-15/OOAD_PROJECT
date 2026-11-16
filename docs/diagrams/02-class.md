# Class Diagrams

Draw these as separate focused diagrams. The notes use Java visibility (`+` public, `-` private, `#` protected). JPA entities have protected no-argument constructors; ordinary getters are omitted unless they clarify a relationship. All classes are in `com.globalhealthexplorer` plus the package shown in each heading.

## C1 — Catalogue and observation query (11 boxes)

**Purpose:** Public query path and persisted health-data relationships. Packages: `catalogue.{api,model,repository,service}`, `observation.{api,model,repository,service}`.

### Classes and key members

- `Country` (`catalogue.model`): `- id: Long`, `- name: String`, `- iso2: String`, `- iso3: String`, `- region: String`, `- active: boolean`; public getters; `# Country()`.
- `Topic`: `- id: Long`, `- name: String`, `- slug: String`, `- description: String`, `- overview: boolean`, `- active: boolean`, `- displayOrder: int`; public getters; protected JPA constructor.
- `Indicator`: `- id: Long`, `- topic: Topic`, `- name: String`, `- slug: String`, `- description: String`, `- unit: String`, `- preferredDirection: String`, `- active: boolean`, `- displayOrder: int`; public getters.
- `HealthObservation`: `- id: Long`, `- country: Country`, `- indicator: Indicator`, `- dataset: Dataset`, `- sourceMapping: IndicatorSourceMapping`, `- importBatch: ImportBatch`, `- referenceYear: int`, `- value: BigDecimal`, `- dimensions: Map<String,Object>`, `- valueStatus: String`, `- uncertaintyLower/uncertaintyUpper: BigDecimal`, `- originalValueText: String`, `- observationNote: String`; public getters.
- `CountryRepository` `<<interface>>`: extends `JpaRepository<Country,Long>`; `findAllByActiveTrueOrderByNameAsc(): List<Country>`, `findByIso3IgnoreCaseAndActiveTrue(iso3:String): Optional<Country>`, `searchActive(pattern:String,pageable:Pageable): Page<Country>`.
- `TopicRepository` `<<interface>>`: extends `JpaRepository<Topic,Long>`; `findAllByActiveTrueOrderByDisplayOrderAsc(): List<Topic>`, `findBySlugAndActiveTrue(slug:String): Optional<Topic>`, `searchActive(pattern:String,pageable:Pageable): Page<Topic>`.
- `IndicatorRepository` `<<interface>>`: extends `JpaRepository<Indicator,Long>`; `findAllActiveWithTopic(): List<Indicator>`, active slug/topic queries, `findSlugsWithActiveObservations(): Set<String>`, `searchActive(pattern,pageable): Page<Indicator>`.
- `HealthObservationRepository` `<<interface>>`: extends `JpaRepository<HealthObservation,Long>`; `search(countryIso3,indicatorSlug,datasetSlug,fromYear,toYear,pageable): Page<HealthObservation>`; `insertIfNotDuplicate(...) : int`.
- `CatalogueService`: `- countryRepository: CountryRepository`, `- topicRepository: TopicRepository`, `- indicatorRepository: IndicatorRepository`, `- COUNTRY_SLUG_ALIASES: Map<String,String> {static, final}`; `+ getCountries(): List<CountryResponse>`, `+ getCountry(identifier:String): CountryResponse`, `+ getTopics(): List<TopicResponse>`, `+ getTopic(requestedSlug:String): TopicResponse`, `+ getIndicators(): List<IndicatorResponse>`, `+ getIndicator(slug:String): IndicatorResponse`.
- `ObservationService`: `- observationRepository: HealthObservationRepository`, `- countryRepository: CountryRepository`, `- indicatorRepository: IndicatorRepository`, `- datasetRepository: DatasetRepository`; `+ search(countryIso3:String, indicatorSlug:String, datasetSlug:String, fromYear:Integer, toYear:Integer, page:int, size:int, sortBy:String, direction:String): ObservationPageResponse`; private `toResponse(observation:HealthObservation): ObservationResponse`.
- `ObservationController`: `- observationService: ObservationService`; `+ search(country:String, indicator:String, dataset:String, fromYear:Integer, toYear:Integer, page:int, size:int, sortBy:String, direction:String): ObservationPageResponse` (`GET /api/v1/observations`).

### Relationships

| From → to | UML relationship / multiplicity | Evidence |
|---|---|---|
| `Topic` → `Indicator` | Association; Topic `1` — Indicator `0..*`; each Indicator `1` Topic | `Indicator.topic`, `@ManyToOne`, non-null `topic_id`. |
| `Country` → `HealthObservation` | Association; Country `1` — observations `0..*` | `HealthObservation.country`, `@ManyToOne`, non-null. |
| `Indicator` → `HealthObservation` | Association; Indicator `1` — observations `0..*` | `HealthObservation.indicator`, `@ManyToOne`, non-null. |
| `Dataset` → `HealthObservation` | Association; Dataset `1` — observations `0..*` | `HealthObservation.dataset`, `@ManyToOne`, non-null. |
| `ObservationController` → `ObservationService` | Directed association | Constructor field injection. |
| `ObservationService` → four repositories | Directed associations/dependencies | Constructor-injected fields. |
| `CatalogueService` → three catalogue repositories | Directed associations/dependencies | Constructor-injected fields. |
| Each repository → `JpaRepository<T,Long>` | Interface realization/inheritance | `extends JpaRepository`. |

`Topic` and `Indicator` response records are DTOs, not entity relationships. Add `Dataset` on C2 and `ImportBatch` on C3 to avoid crowding this diagram.

## C2 — Dataset provenance and CSV import (draw as C2a + C2b; each <= 15 boxes)

**Purpose:** Dataset definition, exact source mappings and import processing. Packages: `dataset`, `imports`, `observation`, `security`.

To keep the hand drawing readable, use **C2a Dataset registry** with `DataSource`, `Dataset`, `IndicatorSourceMapping`, `DatasetService`, `AdminDatasetController`, `DatasetRepository`, `DataSourceRepository`, `IndicatorSourceMappingRepository`, and `IndicatorRepository` (9 boxes). Use **C2b Import pipeline** with `CsvImportService`, `CsvDocumentParser`, `ParsedDocument`, `ParsedRow`, `ImportBatch`, `ImportError`, `HealthObservation`, `AdminUser`, `AdminUserRepository`, `CountryRepository`, `IndicatorSourceMappingRepository`, `DatasetService`, `ImportBatchRepository`, `ImportErrorRepository`, and `HealthObservationRepository` (15 boxes). Shared `DatasetService` and mapping interface may be repeated on the second sheet.

### Classes and key members

- `DataSource`: `- id: Long`, `- name: String`, `- abbreviation: String`, `- websiteUrl: String`, `- description: String`, `- active: boolean`; getters only.
- `Dataset`: `- id: Long`, `- dataSource: DataSource`, `- name/slug/description/sourceUrl/citation/licenseName/licenseUrl/methodology/frequency: String`, `- publishedAt: LocalDate`, `- coverageStartYear/coverageEndYear: Integer`, `- active: boolean`; `+ Dataset(dataSource,...,active)`, `+ update(dataSource,...,active)`; getters.
- `IndicatorSourceMapping`: `- id: Long`, `- dataset: Dataset`, `- indicator: Indicator`, `- originalIndicatorCode/originalIndicatorName/originalUnit/conversionNotes/dimensionsDescription: String`; constructor, `+ update(originalIndicatorCode,originalIndicatorName,originalUnit,conversionNotes,dimensionsDescription)`, getters.
- `ImportBatch`: `- id: Long`, `- dataset: Dataset`, `- initiatedBy: AdminUser`, `- importMethod/status/originalFilename/fileChecksum/summary: String`, `- startedAt/completedAt: Instant`, `- totalRows/acceptedRows/rejectedRows/duplicateRows: int`; `+ ImportBatch(dataset,initiatedBy,filename,checksum,startedAt)`, `+ complete(status,completedAt,totalRows,acceptedRows,rejectedRows,duplicateRows,summary)`.
- `ImportError`: `- id: Long`, `- importBatch: ImportBatch`, `- rowNumber: Integer`, `- errorCode/errorMessage: String`, `- rawRow: Map<String,Object>`; `+ ImportError(importBatch,rowNumber,errorCode,errorMessage,rawRow)`.
- `DatasetService`: fields `DatasetRepository`, `DataSourceRepository`, `IndicatorSourceMappingRepository`, `IndicatorRepository`; public `getPublicDatasets`, `getPublicDataset`, `getAdminDatasets`, `getAdminDataset`, `createDataset(DatasetRequest): DatasetResponse`, `updateDataset(slug,request): DatasetResponse`, `getPublicSources`, `getPublicSource`; private `record ResolvedMapping(Indicator indicator,String originalCode,String originalName,String originalUnit,String conversionNotes,String dimensionsDescription)`.
- `CsvImportService`: fields `DatasetService`, mapping/country/admin/batch/error/observation repositories, `ObjectMapper`, `- csvParser: CsvDocumentParser`; `+ importCsv(datasetSlug:String,file:MultipartFile,adminEmail:String): ImportBatchResponse`, `+ getImports(datasetSlug:String): List<ImportBatchResponse>`; `MAX_FILE_BYTES`, `REQUIRED_HEADERS`, `ALLOWED_STATUSES` are `private static final`.
- `CsvDocumentParser` (package-private `final`): `+ parse(csv:String): ParsedDocument`; nested `ParsedDocument(headers:List<String>,rows:List<ParsedRow>)`, `ParsedRow(lineNumber:int,cells:List<String>)` records.
- `AdminDatasetController`: fields `DatasetService`, `CsvImportService`; public `getDatasets`, `getDataset(slug)`, `createDataset(request)`, `updateDataset(slug,request)`, `importCsv(slug,file,principal)`, `getImports(slug)`.
- Repositories: `DatasetRepository extends JpaRepository<Dataset,Long>`; `IndicatorSourceMappingRepository extends JpaRepository<IndicatorSourceMapping,Long>`; `ImportBatchRepository extends JpaRepository<ImportBatch,Long>`; `ImportErrorRepository extends JpaRepository<ImportError,Long>`; `CountryRepository`; `AdminUserRepository`; `HealthObservationRepository` (C1 may be repeated only if useful).

### Relationships

| From → to | Type / multiplicity | Evidence |
|---|---|---|
| `DataSource` → `Dataset` | Association, 1 — 0..* | `Dataset.dataSource` is non-optional `@ManyToOne`. |
| `Dataset` → `IndicatorSourceMapping` | Association, 1 — 0..* | Mapping holds non-optional dataset many-to-one; mappings are explicitly saved/removed by `DatasetService`. Do not imply JPA cascade composition. |
| `Indicator` → `IndicatorSourceMapping` | Association, 1 — 0..* | Mapping holds non-optional indicator many-to-one. |
| `Dataset` → `HealthObservation` | Association, 1 — 0..* | Non-optional observation dataset field. |
| `Dataset` → `ImportBatch` | Association, 1 — 0..* | `ImportBatch.dataset` non-optional many-to-one. |
| `AdminUser` → `ImportBatch` | Association, 0..1 admin — 0..* batches | Nullable `initiatedBy` many-to-one; nullable importer is allowed. |
| `ImportBatch` → `ImportError` | Association, 1 — 0..* | `ImportError.importBatch` non-optional; service records row/file errors. No cascade is declared. |
| `ImportBatch` → `HealthObservation` | Association, 0..1 batch — 0..* observations | Nullable observation `importBatch` many-to-one. |
| `IndicatorSourceMapping` → `HealthObservation` | Association, 0..1 mapping — 0..* observations | Nullable observation `sourceMapping` many-to-one. |
| `AdminDatasetController` → `DatasetService`, `CsvImportService` | Directed association | Constructor fields. |
| `CsvImportService` → `DatasetService` and repositories | Directed associations | Constructor injection. |
| `CsvImportService` → `CsvDocumentParser` | Directed dependency | Field initialized directly with `new CsvDocumentParser()`; no parser interface. |

## C3 — Administrator authentication and session (8 boxes)

**Purpose:** Only the security setup and real admin session flow. Packages: `security`.

- `AdminUser`: fields `- id: Long`, `- email: String`, `- passwordHash: String`, `- displayName: String`, `- active: boolean = true`, `- lastLoginAt: Instant`; `+ AdminUser(email,passwordHash,displayName)`; getters.
- `AdminPrincipal implements UserDetails`: fields `- adminId: Long`, `- email/passwordHash/displayName: String`, `- active: boolean`, `- serialVersionUID: long {static, final}`; constructor `+ AdminPrincipal(adminUser:AdminUser)`; `+ getAuthorities(): Collection<? extends GrantedAuthority>`, `+ getPassword(): String`, `+ getUsername(): String`, `+ isAccountNonExpired(): boolean`, `+ isAccountNonLocked(): boolean`, `+ isCredentialsNonExpired(): boolean`, `+ isEnabled(): boolean`.
- `AdminUserRepository <<interface>> extends JpaRepository<AdminUser,Long>`: `findByEmailIgnoreCase(email:String): Optional<AdminUser>`, `updateLastLogin(adminId:Long): int` plus base repository methods.
- `AdminUserDetailsService implements UserDetailsService`: `- adminUserRepository: AdminUserRepository`; `+ loadUserByUsername(email:String): UserDetails`.
- `AdminAuthenticationService`: `- authenticationManager: AuthenticationManager`, `- adminUserRepository: AdminUserRepository`; `+ authenticate(email:String,password:String): AdminPrincipal`.
- `AdminAuthController`: fields `AdminAuthenticationService`, `SecurityContextRepository`, `SessionAuthenticationStrategy`; `+ login(request:AdminLoginRequest,servletRequest:HttpServletRequest,servletResponse:HttpServletResponse): AdminSessionResponse`, `+ getCsrfToken(csrfToken:CsrfToken): Map<String,String>`, `+ getCurrentSession(principal:Principal): AdminSessionResponse`.
- `SecurityConfiguration` (all bean methods are package-visible `~`): `passwordEncoder(): PasswordEncoder`, `authenticationManager(adminUserDetailsService:AdminUserDetailsService,passwordEncoder:PasswordEncoder): AuthenticationManager`, `securityContextRepository(): SecurityContextRepository`, `sessionAuthenticationStrategy(): SessionAuthenticationStrategy`, `csrfTokenRepository(): CsrfTokenRepository`, `corsConfigurationSource(allowedOrigins:String): CorsConfigurationSource`, `applicationSecurity(http:HttpSecurity,securityContextRepository:SecurityContextRepository,csrfTokenRepository:CsrfTokenRepository,corsConfigurationSource:CorsConfigurationSource): SecurityFilterChain`.
- `AdminBootstrapConfiguration`: conditional one-time administrator bootstrap bean; configuration values come from `app.admin.bootstrap.*` properties. It is not a public registration use case.

### Relationships

- `AdminPrincipal` realizes `UserDetails` (dashed line, hollow triangle).
- `AdminUserDetailsService` realizes `UserDetailsService`.
- `AdminUserDetailsService` → `AdminUserRepository`; `AdminAuthenticationService` → `AuthenticationManager` and `AdminUserRepository`; `AdminAuthController` → service/security interfaces: constructor associations.
- `AdminPrincipal` is constructed from `AdminUser` (`new AdminPrincipal(adminUser)` in `AdminUserDetailsService`).
- `AdminUserRepository` → `JpaRepository<AdminUser,Long>` realization.
- Admin user to import batch is optional association (see C2), not an authentication-owned entity relationship.

No custom `UserFactory`, `AdminSessionSingleton`, or adapter appears. Spring Security supplies the authentication abstractions.

## C4 — Editorial domain entities (9 boxes)

**Purpose:** Article/glossary content and catalogue relationships. Packages: `editorial.article.model`, `editorial.glossary.model`, and referenced catalogue entities.

- `Article`: fields `- id: Long`, `- category: ArticleCategory`, `- title: String`, `- subtitle: String`, `- slug: String`, `- coverImageUrl: String`, `- authorName: String`, `- introduction: String`, `- content: String`, `- readingMinutes: Integer`, `- status: String`, `- publishedAt: LocalDate`, `- createdAt/updatedAt: Instant`, `- tags: Set<ArticleTag>`, `- references: List<ArticleReference>`, `- relatedArticles: Set<Article>`, `- topics: Set<Topic>`, `- countries: Set<Country>`, `- indicators: Set<Indicator>`; constructor, `update(...)`, `archive(now:Instant)`, `replaceReferences(values:List<ArticleReference>)`; getters.
- `ArticleCategory`: `- id: Long`, `- slug/name: String`, `- displayOrder: int`; getters.
- `ArticleTag`: `- id: Long`, `- slug/name: String`; constructor and getters.
- `ArticleReference`: `- id: Long`, `- article: Article`, `- displayOrder: int`, `- label/url: String`; constructor and getters.
- `GlossaryTerm`: `- id: Long`, `- term/slug/definition/extendedExplanation: String`, `- createdAt/updatedAt: Instant`, `- references: List<GlossaryReference>`, `- relatedTerms: Set<GlossaryTerm>`, `- articles: Set<Article>`, `- topics: Set<Topic>`, `- indicators: Set<Indicator>`; constructor, `update(...)`, `replaceReferences(values)`; getters.
- `GlossaryReference`: `- id: Long`, `- glossaryTerm: GlossaryTerm`, `- displayOrder: int`, `- label/url: String`; constructor and getters.
- `Country`, `Topic`, `Indicator` fields and types are in C1.

### Relationships (draw only relevant subset per sheet)

- `ArticleCategory 1` — `Article 0..*`; each `Article` has exactly one required category (`@ManyToOne`).
- `Article 1` ◆— `ArticleReference 0..*` composition; `@OneToMany(mappedBy="article",cascade=ALL,orphanRemoval=true)`.
- `Article 1` — `ArticleTag 0..*` and inverse (many-to-many join `article_tag_links`).
- `Article 0..*` — `Article 0..*` self association via `article_related_articles`.
- `Article 0..*` — `Topic 0..*`, `Country 0..*`, `Indicator 0..*` via join tables `article_topics`, `article_countries`, `article_indicators`.
- `GlossaryTerm 1` ◆— `GlossaryReference 0..*` composition; cascade ALL + orphan removal.
- `GlossaryTerm 0..*` — `GlossaryTerm 0..*` self association via `glossary_related_terms`.
- `GlossaryTerm 0..*` — `Article 0..*`, `Topic 0..*`, `Indicator 0..*` via `glossary_articles`, `glossary_topics`, `glossary_indicators`.

## C5 — Editorial application services (11 boxes)

**Purpose:** Article publishing and glossary management use cases. Packages: article/glossary `api`, `service`, `repository`.

- `PublicArticleController`: `- articleService: ArticleService`; `+ list(category:String,tag:String,page:int,size:int): EditorialPageResponse<ArticleResponse>`, `+ get(slug:String): ArticleResponse`.
- `AdminArticleController`: `- articleService: ArticleService`; `+ list(category:String,tag:String,page:int,size:int): EditorialPageResponse<ArticleResponse>`, `+ get(slug:String): ArticleResponse`, `+ create(request:ArticleRequest): ArticleResponse`, `+ update(slug:String,request:ArticleRequest): ArticleResponse`, `+ delete(slug:String): void`.
- `ArticleService`: fields `ArticleRepository`, `ArticleCategoryRepository`, `ArticleTagRepository`, `TopicRepository`, `CountryRepository`, `IndicatorRepository`; `+ listPublic(categorySlug:String,tagSlug:String,page:int,size:int): EditorialPageResponse<ArticleResponse>`, `+ getPublic(slug:String): ArticleResponse`, `+ listAdmin(categorySlug:String,tagSlug:String,page:int,size:int): EditorialPageResponse<ArticleResponse>`, `+ getAdmin(slug:String): ArticleResponse`, `+ create(request:ArticleRequest): ArticleResponse`, `+ update(slug:String,request:ArticleRequest): ArticleResponse`, `+ deleteOrArchive(slug:String): void`; private `applyRelationships(article:Article,request:ArticleRequest):void`, `validateForPublication(request:ArticleRequest,status:String):void`, `normalizeStatus(status:String):String`, `publicationDate(requested:LocalDate,status:String,previous:LocalDate):LocalDate`, `toResponse(article:Article,publicView:boolean):ArticleResponse`.
- `PublicGlossaryController`: `- glossaryService: GlossaryService`; `+ search(query:String,page:int,size:int): EditorialPageResponse<GlossaryResponse>`, `+ get(slug:String): GlossaryResponse`.
- `AdminGlossaryController`: `- glossaryService: GlossaryService`; `+ list(query:String,page:int,size:int): EditorialPageResponse<GlossaryResponse>`, `+ get(slug:String): GlossaryResponse`, `+ create(request:GlossaryRequest): GlossaryResponse`, `+ update(slug:String,request:GlossaryRequest): GlossaryResponse`, `+ delete(slug:String): void`.
- `GlossaryService`: fields `GlossaryTermRepository`, `ArticleRepository`, `TopicRepository`, `IndicatorRepository`; `+ searchPublic(query:String,page:int,size:int): EditorialPageResponse<GlossaryResponse>`, `+ getPublic(slug:String): GlossaryResponse`, `+ listAdmin(query:String,page:int,size:int): EditorialPageResponse<GlossaryResponse>`, `+ getAdmin(slug:String): GlossaryResponse`, `+ create(request:GlossaryRequest): GlossaryResponse`, `+ update(slug:String,request:GlossaryRequest): GlossaryResponse`, `+ delete(slug:String): void`; private `applyRelationships(term:GlossaryTerm,request:GlossaryRequest):void`, `toResponse(term:GlossaryTerm,publicView:boolean):GlossaryResponse`, `validatePage(page:int,size:int):void`.
- `ArticleRepository <<interface>> extends JpaRepository<Article,Long>`; `ArticleCategoryRepository`, `ArticleTagRepository` also extend corresponding `JpaRepository` types.
- `GlossaryTermRepository <<interface>> extends JpaRepository<GlossaryTerm,Long>`; custom public search/list/detail methods.
- `EditorialPageResponse<T>` record: `content:List<T>`, `page:int`, `size:int`, `totalElements:long`, `totalPages:int`, `hasNext:boolean`.

**Relationships:** each controller → its service; each service → its constructor-injected repositories; repositories realize `JpaRepository`. Article/reference and glossary/reference composition details are in C4. No `Editor` interface or explicit publication Strategy is declared.

## C6 — Search and donations (10 boxes)

**Purpose:** Cross-catalogue search and public simulated contribution. Packages: `search`, `donation`.

- `SearchController`: `- searchService: SearchService`; `+ search(q:String): SearchResponse` (`GET /api/v1/search`).
- `SearchService`: `- MINIMUM_QUERY_LENGTH:int = 2 {static, final}`, `- PER_CATEGORY_LIMIT:int = 8 {static, final}`; seven repository fields for Country/Topic/Indicator/Article/GlossaryTerm/Dataset/DataSource; `+ search(rawQuery:String): SearchResponse`; private `page(field:String): PageRequest`, mapper overloads to `SearchResult`, `shortText(value:String):String`, `response(...):SearchResponse`.
- `SearchResponse` record: query, minimumQueryLength, perCategoryLimit, totalResults, and `List<SearchResult>` for countries/topics/indicators/articles/glossary/datasets/sources.
- `SearchResult` record: `id:String`, `title:String`, `description:String`, `url:String`.
- `DonationController`: `- donationService: DonationService`; `+ submit(request:DonationRequest): DonationReceiptResponse`.
- `DonationService`: `- donationRepository: DonationRepository`; `+ submit(request:DonationRequest): DonationReceiptResponse`, `+ list(page:int,size:int): EditorialPageResponse<AdminDonationResponse>`, `+ get(reference:String): AdminDonationResponse`, `+ summary(): DonationSummaryResponse`.
- `Donation` fields: `id:Long`, `reference:String`, `donorName:String`, `email:String`, `amount:BigDecimal`, `currency:String="USD"`, `frequency:String`, `anonymous:boolean`, `status:String="SIMULATED_SUCCESS"`, `createdAt:Instant`; public constructor and getters.
- `DonationRequest` record: `donorName:String`, `email:String`, `amount:BigDecimal`, `frequency:String`, `anonymous:Boolean`; `rejectUnexpectedField(name:String,value:Object):void` rejects unexpected/card fields.
- `DonationReceiptResponse` record: `reference:String`, `amount:BigDecimal`, `currency:String`, `frequency:String`, `status:String`, `createdAt:Instant`, `simulated:boolean`, `receiptMessage:String`.
- `DonationRepository <<interface>> extends JpaRepository<Donation,Long>`; reference lookup/existence, created-time paging, status/frequency counts, sum query.

**Relationships:** `SearchController` → `SearchService` → seven read repositories; service maps entities to response records. `DonationController` → `DonationService` → `DonationRepository`; `DonationService` creates and persists `Donation`. `Donation` has no payment or provider association. These flows show repository/DTO layering, not Strategy/Observer.

## General diagram rules

- Underline `static` members (the constants above); `final` does not mean static.
- Use solid hollow-triangle generalization only for actual class/interface extension; dashed hollow-triangle realization for `AdminPrincipal → UserDetails`, `AdminUserDetailsService → UserDetailsService`, and repository interfaces → `JpaRepository`.
- Draw `JpaRepository` as a common framework interface rather than reproducing every inherited CRUD method.
- Omitted generated/accessor methods exist on entities; include them only when the teacher asks for a full structural class diagram.
- Do not add Strategy/Observer/Factory/Adapter/Facade stereotypes. `SearchService` coordinates categories but is not declared as a Facade type or stable facade interface.
