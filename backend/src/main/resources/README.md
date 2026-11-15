# Global Health Explorer backend

This Spring Boot 4 application uses Java 21, PostgreSQL, Spring Data JPA, and Flyway.
Flyway migrations remain in `db/migration`; Hibernate is configured to validate their schema.

## Configuration

Set these environment variables for a local database when the defaults do not apply:

- `DB_URL` (default `jdbc:postgresql://localhost:5432/global_health_explorer`)
- `DB_USERNAME` (default `postgres`)
- `DB_PASSWORD` (no default password)
- `SESSION_COOKIE_SECURE` (defaults to `true`; set `false` only for local HTTP if your browser does not accept Secure cookies on localhost)
- `SESSION_COOKIE_SAME_SITE` (defaults to `lax`; use `None` only with HTTPS when the deployed frontend and API are cross-site)
- `APP_CORS_ALLOWED_ORIGINS` (defaults to the Vite development origins on port 8080)

The backend listens on port 8081. Do not put database passwords in committed files.

## First administrator

There is no public registration route and no seeded demo administrator. For a one-time
bootstrap, set `BOOTSTRAP_ADMIN_ENABLED=true`, `BOOTSTRAP_ADMIN_EMAIL`,
`BOOTSTRAP_ADMIN_DISPLAY_NAME`, and `BOOTSTRAP_ADMIN_PASSWORD` (at least 12 characters),
then start the application once. Bootstrap fails if any administrator row already exists.
Unset `BOOTSTRAP_ADMIN_ENABLED` immediately after the account is created. The stored
password is BCrypt hashed.

## Run and verify

From this directory:

```powershell
./mvnw.cmd spring-boot:run
```

The application applies Flyway migrations V1 through V5, then Hibernate validates the
resulting schema. V5 adds WDI provenance descriptions and published editorial content when
the referenced catalogue is present; it does not alter imported observations. The application
serves public catalogue reads under
`/api/v1`, and protects `/api/v1/admin/**` with session authentication and CSRF.
Fetch `/api/v1/admin/auth/csrf` before login or logout, keep the returned token in memory,
send it in the named request header, and include credentials so the session cookie is sent.
The login response establishes the HttpOnly session cookie.

## Datasets, imports, and observations

Administrators can manage datasets and indicator mappings at:

- `GET /api/v1/admin/datasets` and `GET /api/v1/admin/datasets/{slug}`
- `POST /api/v1/admin/datasets` and `PUT /api/v1/admin/datasets/{slug}`
- `POST /api/v1/admin/datasets/{slug}/imports` (multipart field `file`)
- `GET /api/v1/admin/datasets/{slug}/imports`

Public read-only routes are `GET /api/v1/datasets`, `/api/v1/datasets/{slug}`,
`/api/v1/sources`, and `/api/v1/sources/{slug}`. Observations are available from
`GET /api/v1/observations` with optional `country` (ISO-3), `indicator` (slug),
`dataset` (slug), `fromYear`, and `toYear` filters. Pagination uses `page` and `size`
(maximum 100); `sortBy` accepts `year` or `value`, and `direction` accepts `ASC` or `DESC`.

The import format is UTF-8 CSV with these required columns:
`country_iso3,indicator,year,value,unit`. The indicator value must be the indicator slug
or the source code configured in that dataset's mapping. Optional columns are
`dimensions` (a JSON object of scalar values), `value_status` (`REPORTED`, `ESTIMATED`,
`MODELLED`, or `PROJECTED`), `uncertainty_lower`, `uncertainty_upper`, and `notes`.
The row unit must exactly match both the source mapping unit and canonical indicator unit;
automatic conversion is deliberately unsupported, so incompatible mappings produce row
errors. Zero is accepted as a numeric observation. Rejected and duplicate rows are included
in the persisted batch report; no synthetic teaching observations are imported.

Example:

```csv
country_iso3,indicator,year,value,unit,dimensions,value_status,uncertainty_lower,uncertainty_upper,notes
PAK,U5MR,2020,45.2,"deaths per 1,000 live births",{},REPORTED,44.1,46.3,Dataset citation applies
```

## Integration test database

Tests activate the `test` profile and always use the separate
`global_health_explorer_test` database. Create that database once in PostgreSQL before
running tests, and configure `TEST_DB_USERNAME` and `TEST_DB_PASSWORD` if needed. The test
profile runs Flyway and keeps Hibernate at `ddl-auto=validate`; it does not use `DB_URL` or
connect to `global_health_explorer`.

```powershell
$env:TEST_DB_USERNAME = 'postgres'
$env:TEST_DB_PASSWORD = '<your local PostgreSQL password>'
./mvnw.cmd test
```

## Articles and glossary

Migration V3 creates editorial categories, articles, tags, ordered citations, and relational
links to topics, countries, indicators, related articles, glossary terms, and glossary
references. It seeds the four editorial categories. Migration V5 adds three source-linked
published WDI explainers and eight linked glossary entries. V1–V4 remain unchanged.

Public routes are `GET /api/v1/articles` and `/api/v1/articles/{slug}`. The listing accepts
`category` (category slug), `tag` (normalized tag slug), `page`, and `size` (maximum 100).
Only published articles appear publicly. Glossary routes are `GET /api/v1/glossary` and
`/api/v1/glossary/{slug}`; `q` searches term names, definitions, and extended explanations,
with the same pagination parameters.

Administrators use `GET/POST /api/v1/admin/articles`, `GET/PUT/DELETE
/api/v1/admin/articles/{slug}`, and the equivalent `GET/POST`, `GET/PUT/DELETE` routes under
`/api/v1/admin/glossary`. Admin detail endpoints provide draft preview. Article status is
`DRAFT`, `PUBLISHED`, or `ARCHIVED`; publishing requires article content and a reading time.
Unpublishing sets `DRAFT`. Deleting an article archives it so editorial history and links
remain intact. Glossary deletion removes that glossary entry and its join-table links.
Mutating admin requests require the authenticated session and CSRF token.

Article and glossary writes accept stable catalogue slugs (country ISO-3 codes for country
links). References are separate ordered records and must use HTTP or HTTPS URLs. Related
articles, topics, indicators, glossary terms, tags, references, and category slugs are
provided through the request DTOs; unknown related catalogue identifiers return 404.

## Simulated donations and unified search

Migration V4 adds the donations table and reporting indexes. It does not store payment-card
data. `POST /api/v1/donations` accepts donor name, email, amount in USD, `ONCE` or `MONTHLY`
frequency, and an anonymous display preference. It returns a generated reference and a
demonstration-only receipt; monthly contributions are non-billing commitments. Extra request
fields are rejected, including card number, CVV, expiry, or cardholder details. The public
receipt does not include donor name or email.

Administrator-only routes are `GET /api/v1/admin/donations`,
`GET /api/v1/admin/donations/{reference}`, and `GET /api/v1/admin/donations/summary`. They
require the existing administrator session. The paginated list and detail response include
donor contact information; the summary reports simulated totals, counts, frequency and
status.

`GET /api/v1/search?q={query}` groups results under `countries`, `topics`, `indicators`,
`articles`, `glossary`, `datasets`, and `sources`. It searches active catalogue entries,
published articles, glossary terms, and active datasets/sources, returning at most 8 results
per category with frontend navigation paths. Empty and one-character queries return empty
groups; longer queries must be at most 100 characters. Result descriptions are capped at 240
characters.

## Deployment configuration

No deployment service or credentials are configured in this repository. Before deploying,
provide a managed PostgreSQL database and configure `DB_URL`, `DB_USERNAME`, and
`DB_PASSWORD` in the hosting service's secret manager. Set `APP_CORS_ALLOWED_ORIGINS` to the
exact HTTPS frontend origin, keep `SESSION_COOKIE_SECURE=true`, and use HTTPS for both
frontend and API. If they are cross-site (rather than same-site subdomains), set
`SESSION_COOKIE_SAME_SITE=None` and verify the browser's credentialed cookie behavior.
Never commit production secrets. Create the first administrator through the one-time
bootstrap settings, then disable bootstrap immediately. The frontend production build is
generated by `npm run build`; set `VITE_API_BASE_URL` to the deployed API origin when it is
not served from the same origin. No deployment URL can be reported until a hosting target
is configured and deployed.
