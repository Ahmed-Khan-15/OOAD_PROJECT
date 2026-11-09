# Global Health Explorer — database migrations

This package contains the initial PostgreSQL schema and reference catalogue.

## Files

- `V1__create_initial_schema.sql`: creates all application tables, constraints and indexes.
- `V2__seed_reference_catalogue.sql`: inserts the initial 12 countries, 9 topic entries, 48 indicators and source organizations.

The seed migration intentionally inserts **no health statistics**. Real observations must be loaded only after their source, licensing, indicator mapping, units and country coverage have been checked.

## 1. Add Flyway to `pom.xml`

Add this dependency inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

Spring Boot's dependency management supplies compatible versions. Do not add arbitrary version numbers.

## 2. Copy migrations

Copy the `db` folder into:

`backend/src/main/resources/db/migration/`

The final paths should be:

- `backend/src/main/resources/db/migration/V1__create_initial_schema.sql`
- `backend/src/main/resources/db/migration/V2__seed_reference_catalogue.sql`

## 3. Update `application.properties`

Keep your existing datasource URL, username and password configuration. Add:

```properties
spring.flyway.enabled=true
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
```

Do not replace a working database password with a placeholder unless your environment variable is configured.

## 4. Important before first migration

Your current database was created for the connection test. The migrations create the application tables inside it. If you have already created any application tables manually, inspect them first. Do not drop a database containing data you need.

## 5. Run

From the `backend` directory:

```powershell
.\mvnw.cmd spring-boot:run
```

Flyway should report that it validated and applied two migrations. Hibernate then validates the schema.

## Design notes

- A health observation must always belong to a country, indicator and dataset.
- `dimensions` is JSONB so sex, age group, cause and other source dimensions can be represented without adding columns for every possible dimension.
- Duplicate identity includes country, indicator, dataset, year and dimensions. This permits separate source datasets and demographic breakdowns.
- Missing values are represented by no observation row, not by a numeric zero.
- Admin-entered records should be associated with an explicit admin-managed dataset and source, rather than having missing provenance.
- `source_mapping_id` is optional because an admin may enter a standardized record directly; programmatic imports should normally use a mapping.
- Admin passwords are stored as hashes only. No default admin account is inserted.
- The schema uses `ON DELETE RESTRICT` for reference data so records cannot be orphaned. Prefer deactivation over deleting referenced countries, indicators, sources or datasets.
- Import errors retain the raw row as JSONB to help administrators understand rejected records.

## One implementation note

`country_aliases.data_source_id` is a foreign key to `data_sources`. This is created after `data_sources` so the migration order is valid.
