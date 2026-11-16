# Gaps, assumptions, and consistency checks

## 1. Requirements that are absent or not derivable from code

| Requested detail | Finding | Safe treatment in UML |
|---|---|---|
| Strategy pattern | No strategy interface/context/concrete strategy family found in backend. | Do not label `ObservationService` or `SearchService` a Strategy. |
| Observer/Subject/notification | No application event observer, notification publisher, email or SMS sender found. | Do not draw a notification observer or external mail actor. |
| Factory Method / Adapter | No application-defined creator/product or adapter/adaptee pair found. | Spring's object creation and `new CsvDocumentParser()` are not Factory Method/Adapter. |
| Explicit Facade | No facade interface or named facade class. `SearchService` aggregates multiple repositories for one search. | Label it application service/search coordinator; don’t stereotype as GoF Facade unless the instructor accepts a broad intent-based analogy. |
| Payment processor | `DonationService` explicitly stores `SIMULATED_SUCCESS` and returns `simulated=true`; no payment provider/network integration. | Model a simulated pledge; mark real charging as absent. |
| Live World Bank API client | WDI CSV files are uploaded by an administrator; no runtime WDI API client. | WDI is an upstream data source/citation, not a runtime lifeline/actor. |
| Production database observations | User-provided Railway API output showed `totalElements=0`; remote is a separate DB from the locally verified 3,586-row DB. | Deployment diagram must say remote WDI import pending unless reverified after upload. Do not copy local counts into a Railway object snapshot. |
| Production/admin health | Provider dashboard and live logs are outside repository inspection. | Treat user-reported Railway/Vercel status as reported, not code evidence. No service URLs or secret values belong in UML. |
| Vercel exact runtime node | Repository has Vite/TanStack Start/Nitro dependencies and deployment notes, but not `vercel.json` or provider output artifacts. | Mark Vercel/Nitro execution environment as documented target; exact functions/edge layout is provider-config dependent. |
| Admin session persistence | `SecurityConfiguration` uses `HttpSessionSecurityContextRepository`; no JDBC Spring Session configuration is present. | Do not connect `AdminUser` to a persisted session table. Session management is servlet/container-backed unless provider config adds something outside repo. |
| Class identifiers at runtime | JPA IDs are database-generated or seeded and vary by DB. | Omit numeric IDs in object examples unless you query the exact target DB. |
| External human `Data Provider` actor | Data reaches importer as selected CSV file and no source system API is invoked. | Use CSV as an input artifact. Optional external PostgreSQL actor is technical context, not an initiating human. |

## 2. OOAD observations and suggested improvements

These are limited, evidence-based maintainability notes; most inspected code follows a clear controller/service/repository layering.

| Finding | Code location | Impact / suggested fix |
|---|---|---|
| `CsvImportService` directly constructs package-private parser (`new CsvDocumentParser()`). | `backend/src/main/java/com/globalhealthexplorer/imports/service/CsvImportService.java:61` | Couples orchestration to a concrete parser and makes substitution harder. If parser behavior needs independent tests or alternate formats, introduce a small parser interface/constructor injection; no redesign is needed for the current single CSV format. |
| `SearchService` coordinates seven repository interfaces. | `backend/src/main/java/com/globalhealthexplorer/search/service/SearchService.java:35-41` | Broad dependency set is a conscious unified-search cross-cutting use case. If categories grow, separate query collaborators behind small interfaces; avoid splitting it prematurely. |
| CSV import is a large orchestration/validation method with parsing, row mapping, error recording, duplicate handling, and batch completion. | `backend/src/main/java/com/globalhealthexplorer/imports/service/CsvImportService.java:83-173` | The responsibility breadth can make change risky. If future formats/rules are added, extract row validation and batch-result accumulation into testable collaborators while preserving importer transaction semantics. |
| `DatasetService` creates internal `ResolvedMapping` value records and manages mapping identity/protection in the same service. | `backend/src/main/java/com/globalhealthexplorer/dataset/service/DatasetService.java` (`validateMappings`, `updateMappings`) | Current scope is coherent for dataset registration; no violation found. Consider a separate mapping policy only if mapping rules expand. |
| Donation amount uses `BigDecimal` and request DTO limits, but donation is explicitly simulated. | `backend/src/main/java/com/globalhealthexplorer/donation/service/DonationService.java:26-48`; `donation/api/DonationRequest.java` | Not an OOAD defect; the important product gap is no actual payment provider. Keep diagrams and demo labels explicit that money is not collected. |
| No observed public fields, manual service singletons, direct service-to-controller dependency, or domain-to-UI import. | Source inspection across `backend/src/main/java` | No issue to report; constructor injection and package layering are used. |

## 3. UML names and cross-diagram consistency

- Use `ObservationController.search(...)`, `ObservationService.search(...)`, and `HealthObservationRepository.search(...)` for S1; do not call the controller method `getObservations`.
- Search is `SearchController.search(q)` → `SearchService.search(rawQuery)`; category repository methods in the service run sequentially.
- Dataset creation is `AdminDatasetController.createDataset` → `DatasetService.createDataset`; CSV upload is separately `AdminDatasetController.importCsv` → `CsvImportService.importCsv`.
- Import multipart part is named `file`; actor email comes from `Principal.getName()`; import history is `CsvImportService.getImports`.
- `CsvDocumentParser.parse(String)` is package-private; `CsvImportService` is the caller. Avoid drawing parser as public REST or persistence component.
- Admin credentials are handled by `AdminAuthController.login` → `AdminAuthenticationService.authenticate`; Spring calls `AdminUserDetailsService.loadUserByUsername` and `AdminUserRepository.findByEmailIgnoreCase`.
- Logout is a Spring Security filter configured at `POST /api/v1/admin/auth/logout`; there is no project controller method named `logout`.
- Public article detail is `PublicArticleController.get` → `ArticleService.getPublic`; admin deletion calls `ArticleService.deleteOrArchive` and archives rather than hard-deleting.
- Public glossary detail/search is `PublicGlossaryController.get/search` → `GlossaryService.getPublic/searchPublic`; admin deletion is `GlossaryService.delete`.
- Donation endpoint saves a pledge with `SIMULATED_SUCCESS`; there is no processor lifeline or payment-result failure branch.
- Object snapshot O1 is local verified example data. A remote Railway deployment snapshot is different until WDI rows are imported and its endpoint count is checked.

## 4. Diagram coverage / GAPS for the Modelio author

- Six Sequence/Activity scenarios are used consistently: S1 observations, S2 search, S3 login, S4 dataset/CSV import, S5 article publication/read, S6 simulated donation.
- Communication diagrams reuse S1, S3, and S4, matching the sequence method names.
- Class diagrams are split by package and stay at a focused level; Spring Data inherited CRUD methods and simple getters are intentionally not expanded.
- Database is shown as an external deployment store. It is not a real human user actor.
- There are no true parallel forks in the selected flows; search calls are sequential in source order.
