package com.globalhealthexplorer.search.service;

import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import com.globalhealthexplorer.catalogue.repository.CountryRepository;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.catalogue.repository.TopicRepository;
import com.globalhealthexplorer.dataset.model.DataSource;
import com.globalhealthexplorer.dataset.model.Dataset;
import com.globalhealthexplorer.dataset.repository.DataSourceRepository;
import com.globalhealthexplorer.dataset.repository.DatasetRepository;
import com.globalhealthexplorer.dataset.service.SlugUtil;
import com.globalhealthexplorer.editorial.article.model.Article;
import com.globalhealthexplorer.editorial.article.repository.ArticleRepository;
import com.globalhealthexplorer.editorial.glossary.model.GlossaryTerm;
import com.globalhealthexplorer.editorial.glossary.repository.GlossaryTermRepository;
import com.globalhealthexplorer.search.api.SearchResponse;
import com.globalhealthexplorer.search.api.SearchResult;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/** Queries each existing public repository and maps results to compact frontend navigation links. */
@Service
@Transactional(readOnly = true)
public class SearchService {

	private static final int MINIMUM_QUERY_LENGTH = 2;
	private static final int PER_CATEGORY_LIMIT = 8;
	private final CountryRepository countryRepository;
	private final TopicRepository topicRepository;
	private final IndicatorRepository indicatorRepository;
	private final ArticleRepository articleRepository;
	private final GlossaryTermRepository glossaryTermRepository;
	private final DatasetRepository datasetRepository;
	private final DataSourceRepository dataSourceRepository;

	public SearchService(CountryRepository countryRepository, TopicRepository topicRepository,
			IndicatorRepository indicatorRepository, ArticleRepository articleRepository,
			GlossaryTermRepository glossaryTermRepository, DatasetRepository datasetRepository,
			DataSourceRepository dataSourceRepository) {
		this.countryRepository = countryRepository;
		this.topicRepository = topicRepository;
		this.indicatorRepository = indicatorRepository;
		this.articleRepository = articleRepository;
		this.glossaryTermRepository = glossaryTermRepository;
		this.datasetRepository = datasetRepository;
		this.dataSourceRepository = dataSourceRepository;
	}

	public SearchResponse search(String rawQuery) {
		String query = rawQuery == null ? "" : rawQuery.trim();
		if (query.length() > 100) throw new IllegalArgumentException("Search queries must be 100 characters or fewer.");
		if (query.chars().anyMatch(Character::isISOControl)) throw new IllegalArgumentException("Search queries cannot contain control characters.");
		if (query.length() < MINIMUM_QUERY_LENGTH) return response(query, List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

		String pattern = "%" + query.toLowerCase(Locale.ROOT) + "%";
		List<SearchResult> countries = countryRepository.searchActive(pattern, page("name")).map(this::country).getContent();
		List<SearchResult> topics = topicRepository.searchActive(pattern, page("name")).map(this::topic).getContent();
		List<SearchResult> indicators = indicatorRepository.searchActive(pattern, page("name")).map(this::indicator).getContent();
		List<SearchResult> articles = articleRepository.searchPublic(pattern, page("title")).map(this::article).getContent();
		List<SearchResult> glossary = glossaryTermRepository.searchPublic(pattern, page("term")).map(this::glossary).getContent();
		List<SearchResult> datasets = datasetRepository.searchPublic(pattern, page("name")).map(this::dataset).getContent();
		List<SearchResult> sources = dataSourceRepository.searchActive(pattern, page("name")).map(this::source).getContent();
		return response(query, countries, topics, indicators, articles, glossary, datasets, sources);
	}

	private PageRequest page(String field) {
		return PageRequest.of(0, PER_CATEGORY_LIMIT, Sort.by(Sort.Direction.ASC, field).and(Sort.by("id")));
	}

	private SearchResult country(Country value) {
		return new SearchResult(value.getIso3(), value.getName(), shortText(value.getRegion()), "/countries/" + value.getIso3());
	}
	private SearchResult topic(Topic value) {
		return new SearchResult(value.getSlug(), value.getName(), shortText(value.getDescription()), "/topics/" + value.getSlug());
	}
	private SearchResult indicator(Indicator value) {
		String description = value.getDescription() == null ? value.getUnit() : value.getDescription() + " · " + value.getUnit();
		return new SearchResult(value.getSlug(), value.getName(), shortText(description), "/topics/" + value.getTopic().getSlug());
	}
	private SearchResult article(Article value) {
		return new SearchResult(value.getSlug(), value.getTitle(), shortText(value.getSubtitle()), "/articles/" + value.getSlug());
	}
	private SearchResult glossary(GlossaryTerm value) {
		return new SearchResult(value.getSlug(), value.getTerm(), shortText(value.getDefinition()), "/glossary#" + value.getSlug());
	}
	private SearchResult dataset(Dataset value) {
		return new SearchResult(value.getSlug(), value.getName(), shortText(value.getDescription()), "/sources");
	}
	private SearchResult source(DataSource value) {
		return new SearchResult(SlugUtil.fromName(value.getName()), value.getName(), shortText(value.getDescription()),
				"/sources/" + SlugUtil.fromName(value.getName()));
	}
	private String shortText(String value) {
		if (value == null || value.isBlank()) return "";
		String text = value.trim();
		return text.length() <= 240 ? text : text.substring(0, 237) + "...";
	}

	private SearchResponse response(String query, List<SearchResult> countries, List<SearchResult> topics,
			List<SearchResult> indicators, List<SearchResult> articles, List<SearchResult> glossary,
			List<SearchResult> datasets, List<SearchResult> sources) {
		int total = countries.size() + topics.size() + indicators.size() + articles.size()
				+ glossary.size() + datasets.size() + sources.size();
		return new SearchResponse(query, MINIMUM_QUERY_LENGTH, PER_CATEGORY_LIMIT, total,
				countries, topics, indicators, articles, glossary, datasets, sources);
	}
}
