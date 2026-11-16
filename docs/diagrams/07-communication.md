# Communication Diagrams

In each hand drawing, place the object boxes and links first, then put the numbered messages on the links. Nested numbering shows synchronous calls made as part of a parent message. These are consistent with SD1, SD3, and SD4.

## CD1 — Filtered observation query (corresponds to SD1)

### Objects

`reader:Reader`, `observationController:ObservationController`, `observationService:ObservationService`, `countryRepository:CountryRepository`, `indicatorRepository:IndicatorRepository`, `observationRepository:HealthObservationRepository`.

### Links and messages

1. `reader → observationController`: `search("PAK", "under-five-mortality-rate", null, null, null, 0, 50, "year", "ASC")`
1.1. `observationController → observationService`: `search(countryIso3, indicatorSlug, datasetSlug, fromYear, toYear, page, size, sortBy, direction)`
1.2. `observationService → countryRepository`: `findByIso3IgnoreCaseAndActiveTrue("PAK")`
1.3. `observationService → indicatorRepository`: `findActiveBySlugWithTopic("under-five-mortality-rate")`
1.4. `observationService → observationRepository`: `search(countryIso3, indicatorSlug, datasetSlug, fromYear, toYear, pageable)`
1.5. `observationService → observationController → reader`: return `ObservationPageResponse`.

Show a note on the final message: empty `content` is a valid successful response; no exception occurs when there are zero observations.

## CD2 — Create dataset and upload CSV (corresponds to SD4)

### Objects

`administrator:Administrator`, `adminDatasetController:AdminDatasetController`, `datasetService:DatasetService`, `datasetRepository:DatasetRepository`, `dataSourceRepository:DataSourceRepository`, `indicatorRepository:IndicatorRepository`, `mappingRepository:IndicatorSourceMappingRepository`, `csvImportService:CsvImportService`, `csvParser:CsvDocumentParser`, `countryRepository:CountryRepository`, `batchRepository:ImportBatchRepository`, `observationRepository:HealthObservationRepository`, `errorRepository:ImportErrorRepository`.

### Links and messages

1. `administrator → adminDatasetController`: `createDataset(request)`
1.1. `adminDatasetController → datasetService`: `createDataset(request)`
1.2. `datasetService → datasetRepository`: `existsBySlug(request.slug())`
1.3. `datasetService → dataSourceRepository`: `findAllByActiveTrueOrderByNameAsc()`
1.4. `datasetService → indicatorRepository`: `findActiveBySlugWithTopic(request.indicatorSlug())` (repeated for six mappings)
1.5. `datasetService → datasetRepository`: `saveAndFlush(new Dataset(...))`
1.6. `datasetService → mappingRepository`: `saveAll(...)`, then `flush()`
2. `administrator → adminDatasetController`: `importCsv(slug,file,principal)`
2.1. `adminDatasetController → csvImportService`: `importCsv(slug,file,principal.getName())`
2.2. `csvImportService → datasetService`: `findDataset(slug)`
2.3. `csvImportService → countryRepository`: `findByIso3IgnoreCaseAndActiveTrue(countryCode)` for each row
2.4. `csvImportService → mappingRepository`: `findAllByDatasetIdOrderByIdAsc(dataset.getId())`
2.5. `csvImportService → batchRepository`: `saveAndFlush(new ImportBatch(...))`
2.6. `csvImportService → csvParser`: `parse(csv)`
2.7. `csvImportService → observationRepository`: `insertIfNotDuplicate(...)` for each valid row
2.8. `csvImportService → errorRepository`: `saveAll(errors)` when errors exist
2.9. `csvImportService → administrator` via controller: `ImportBatchResponse`

Mark 2.3 and 2.7 with `loop [each CSV row]`; mark row validation failure on the service path as `alt [invalid row]` and successful insert as `[valid unique row]`.

## CD3 — Authenticated admin login (corresponds to SD3)

### Objects

`administrator:Administrator`, `adminAuthController:AdminAuthController`, `adminAuthenticationService:AdminAuthenticationService`, `authenticationManager:AuthenticationManager`, `userDetailsService:AdminUserDetailsService`, `adminUserRepository:AdminUserRepository`, `securityContextRepository:SecurityContextRepository`.

### Links and messages

1. `administrator → adminAuthController`: `getCsrfToken(csrfToken)`
1.1. `adminAuthController → administrator`: token and header name `X-CSRF-TOKEN`
2. `administrator → adminAuthController`: `login(request,servletRequest,servletResponse)`
2.1. `adminAuthController → adminAuthenticationService`: `authenticate(email,password)`
2.1.1. `adminAuthenticationService → authenticationManager`: `authenticate(UsernamePasswordAuthenticationToken.unauthenticated(...))`
2.1.1.1. `authenticationManager → userDetailsService`: `loadUserByUsername(email)`
2.1.1.1.1. `userDetailsService → adminUserRepository`: `findByEmailIgnoreCase(email.trim())`
2.1.2. `adminAuthenticationService → adminUserRepository`: `updateLastLogin(adminId)`
2.2. `adminAuthController → securityContextRepository`: `saveContext(context,servletRequest,servletResponse)`
2.3. `adminAuthController → administrator`: `AdminSessionResponse.from(principal)`

Mark authentication link with `alt [credentials valid and account active]` success / `[invalid, missing, or inactive]` 401. The CSRF check is a Spring Security filter before the controller; do not draw it as a call to `AdminAuthController`.
