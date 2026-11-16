# Activity Diagrams

Use swimlanes as named below. Solid action nodes represent actual methods; decisions use real validation/status conditions. There is no fork/join for repository calls: the observed services issue those calls sequentially. Use separate activity diagrams for each flow to keep hand drawings readable.

## AD1 — Explore a country/indicator series (S1)

**Swimlanes:** Reader | ObservationController | ObservationService | Repositories.

1. Initial node.
2. Reader selects country/indicator and page settings.
3. `ObservationController.search(...)` receives GET query.
4. Decision `[page >= 0 and 1 <= size <= 100]`; no → `IllegalArgumentException` → `ApiExceptionHandler` problem response → final error; yes → continue.
5. Decision `[valid year range and fromYear <= toYear]`; no → problem response → final error; yes → continue.
6. Decision `[country filter nonblank]`; yes → `CountryRepository.findByIso3IgnoreCaseAndActiveTrue`; no → set normalized filter null.
7. Decision `[indicator filter nonblank]`; yes → `IndicatorRepository.findActiveBySlugWithTopic`; no → normalized filter null.
8. `HealthObservationRepository.search(...)` applies optional filters and paging.
9. Decision `[query returned rows?]`; yes → loop over rows and `ObservationService.toResponse`; no → empty content/page DTO.
10. Return `ObservationPageResponse` to Reader.
11. Final node (success/empty success); validation/not-found alternative ends at error final.

## AD2 — Unified search (S2)

**Swimlanes:** Reader | SearchController | SearchService | Repositories.

1. Initial → Reader submits `q` → `SearchController.search(q)` → `SearchService.search(rawQuery)`.
2. `query = rawQuery == null ? "" : rawQuery.trim()`.
3. Decision `[length > 100 or contains ISO control]`; yes → `IllegalArgumentException` / 400 final; no → continue.
4. Decision `[length < MINIMUM_QUERY_LENGTH (2)]`; yes → `response(query, seven empty lists)` → success final.
5. Otherwise build lowercased `%query%` pattern and sequentially query country, topic, indicator, published article, glossary, dataset, source repositories. No parallel fork is present.
6. Each repository query uses a zero-based `PageRequest` with `PER_CATEGORY_LIMIT=8` and stable sort.
7. Map entities to `SearchResult`, call `response(...)`, return grouped `SearchResponse`.
8. Final success.

## AD3 — Administrator login (S3)

**Swimlanes:** Administrator | Spring Security/API | AdminAuthController | Authentication service | User repository.

1. Initial → Administrator requests `/admin/auth/csrf`.
2. Spring CSRF produces token → `AdminAuthController.getCsrfToken` returns token/header name.
3. Administrator sends login JSON and CSRF header to `POST /admin/auth/login`.
4. Decision `[CSRF valid?]`; no → Spring Security 403 final; yes → controller calls `AdminAuthenticationService.authenticate`.
5. Service normalizes email and calls `AuthenticationManager.authenticate`.
6. Spring provider calls `AdminUserDetailsService.loadUserByUsername` → `AdminUserRepository.findByEmailIgnoreCase`.
7. Decision `[user exists, password matches, account enabled?]`; no → 401 problem final; yes → update `lastLoginAt`.
8. Controller rotates session ID, sets authentication in `SecurityContextHolder`, calls `securityContextRepository.saveContext`.
9. Return `AdminSessionResponse`; final authenticated session.

## AD4 — Register dataset and import observations (S4; end-to-end ingestion process)

**Swimlanes:** Administrator | AdminDatasetController | DatasetService | CSV import service/parser | PostgreSQL repositories.

1. Initial → Admin enters dataset provenance and six mappings → `createDataset(request)`.
2. Decision `[slug unused?]`; no → duplicate-slug client error final; yes → resolve active source.
3. Loop through mappings: resolve active indicator; reject duplicate source keys; check coverage and URL metadata.
4. Save dataset; save six mappings; return dataset response.
5. Admin selects CSV and uploads `file` to `importCsv(slug,file,principal)`.
6. Decision `[file nonempty, <=10MB, .csv extension?]`; no → request error final; yes → read UTF-8 and save `ImportBatch(PROCESSING)`.
7. Parse CSV; decision `[valid UTF-8, parseable, required headers present?]`; no → persist `INVALID_FILE`, mark batch `FAILED`, return failed report final.
8. Build mapping lookup; loop over rows.
9. For each row: resolve active country → mapped indicator → exact unit → year/value/status/dimensions/precision/uncertainty checks.
10. Decision `[row valid?]`; no → increment rejected and save row `ImportError`; yes → call `insertIfNotDuplicate`.
11. Decision `[inserted or duplicate?]`; inserted → increment accepted; conflict/repeated identity → increment duplicate and record error.
12. Mark batch `COMPLETED` if no rejects/duplicates, else `COMPLETED_WITH_ERRORS`; save errors; return counts.
13. Final success/report. A batch with row-level rejects is a completed import with an error report, not an all-or-nothing rollback.

## AD5 — Publish then read article (S5)

**Swimlanes:** Administrator | AdminArticleController | ArticleService/repositories | Reader | PublicArticleController.

1. Initial → Administrator submits an article update with `status=PUBLISHED`.
2. `AdminArticleController.update` → `ArticleService.update` → find existing article and category.
3. Decision `[slug collision with another article?]`; yes → client error final; no → normalize status.
4. Decision `[required publication fields valid?]`; no → validation error final; yes → `Article.update(...)` and `applyRelationships(...)` resolve topics/countries/indicators/tags/references/related articles.
5. Save article and return admin response with `PUBLISHED` status.
6. Reader requests public article by slug → `PublicArticleController.get` → `ArticleService.getPublic` → `ArticleRepository.findBySlugAndStatus(slug,"PUBLISHED")`.
7. Decision `[published article found?]`; no → 404 final; yes → map `ArticleResponse`.
8. Return article to Reader → final success.

## AD6 — Submit simulated donation (S6)

**Swimlanes:** Donor | DonationController | DonationService | DonationRepository.

1. Initial → Donor submits name, email, amount, frequency, anonymity.
2. Jakarta validation decision `[DTO valid and no unexpected fields?]`; no → 400 final; yes → `DonationService.submit`.
3. Normalize frequency; decision `[frequency is ONCE or MONTHLY?]`; no → `IllegalArgumentException`/400 final; yes → `newReference()`.
4. Loop up to five times checking `DonationRepository.existsByReference`; unique → continue; all collide → `IllegalStateException` final.
5. Save `Donation` with `SIMULATED_SUCCESS` and timestamp.
6. Build `DonationReceiptResponse(simulated=true)` with message that no payment occurred.
7. Return receipt → success final.

## Fork/join and absent flows

No code path in these scenarios launches parallel work, so do not draw fork/join bars. The search queries are multiple repository calls but they execute sequentially. No payment authorization, notification, email, or external WDI download activity exists.
