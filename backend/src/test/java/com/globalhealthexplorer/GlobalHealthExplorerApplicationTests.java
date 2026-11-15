package com.globalhealthexplorer;

import com.globalhealthexplorer.security.AdminUser;
import com.globalhealthexplorer.security.AdminUserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.mock.web.MockMultipartFile;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.sql.Timestamp;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GlobalHealthExplorerApplicationTests {

	private static final String TEST_PASSWORD = "Test-Admin-Password-123";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AdminUserRepository adminUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private Environment environment;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	void corsAllowsCredentialedAdminEditsFromConfiguredFrontend() throws Exception {
		MvcResult result = mockMvc.perform(options("/api/v1/admin/articles/example")
					.header("Origin", "http://localhost:8080")
					.header("Access-Control-Request-Method", "PUT")
					.header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
				.andExpect(status().isOk())
				.andReturn();

		assertThat(result.getResponse().getHeader("Access-Control-Allow-Origin"))
				.isEqualTo("http://localhost:8080");
		assertThat(result.getResponse().getHeader("Access-Control-Allow-Credentials"))
				.isEqualTo("true");
		assertThat(result.getResponse().getHeader("Access-Control-Allow-Methods"))
				.contains("PUT");
	}

	@Test
	void publicCatalogueEndpointsReturnDatabaseCatalogue() throws Exception {
		mockMvc.perform(get("/api/v1/countries"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").isNotEmpty())
				.andExpect(jsonPath("$.length()").value(12));

		mockMvc.perform(get("/api/v1/countries/PAK"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value("PAK"))
				.andExpect(jsonPath("$.iso2").value("PK"));

		mockMvc.perform(get("/api/v1/countries/pakistan"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value("PAK"));

		mockMvc.perform(get("/api/v1/topics"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(9));

		mockMvc.perform(get("/api/v1/topics/child-mortality"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value("child-infant-mortality"))
				.andExpect(jsonPath("$.indicatorIds[0]").isNotEmpty());

		mockMvc.perform(get("/api/v1/indicators"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(48))
				.andExpect(jsonPath("$[0].observationsAvailable").value(false));

		mockMvc.perform(get("/api/v1/indicators/under-five-mortality-rate"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value("under-five-mortality-rate"))
				.andExpect(jsonPath("$.preferredDirection").value("NEUTRAL"))
				.andExpect(jsonPath("$.observationsAvailable").value(false));
	}

	@Test
	void unknownCatalogueIdentifiersReturnNotFound() throws Exception {
		mockMvc.perform(get("/api/v1/countries/ZZZ"))
				.andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/topics/not-a-topic"))
				.andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/indicators/not-an-indicator"))
				.andExpect(status().isNotFound());
	}

	@Test
	void administratorCanLogInReadSessionAndLogOut() throws Exception {
		assertThat(environment.getProperty("server.servlet.session.cookie.http-only", Boolean.class))
				.isTrue();
		assertThat(environment.getProperty("server.servlet.session.cookie.secure", Boolean.class))
				.isTrue();
		MvcResult csrfResult = mockMvc.perform(get("/api/v1/admin/auth/csrf"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").isNotEmpty())
				.andReturn();
		MockHttpSession csrfSession = (MockHttpSession) csrfResult.getRequest().getSession(false);
		String csrfToken = objectMapper.readTree(csrfResult.getResponse().getContentAsString())
				.get("token").asText();
		assertThat(csrfSession).isNotNull();

		AdminUser user = createAdmin(true);
		try {
			MvcResult loginResult = mockMvc.perform(post("/api/v1/admin/auth/login")
					.session(csrfSession)
					.header("X-CSRF-TOKEN", csrfToken)
					.contentType(MediaType.APPLICATION_JSON)
					.content(loginJson(user.getEmail(), TEST_PASSWORD)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value(user.getEmail()))
				.andReturn();

			MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
			assertThat(session).isNotNull();

			mockMvc.perform(get("/api/v1/admin/auth/me").session(session))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.displayName").value("Test Administrator"));

			Timestamp lastLogin = jdbcTemplate.queryForObject(
					"select last_login_at from admin_users where id = ?", Timestamp.class, user.getId());
			assertThat(lastLogin).isNotNull();

			mockMvc.perform(post("/api/v1/admin/auth/logout")
					.header("X-CSRF-TOKEN", csrfToken)
					.session(session))
					.andExpect(status().isNoContent());
			mockMvc.perform(get("/api/v1/admin/auth/me").session(session))
					.andExpect(status().isUnauthorized());
		} finally {
			adminUserRepository.deleteById(user.getId());
		}
	}

	@Test
	void invalidCredentialsAndInactiveAccountsAreRejected() throws Exception {
		mockMvc.perform(post("/api/v1/admin/auth/login")
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(loginJson("missing@example.test", TEST_PASSWORD)))
				.andExpect(status().isUnauthorized());

		AdminUser inactiveUser = createAdmin(false);
		try {
			mockMvc.perform(post("/api/v1/admin/auth/login")
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson(inactiveUser.getEmail(), TEST_PASSWORD)))
					.andExpect(status().isUnauthorized());
		} finally {
			adminUserRepository.deleteById(inactiveUser.getId());
		}
	}

	@Test
	void loginRequestValidationReturnsBadRequest() throws Exception {
		mockMvc.perform(post("/api/v1/admin/auth/login")
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}

	@Test
	void administrativeSessionEndpointRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/v1/admin/auth/me"))
				.andExpect(status().isUnauthorized());
}

	@Test
	void datasetManagementValidatesMappingsAndKeepsAdminRoutesProtected() throws Exception {
		mockMvc.perform(get("/api/v1/admin/datasets"))
				.andExpect(status().isUnauthorized());

		String slug = "test-dataset-" + UUID.randomUUID();
		mockMvc.perform(post("/api/v1/admin/datasets")
					.with(user("catalogue-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "unknown-indicator", "deaths per 1,000 live births")))
				.andExpect(status().isNotFound());

		mockMvc.perform(post("/api/v1/admin/datasets")
					.with(user("catalogue-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "under-five-mortality-rate", "")))
				.andExpect(status().isBadRequest());

		mockMvc.perform(post("/api/v1/admin/datasets")
					.with(user("catalogue-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "under-five-mortality-rate", "deaths per 1,000 live births")))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(slug))
				.andExpect(jsonPath("$.indicators[0].indicatorId").value("under-five-mortality-rate"));

		mockMvc.perform(get("/api/v1/datasets/{slug}", slug))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Test dataset"));

		mockMvc.perform(put("/api/v1/admin/datasets/{slug}", slug)
					.with(user("catalogue-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "under-five-mortality-rate", "deaths per 1,000 live births")
							.replace("Test dataset", "Updated test dataset")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Updated test dataset"));

		mockMvc.perform(get("/api/v1/admin/datasets/{slug}", slug))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void csvImportStoresZeroAndCountsDuplicateRows() throws Exception {
		String slug = createDataset("deaths per 1,000 live births");
		String csv = "country_iso3,indicator,year,value,unit,dimensions,value_status,uncertainty_lower,uncertainty_upper,notes\n"
				+ "PAK,U5MR,2020,0,\"deaths per 1,000 live births\",,REPORTED,,,A reported zero\n"
				+ "PAK,U5MR,2020,0,\"deaths per 1,000 live births\",,REPORTED,,,Repeated row\n";
		MockMultipartFile file = new MockMultipartFile("file", "observations.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

		mockMvc.perform(multipart("/api/v1/admin/datasets/{slug}/imports", slug)
					.file(file)
					.with(user("import-admin@example.test").roles("ADMIN"))
					.with(csrf()))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("COMPLETED_WITH_ERRORS"))
				.andExpect(jsonPath("$.totalRows").value(2))
				.andExpect(jsonPath("$.acceptedRows").value(1))
				.andExpect(jsonPath("$.duplicateRows").value(1))
				.andExpect(jsonPath("$.errors[0].code").value("DUPLICATE_OBSERVATION"));

		mockMvc.perform(get("/api/v1/observations")
					.param("country", "PAK")
					.param("indicator", "under-five-mortality-rate")
					.param("dataset", slug))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(1))
				.andExpect(jsonPath("$.content[0].value").value(0))
				.andExpect(jsonPath("$.content[0].country.id").value("PAK"))
				.andExpect(jsonPath("$.content[0].indicator.unit").value("deaths per 1,000 live births"));

		mockMvc.perform(get("/api/v1/observations").param("country", "IND"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(0))
				.andExpect(jsonPath("$.content").isEmpty());

		mockMvc.perform(put("/api/v1/admin/datasets/{slug}", slug)
					.with(user("import-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "under-five-mortality-rate", "deaths per 1,000 live births")
							.replace("U5MR", "CHANGED-CODE")))
				.andExpect(status().isBadRequest());
	}

	@Test
	void csvImportRejectsUnmappedRowsAndPersistsUsefulErrors() throws Exception {
		String slug = createDataset("deaths per 1,000 live births");
		String csv = "country_iso3,indicator,year,value,unit\n"
				+ "PAK,UNMAPPED_CODE,2020,20,\"deaths per 1,000 live births\"\n"
				+ "PAK,U5MR,not-a-year,20,\"deaths per 1,000 live births\"\n";
		MockMultipartFile file = new MockMultipartFile("file", "invalid.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));

		mockMvc.perform(multipart("/api/v1/admin/datasets/{slug}/imports", slug)
					.file(file)
					.with(user("import-admin@example.test").roles("ADMIN"))
					.with(csrf()))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("COMPLETED_WITH_ERRORS"))
				.andExpect(jsonPath("$.acceptedRows").value(0))
				.andExpect(jsonPath("$.rejectedRows").value(2))
				.andExpect(jsonPath("$.errors.length()").value(2))
				.andExpect(jsonPath("$.errors[0].rawRow.country_iso3").value("PAK"));

		mockMvc.perform(get("/api/v1/admin/datasets/{slug}/imports", slug)
					.with(user("import-admin@example.test").roles("ADMIN")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].rejectedRows").value(2));
	}

	@Test
	void observationFiltersAndPagingAreValidated() throws Exception {
		mockMvc.perform(get("/api/v1/observations").param("fromYear", "2030").param("toYear", "2020"))
				.andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/v1/observations").param("sortBy", "id"))
				.andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/v1/observations").param("size", "101"))
				.andExpect(status().isBadRequest());
		mockMvc.perform(get("/api/v1/sources"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(8));
	}

	@Test
	void donationsAreSimulatedPrivateAndAdminReportable() throws Exception {
		String invalid = "{\"donorName\":\"Test Donor\",\"email\":\"bad-email\",\"amount\":0,"
				+ "\"frequency\":\"once\",\"anonymous\":false}";
		mockMvc.perform(post("/api/v1/donations").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(invalid))
				.andExpect(status().isBadRequest());

		String cardData = "{\"donorName\":\"Test Donor\",\"email\":\"donor@example.test\",\"amount\":25,"
				+ "\"frequency\":\"once\",\"anonymous\":false,\"cardNumber\":\"4111111111111111\"}";
		mockMvc.perform(post("/api/v1/donations").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(cardData))
				.andExpect(status().isBadRequest());

		String oneTime = "{\"donorName\":\"Private Donor\",\"email\":\"donor@example.test\",\"amount\":25,"
				+ "\"frequency\":\"once\",\"anonymous\":true}";
		String monthly = "{\"donorName\":\"Another Donor\",\"email\":\"other@example.test\",\"amount\":15,"
				+ "\"frequency\":\"monthly\",\"anonymous\":false}";
		MvcResult first = mockMvc.perform(post("/api/v1/donations").with(csrf())
					.contentType(MediaType.APPLICATION_JSON).content(oneTime))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.simulated").value(true))
			.andExpect(jsonPath("$.status").value("SIMULATED_SUCCESS"))
			.andExpect(jsonPath("$.receiptMessage").value("Simulated demonstration only. No payment was processed and no money was charged."))
			.andExpect(jsonPath("$.email").doesNotExist())
			.andReturn();
		mockMvc.perform(post("/api/v1/donations").with(csrf())
					.contentType(MediaType.APPLICATION_JSON).content(monthly))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.receiptMessage").value("Simulated demonstration only. No payment was processed; monthly support is a non-billing commitment."));

		String reference = objectMapper.readTree(first.getResponse().getContentAsString()).get("reference").asText();
		assertThat(reference).isNotBlank();
		mockMvc.perform(get("/api/v1/admin/donations")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/v1/admin/donations/summary")
					.with(user("donation-admin@example.test").roles("ADMIN")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.donationCount").value(2))
			.andExpect(jsonPath("$.simulatedTotal").value(40))
			.andExpect(jsonPath("$.oneTimeCount").value(1))
			.andExpect(jsonPath("$.monthlyCommitmentCount").value(1));
		mockMvc.perform(get("/api/v1/admin/donations/{reference}", reference)
					.with(user("donation-admin@example.test").roles("ADMIN")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.email").value("donor@example.test"))
			.andExpect(jsonPath("$.anonymous").value(true));
		String secondReference = objectMapper.readTree(mockMvc.perform(get("/api/v1/admin/donations")
					.with(user("donation-admin@example.test").roles("ADMIN")))
			.andReturn().getResponse().getContentAsString()).get("content").get(0).get("reference").asText();
		assertThat(secondReference).isNotEqualTo(reference);
	}

	@Test
	void unifiedSearchReturnsNavigableCategoriesAndExcludesUnpublishedArticles() throws Exception {
		String slug = "search-published-" + UUID.randomUUID();
		String query = "evidence needle";
		mockMvc.perform(post("/api/v1/admin/articles").with(user("search-admin@example.test").roles("ADMIN"))
					.with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(articleJson(slug, "PUBLISHED").replace("How to interpret a measure", "Evidence needle article")))
			.andExpect(status().isCreated());
		mockMvc.perform(post("/api/v1/admin/articles").with(user("search-admin@example.test").roles("ADMIN"))
					.with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(articleJson("search-draft-" + UUID.randomUUID(), "DRAFT")
							.replace("How to interpret a measure", "Evidence needle draft")))
			.andExpect(status().isCreated());
		mockMvc.perform(post("/api/v1/admin/glossary").with(user("search-admin@example.test").roles("ADMIN"))
					.with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(glossaryJson("evidence-needle-term", "Evidence needle term", "Definition for search.", "[]", "[]")))
			.andExpect(status().isCreated());
		String datasetSlug = "search-dataset-" + UUID.randomUUID();
		mockMvc.perform(post("/api/v1/admin/datasets").with(user("search-admin@example.test").roles("ADMIN"))
					.with(csrf()).contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(datasetSlug, "under-five-mortality-rate", "deaths per 1,000 live births")
							.replace("Test dataset", "Evidence needle dataset")))
			.andExpect(status().isCreated());

		mockMvc.perform(get("/api/v1/search").param("q", query))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.articles.length()").value(1))
			.andExpect(jsonPath("$.articles[0].id").value(slug))
			.andExpect(jsonPath("$.articles[0].url").value("/articles/" + slug))
			.andExpect(jsonPath("$.glossary.length()").value(1))
			.andExpect(jsonPath("$.datasets.length()").value(1));
		mockMvc.perform(get("/api/v1/search").param("q", "life expectancy"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.topics.length()").value(org.hamcrest.Matchers.greaterThan(0)))
			.andExpect(jsonPath("$.indicators.length()").value(org.hamcrest.Matchers.greaterThan(0)));
		mockMvc.perform(get("/api/v1/search").param("q", "Pakistan"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.countries[0].id").value("PAK"));
		mockMvc.perform(get("/api/v1/search").param("q", "World Health Organization"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.sources[0].url").value("/sources/world-health-organization"));
		mockMvc.perform(get("/api/v1/search").param("q", " "))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalResults").value(0));
		mockMvc.perform(get("/api/v1/search").param("q", "x"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalResults").value(0));
		mockMvc.perform(get("/api/v1/search").param("q", "x".repeat(101))).andExpect(status().isBadRequest());

		mockMvc.perform(delete("/api/v1/admin/articles/{slug}", slug)
					.with(user("search-admin@example.test").roles("ADMIN")).with(csrf()))
			.andExpect(status().isNoContent());
		mockMvc.perform(get("/api/v1/search").param("q", query))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.articles.length()").value(0));
	}

	@Test
	void articlesSupportDraftPreviewPublishingRelationshipsFiltersAndArchiving() throws Exception {
		String slug = "test-editorial-" + UUID.randomUUID();
		mockMvc.perform(get("/api/v1/admin/articles"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(post("/api/v1/admin/articles")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(articleJson("invalid-" + UUID.randomUUID(), "PUBLISHED")
							.replace("Full article content.", "")))
			.andExpect(status().isBadRequest());
		mockMvc.perform(post("/api/v1/admin/articles")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(articleJson("topic-alias-" + UUID.randomUUID(), "DRAFT")
							.replace("\"topicSlugs\":[\"life-expectancy\"]", "\"topicSlugs\":[\"child-mortality\"]")))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.topicSlugs[0]").value("child-infant-mortality"));

		mockMvc.perform(post("/api/v1/admin/articles")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(articleJson(slug, "DRAFT")))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.status").value("DRAFT"))
			.andExpect(jsonPath("$.category").value("Health Explainers"));

		mockMvc.perform(get("/api/v1/articles/{slug}", slug)).andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/admin/articles/{slug}", slug)
					.with(user("editor@example.test").roles("ADMIN")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("DRAFT"));

		mockMvc.perform(put("/api/v1/admin/articles/{slug}", slug)
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(articleJson(slug, "PUBLISHED")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.publishedAt").isNotEmpty());

		mockMvc.perform(get("/api/v1/articles/{slug}", slug))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.topicSlugs[0]").value("life-expectancy"))
			.andExpect(jsonPath("$.countryIds[0]").value("PAK"))
			.andExpect(jsonPath("$.indicatorIds[0]").value("life-expectancy-birth-total"))
			.andExpect(jsonPath("$.references[0].label").value("WHO reference"));

		mockMvc.perform(get("/api/v1/articles").param("category", "health-explainers").param("tag", "measurement").param("size", "1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalElements").value(1))
			.andExpect(jsonPath("$.size").value(1));

		mockMvc.perform(delete("/api/v1/admin/articles/{slug}", slug)
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf()))
			.andExpect(status().isNoContent());
		mockMvc.perform(get("/api/v1/articles/{slug}", slug)).andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/admin/articles/{slug}", slug)
					.with(user("editor@example.test").roles("ADMIN")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("ARCHIVED"));
	}

	@Test
	void glossarySupportsSearchRelationshipsUpdateAndDeletion() throws Exception {
		String articleSlug = "glossary-related-" + UUID.randomUUID();
		mockMvc.perform(post("/api/v1/admin/articles")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(articleJson(articleSlug, "PUBLISHED")))
			.andExpect(status().isCreated());

		mockMvc.perform(post("/api/v1/admin/glossary")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(glossaryJson("data-literacy", "Data literacy", "Clear definition.", "[]", "[]")))
			.andExpect(status().isCreated());

		mockMvc.perform(post("/api/v1/admin/glossary")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(glossaryJson("life-expectancy-term", "Life expectancy at birth",
							"A population measure.", "[\"data-literacy\"]", "[\"" + articleSlug + "\"]")))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.relatedTopicSlugs[0]").value("life-expectancy"))
			.andExpect(jsonPath("$.relatedIndicatorIds[0]").value("life-expectancy-birth-total"))
			.andExpect(jsonPath("$.relatedArticleSlugs[0]").value(articleSlug))
			.andExpect(jsonPath("$.references[0].label").value("WHO reference"));

		mockMvc.perform(get("/api/v1/glossary").param("q", "population measure"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.totalElements").value(1))
			.andExpect(jsonPath("$.content[0].slug").value("life-expectancy-term"));
		mockMvc.perform(get("/api/v1/glossary"))
			.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThan(2)))
				.andExpect(jsonPath("$.content[*].slug").value(
						org.hamcrest.Matchers.hasItems("data-literacy", "life-expectancy-term")));
		mockMvc.perform(get("/api/v1/admin/glossary").with(user("editor@example.test").roles("ADMIN")))
			.andExpect(status().isOk())
				.andExpect(jsonPath("$.totalElements").value(org.hamcrest.Matchers.greaterThan(2)));

		mockMvc.perform(put("/api/v1/admin/glossary/{slug}", "life-expectancy-term")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(glossaryJson("life-expectancy-term", "Life expectancy at birth",
							"Updated definition.", "[\"data-literacy\"]", "[\"" + articleSlug + "\"]")))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.definition").value("Updated definition."));

		mockMvc.perform(delete("/api/v1/admin/glossary/{slug}", "data-literacy")
					.with(user("editor@example.test").roles("ADMIN"))
					.with(csrf()))
			.andExpect(status().isNoContent());
		mockMvc.perform(get("/api/v1/glossary/{slug}", "data-literacy")).andExpect(status().isNotFound());
		mockMvc.perform(get("/api/v1/admin/glossary")).andExpect(status().isUnauthorized());
	}

	private String createDataset(String unit) throws Exception {
		String slug = "test-dataset-" + UUID.randomUUID();
		mockMvc.perform(post("/api/v1/admin/datasets")
					.with(user("import-admin@example.test").roles("ADMIN"))
					.with(csrf())
					.contentType(MediaType.APPLICATION_JSON)
					.content(datasetJson(slug, "under-five-mortality-rate", unit)))
				.andExpect(status().isCreated());
		return slug;
	}

	private String datasetJson(String slug, String indicatorSlug, String unit) {
		return "{\"name\":\"Test dataset\",\"slug\":\"" + slug
				+ "\",\"sourceId\":\"world-health-organization\",\"description\":\"Temporary test dataset\","
				+ "\"sourceUrl\":\"https://example.test/data\",\"citation\":\"Test citation\","
				+ "\"licenseName\":\"CC BY 4.0\",\"licenseUrl\":\"https://example.test/license\","
				+ "\"methodology\":\"Test only\",\"frequency\":\"Annual\",\"publishedAt\":\"2025-01-01\","
				+ "\"coverageStartYear\":2000,\"coverageEndYear\":2025,\"active\":true,\"indicators\":[{"
				+ "\"indicatorSlug\":\"" + indicatorSlug + "\",\"originalIndicatorCode\":\"U5MR\","
				+ "\"originalIndicatorName\":\"Under-five mortality rate\",\"originalUnit\":\"" + unit + "\"}]}";
	}

	private String articleJson(String slug, String status) {
		return "{\"title\":\"How to interpret a measure\",\"subtitle\":\"A careful guide\",\"slug\":\"" + slug
				+ "\",\"coverImage\":\"https://example.test/cover.jpg\",\"author\":\"Editorial team\","
				+ "\"categorySlug\":\"health-explainers\",\"introduction\":\"Start with a definition.\","
				+ "\"content\":\"Full article content.\",\"readingMinutes\":4,\"status\":\"" + status
				+ "\",\"tags\":[\"measurement\"],\"references\":[{\"label\":\"WHO reference\","
				+ "\"url\":\"https://www.who.int/\"}],\"topicSlugs\":[\"life-expectancy\"],"
				+ "\"countryIds\":[\"PAK\"],\"indicatorIds\":[\"life-expectancy-birth-total\"],"
				+ "\"relatedArticleSlugs\":[]}";
	}

	private String glossaryJson(String slug, String term, String definition,
			String relatedTerms, String relatedArticles) {
		return "{\"term\":\"" + term + "\",\"slug\":\"" + slug + "\",\"definition\":\"" + definition
				+ "\",\"extendedExplanation\":\"More context\",\"references\":[{\"label\":\"WHO reference\","
				+ "\"url\":\"https://www.who.int/\"}],\"relatedTermSlugs\":" + relatedTerms
				+ ",\"relatedArticleSlugs\":" + relatedArticles
				+ ",\"relatedTopicSlugs\":[\"life-expectancy\"],"
				+ "\"relatedIndicatorIds\":[\"life-expectancy-birth-total\"]}";
	}

	private AdminUser createAdmin(boolean active) {
		String email = "test-" + UUID.randomUUID() + "@example.test";
		AdminUser user = adminUserRepository.saveAndFlush(
				new AdminUser(email, passwordEncoder.encode(TEST_PASSWORD), "Test Administrator"));
		if (!active) {
			jdbcTemplate.update("update admin_users set is_active = false where id = ?", user.getId());
			entityManager.clear();
		}
		return user;
	}

	private String loginJson(String email, String password) {
		return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
	}
}
