package com.globalhealthexplorer.editorial.glossary.service;

import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.catalogue.repository.TopicRepository;
import com.globalhealthexplorer.common.ResourceNotFoundException;
import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import com.globalhealthexplorer.editorial.article.model.Article;
import com.globalhealthexplorer.editorial.article.repository.ArticleRepository;
import com.globalhealthexplorer.editorial.glossary.api.GlossaryRequest;
import com.globalhealthexplorer.editorial.glossary.api.GlossaryResponse;
import com.globalhealthexplorer.editorial.glossary.model.GlossaryReference;
import com.globalhealthexplorer.editorial.glossary.model.GlossaryTerm;
import com.globalhealthexplorer.editorial.glossary.repository.GlossaryTermRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Glossary use cases, including searchable reads and validated links to editorial catalogue content. */
@Service
@Transactional(readOnly = true)
public class GlossaryService {

	private final GlossaryTermRepository termRepository;
	private final ArticleRepository articleRepository;
	private final TopicRepository topicRepository;
	private final IndicatorRepository indicatorRepository;

	public GlossaryService(GlossaryTermRepository termRepository, ArticleRepository articleRepository,
			TopicRepository topicRepository, IndicatorRepository indicatorRepository) {
		this.termRepository = termRepository;
		this.articleRepository = articleRepository;
		this.topicRepository = topicRepository;
		this.indicatorRepository = indicatorRepository;
	}

	public EditorialPageResponse<GlossaryResponse> searchPublic(String query, int page, int size) {
		validatePage(page, size);
		String keyword = clean(query);
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "term").and(Sort.by("id")));
		Page<GlossaryTerm> results = keyword == null
				? termRepository.findAllByOrderByTermAsc(pageRequest)
				: termRepository.search(keyword, pageRequest);
		return toPage(results, true);
	}

	public GlossaryResponse getPublic(String slug) {
		return toResponse(findTerm(slug), true);
	}

	public EditorialPageResponse<GlossaryResponse> listAdmin(String query, int page, int size) {
		validatePage(page, size);
		String keyword = clean(query);
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "term").and(Sort.by("id")));
		Page<GlossaryTerm> results = keyword == null
				? termRepository.findAllByOrderByTermAsc(pageRequest)
				: termRepository.search(keyword, pageRequest);
		return toPage(results, false);
	}

	public GlossaryResponse getAdmin(String slug) { return toResponse(findTerm(slug), false); }

	@Transactional
	public GlossaryResponse create(GlossaryRequest request) {
		if (termRepository.existsBySlug(request.slug())) throw new IllegalArgumentException("A glossary term with this slug already exists.");
		Instant now = Instant.now();
		GlossaryTerm term = termRepository.saveAndFlush(new GlossaryTerm(request.term().trim(), request.slug(),
				request.definition().trim(), clean(request.extendedExplanation()), now));
		applyRelationships(term, request);
		return toResponse(termRepository.save(term), false);
	}

	@Transactional
	public GlossaryResponse update(String slug, GlossaryRequest request) {
		GlossaryTerm term = findTerm(slug);
		if (!term.getSlug().equals(request.slug()) && termRepository.existsBySlug(request.slug())) {
			throw new IllegalArgumentException("A glossary term with this slug already exists.");
		}
		term.update(request.term().trim(), request.slug(), request.definition().trim(),
				clean(request.extendedExplanation()), Instant.now());
		applyRelationships(term, request);
		return toResponse(termRepository.save(term), false);
	}

	@Transactional
	public void delete(String slug) {
		GlossaryTerm term = findTerm(slug);
		// Remove both outgoing and incoming glossary links before deleting the entity.
		for (GlossaryTerm other : termRepository.findAll()) other.getRelatedTerms().remove(term);
		term.getRelatedTerms().clear();
		termRepository.flush();
		termRepository.delete(term);
	}

	private void applyRelationships(GlossaryTerm term, GlossaryRequest request) {
		term.replaceReferences(resolveReferences(term, request.references()));
		term.getRelatedTerms().clear();
		for (String slug : strings(request.relatedTermSlugs())) {
			GlossaryTerm related = termRepository.findBySlug(slug)
					.orElseThrow(() -> new ResourceNotFoundException("Related glossary term", slug));
			if (related.getId().equals(term.getId())) throw new IllegalArgumentException("A glossary term cannot be related to itself.");
			term.getRelatedTerms().add(related);
		}
		term.getArticles().clear();
		for (String slug : strings(request.relatedArticleSlugs())) {
			Article article = articleRepository.findBySlug(slug)
					.orElseThrow(() -> new ResourceNotFoundException("Related article", slug));
			term.getArticles().add(article);
		}
		term.getTopics().clear();
		for (String slug : strings(request.relatedTopicSlugs())) {
			String canonicalSlug = "child-mortality".equals(slug) ? "child-infant-mortality" : slug;
			term.getTopics().add(topicRepository.findBySlugAndActiveTrue(canonicalSlug)
					.orElseThrow(() -> new ResourceNotFoundException("Active topic", slug)));
		}
		term.getIndicators().clear();
		for (String slug : strings(request.relatedIndicatorIds())) {
			term.getIndicators().add(indicatorRepository.findActiveBySlugWithTopic(slug)
					.orElseThrow(() -> new ResourceNotFoundException("Active indicator", slug)));
		}
	}

	private List<GlossaryReference> resolveReferences(GlossaryTerm term, List<GlossaryRequest.ReferenceInput> inputs) {
		List<GlossaryReference> references = new ArrayList<>();
		for (GlossaryRequest.ReferenceInput input : inputs == null ? List.<GlossaryRequest.ReferenceInput>of() : inputs) {
			references.add(new GlossaryReference(term, references.size(), input.label().trim(), validateUrl(input.url())));
		}
		return references;
	}

	private GlossaryTerm findTerm(String slug) {
		return termRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException("Glossary term", slug));
	}

	private EditorialPageResponse<GlossaryResponse> toPage(Page<GlossaryTerm> page, boolean publicView) {
		return new EditorialPageResponse<>(page.getContent().stream().map(term -> toResponse(term, publicView)).toList(),
				page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages(), page.hasNext());
	}

	private GlossaryResponse toResponse(GlossaryTerm term, boolean publicView) {
		return new GlossaryResponse(term.getSlug(), term.getTerm(), term.getSlug(), term.getDefinition(),
				term.getExtendedExplanation(), term.getCreatedAt(), term.getUpdatedAt(),
				term.getTopics().stream().map(Topic::getSlug).sorted().toList(),
				term.getArticles().stream().filter(article -> !publicView || "PUBLISHED".equals(article.getStatus()))
						.map(Article::getSlug).sorted().toList(),
				term.getIndicators().stream().map(Indicator::getSlug).sorted().toList(),
				term.getRelatedTerms().stream().map(GlossaryTerm::getSlug).sorted().toList(),
				term.getReferences().stream().map(reference -> new GlossaryResponse.ReferenceResponse(reference.getLabel(), reference.getUrl())).toList());
	}

	private String validateUrl(String input) {
		String value = input.trim();
		try {
			URI uri = URI.create(value);
			if (uri.getHost() == null || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
				throw new IllegalArgumentException("Reference URL must use HTTP or HTTPS.");
			}
			return value;
		} catch (IllegalArgumentException exception) {
			if (exception.getMessage() != null && exception.getMessage().startsWith("Reference URL ")) throw exception;
			throw new IllegalArgumentException("Reference URL must be a valid HTTP or HTTPS URL.");
		}
	}

	private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
	private List<String> strings(List<String> values) { return values == null ? List.of() : values; }
	private void validatePage(int page, int size) {
		if (page < 0) throw new IllegalArgumentException("page must be zero or greater.");
		if (size < 1 || size > 100) throw new IllegalArgumentException("size must be between 1 and 100.");
	}
}
