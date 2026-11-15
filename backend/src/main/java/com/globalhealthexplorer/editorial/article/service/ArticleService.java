package com.globalhealthexplorer.editorial.article.service;

import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import com.globalhealthexplorer.catalogue.repository.CountryRepository;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.catalogue.repository.TopicRepository;
import com.globalhealthexplorer.common.ResourceNotFoundException;
import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import com.globalhealthexplorer.editorial.article.api.ArticleRequest;
import com.globalhealthexplorer.editorial.article.api.ArticleResponse;
import com.globalhealthexplorer.editorial.article.model.Article;
import com.globalhealthexplorer.editorial.article.model.ArticleCategory;
import com.globalhealthexplorer.editorial.article.model.ArticleReference;
import com.globalhealthexplorer.editorial.article.model.ArticleTag;
import com.globalhealthexplorer.editorial.article.repository.ArticleCategoryRepository;
import com.globalhealthexplorer.editorial.article.repository.ArticleRepository;
import com.globalhealthexplorer.editorial.article.repository.ArticleTagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Article use cases: publishing rules, catalogue links, and API DTO mapping. */
@Service
@Transactional(readOnly = true)
public class ArticleService {

	private static final Set<String> STATUSES = Set.of("DRAFT", "PUBLISHED", "ARCHIVED");
	private final ArticleRepository articleRepository;
	private final ArticleCategoryRepository categoryRepository;
	private final ArticleTagRepository tagRepository;
	private final TopicRepository topicRepository;
	private final CountryRepository countryRepository;
	private final IndicatorRepository indicatorRepository;

	public ArticleService(ArticleRepository articleRepository, ArticleCategoryRepository categoryRepository,
			ArticleTagRepository tagRepository, TopicRepository topicRepository,
			CountryRepository countryRepository, IndicatorRepository indicatorRepository) {
		this.articleRepository = articleRepository;
		this.categoryRepository = categoryRepository;
		this.tagRepository = tagRepository;
		this.topicRepository = topicRepository;
		this.countryRepository = countryRepository;
		this.indicatorRepository = indicatorRepository;
	}

	public EditorialPageResponse<ArticleResponse> listPublic(String categorySlug, String tagSlug, int page, int size) {
		validatePage(page, size);
		String category = optionalFilter(categorySlug);
		String tag = optionalFilter(tagSlug);
		if (category != null) categoryRepository.findBySlug(category)
				.orElseThrow(() -> new ResourceNotFoundException("Article category", category));
		Page<Article> results = articleRepository.findPublished(category, tag,
				PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt").and(Sort.by("id"))));
		return toPage(results, true);
	}

	public ArticleResponse getPublic(String slug) {
		return toResponse(articleRepository.findBySlugAndStatus(slug, "PUBLISHED")
				.orElseThrow(() -> new ResourceNotFoundException("Published article", slug)), true);
	}

	public EditorialPageResponse<ArticleResponse> listAdmin(String categorySlug, String tagSlug, int page, int size) {
		validatePage(page, size);
		String category = optionalFilter(categorySlug);
		String tag = optionalFilter(tagSlug);
		if (category != null) categoryRepository.findBySlug(category)
				.orElseThrow(() -> new ResourceNotFoundException("Article category", category));
		Page<Article> results = articleRepository.findAdminFiltered(category, tag,
				PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt").and(Sort.by("id"))));
		return toPage(results, false);
	}

	public ArticleResponse getAdmin(String slug) {
		return toResponse(findArticle(slug), false);
	}

	@Transactional
	public ArticleResponse create(ArticleRequest request) {
		if (articleRepository.existsBySlug(request.slug())) throw new IllegalArgumentException("An article with this slug already exists.");
		ArticleCategory category = findCategory(request.categorySlug());
		String status = normalizeStatus(request.status());
		validateForPublication(request, status);
		LocalDate publicationDate = publicationDate(request.publishedAt(), status, null);
		Instant now = Instant.now();
		Article article = articleRepository.saveAndFlush(new Article(category, request.title().trim(), clean(request.subtitle()),
				request.slug(), validateUrl(request.coverImage(), "coverImage"), request.author().trim(),
				clean(request.introduction()), clean(request.content()), request.readingMinutes(), status, publicationDate, now));
		applyRelationships(article, request);
		return toResponse(articleRepository.save(article), false);
	}

	@Transactional
	public ArticleResponse update(String slug, ArticleRequest request) {
		Article article = findArticle(slug);
		if (!article.getSlug().equals(request.slug()) && articleRepository.existsBySlug(request.slug())) {
			throw new IllegalArgumentException("An article with this slug already exists.");
		}
		ArticleCategory category = findCategory(request.categorySlug());
		String status = normalizeStatus(request.status());
		validateForPublication(request, status);
		LocalDate publicationDate = publicationDate(request.publishedAt(), status, article.getPublishedAt());
		article.update(category, request.title().trim(), clean(request.subtitle()), request.slug(),
				validateUrl(request.coverImage(), "coverImage"), request.author().trim(), clean(request.introduction()),
				clean(request.content()), request.readingMinutes(), status, publicationDate, Instant.now());
		applyRelationships(article, request);
		return toResponse(articleRepository.save(article), false);
	}

	@Transactional
	public void deleteOrArchive(String slug) {
		Article article = findArticle(slug);
		article.archive(Instant.now());
	}

	private void applyRelationships(Article article, ArticleRequest request) {
		article.getTags().clear();
		for (String tagName : strings(request.tags())) article.getTags().add(resolveTag(tagName));
		article.replaceReferences(resolveReferences(article, request.references()));
		article.getTopics().clear();
		for (String slug : strings(request.topicSlugs())) {
			article.getTopics().add(findTopic(slug));
		}
		article.getCountries().clear();
		for (String iso3 : strings(request.countryIds())) {
			article.getCountries().add(countryRepository.findByIso3IgnoreCaseAndActiveTrue(iso3)
					.orElseThrow(() -> new ResourceNotFoundException("Active country", iso3)));
		}
		article.getIndicators().clear();
		for (String slug : strings(request.indicatorIds())) {
			article.getIndicators().add(indicatorRepository.findActiveBySlugWithTopic(slug)
					.orElseThrow(() -> new ResourceNotFoundException("Active indicator", slug)));
		}
		article.getRelatedArticles().clear();
		for (String relatedSlug : strings(request.relatedArticleSlugs())) {
			Article related = articleRepository.findBySlug(relatedSlug)
					.orElseThrow(() -> new ResourceNotFoundException("Related article", relatedSlug));
			if (article.getId() != null && article.getId().equals(related.getId())) {
				throw new IllegalArgumentException("An article cannot be related to itself.");
			}
			article.getRelatedArticles().add(related);
		}
	}

	private List<ArticleReference> resolveReferences(Article article, List<ArticleRequest.ReferenceInput> inputs) {
		List<ArticleReference> references = new ArrayList<>();
		for (ArticleRequest.ReferenceInput input : inputs == null ? List.<ArticleRequest.ReferenceInput>of() : inputs) {
			references.add(new ArticleReference(article, references.size(), input.label().trim(), validateUrl(input.url(), "reference URL")));
		}
		return references;
	}

	private ArticleTag resolveTag(String tagName) {
		String name = tagName.trim();
		String slug = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
		if (slug.isBlank()) throw new IllegalArgumentException("Tags must contain at least one letter or number.");
		return tagRepository.findBySlug(slug).orElseGet(() -> tagRepository.saveAndFlush(new ArticleTag(slug, name)));
	}

	private ArticleCategory findCategory(String slug) {
		return categoryRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Article category", slug));
	}

	private Topic findTopic(String requestedSlug) {
		String canonicalSlug = "child-mortality".equals(requestedSlug) ? "child-infant-mortality" : requestedSlug;
		return topicRepository.findBySlugAndActiveTrue(canonicalSlug)
				.orElseThrow(() -> new ResourceNotFoundException("Active topic", requestedSlug));
	}

	private Article findArticle(String slug) {
		return articleRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Article", slug));
	}

	private void validateForPublication(ArticleRequest request, String status) {
		if (!"PUBLISHED".equals(status)) return;
		if (request.publishedAt() != null && request.publishedAt().isAfter(LocalDate.now(ZoneOffset.UTC))) {
			throw new IllegalArgumentException("Future-dated articles cannot be published; save them as drafts until publication.");
		}
		if (request.content() == null || request.content().isBlank()) throw new IllegalArgumentException("Published articles require article content.");
		if (request.readingMinutes() == null || request.readingMinutes() < 1 || request.readingMinutes() > 240) {
			throw new IllegalArgumentException("Published articles require a reading time between 1 and 240 minutes.");
		}
	}

	private String normalizeStatus(String status) {
		String normalized = status.trim().toUpperCase(Locale.ROOT);
		if (!STATUSES.contains(normalized)) throw new IllegalArgumentException("Article status must be DRAFT, PUBLISHED, or ARCHIVED.");
		return normalized;
	}

	private LocalDate publicationDate(LocalDate requested, String status, LocalDate previous) {
		if (requested != null) return requested;
		if ("PUBLISHED".equals(status)) return previous == null ? LocalDate.now(ZoneOffset.UTC) : previous;
		return previous;
	}

	private EditorialPageResponse<ArticleResponse> toPage(Page<Article> page, boolean publicView) {
		return new EditorialPageResponse<>(page.getContent().stream().map(article -> toResponse(article, publicView)).toList(),
				page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.hasNext());
	}

	private ArticleResponse toResponse(Article article, boolean publicView) {
		List<String> related = article.getRelatedArticles().stream()
				.filter(item -> !publicView || "PUBLISHED".equals(item.getStatus()))
				.map(Article::getSlug).sorted().toList();
		return new ArticleResponse(article.getSlug(), article.getSlug(), article.getTitle(), article.getSubtitle(),
				article.getAuthorName(), article.getCategory().getName(), article.getCategory().getSlug(),
				article.getTags().stream().map(ArticleTag::getName).sorted(String.CASE_INSENSITIVE_ORDER).toList(),
				article.getPublishedAt(), article.getUpdatedAt(), article.getReadingMinutes(), article.getStatus(),
				article.getCoverImageUrl(), article.getIntroduction(), article.getContent(),
				article.getReferences().stream().map(reference -> new ArticleResponse.ReferenceResponse(reference.getLabel(), reference.getUrl())).toList(),
				article.getTopics().stream().map(Topic::getSlug).sorted().toList(),
				article.getCountries().stream().map(Country::getIso3).sorted().toList(),
				article.getIndicators().stream().map(Indicator::getSlug).sorted().toList(), related);
	}

	private String validateUrl(String input, String field) {
		String value = clean(input);
		if (value == null) return null;
		try {
			URI uri = URI.create(value);
			if (uri.getHost() == null || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
				throw new IllegalArgumentException(field + " must be an HTTP or HTTPS URL.");
			}
			return value;
		} catch (IllegalArgumentException exception) {
			if (exception.getMessage() != null && exception.getMessage().startsWith(field + " ")) throw exception;
			throw new IllegalArgumentException(field + " must be a valid HTTP or HTTPS URL.");
		}
	}

	private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
	private List<String> strings(List<String> values) { return values == null ? List.of() : values; }
	private String optionalFilter(String value) { return value == null || value.isBlank() ? null : value.trim().toLowerCase(Locale.ROOT); }
	private void validatePage(int page, int size) {
		if (page < 0) throw new IllegalArgumentException("page must be zero or greater.");
		if (size < 1 || size > 100) throw new IllegalArgumentException("size must be between 1 and 100.");
	}
}
