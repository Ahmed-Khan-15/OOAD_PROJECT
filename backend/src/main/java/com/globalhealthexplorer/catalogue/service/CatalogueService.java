package com.globalhealthexplorer.catalogue.service;

import com.globalhealthexplorer.catalogue.api.CountryResponse;
import com.globalhealthexplorer.catalogue.api.IndicatorResponse;
import com.globalhealthexplorer.catalogue.api.TopicResponse;
import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import com.globalhealthexplorer.catalogue.repository.CountryRepository;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.catalogue.repository.TopicRepository;
import com.globalhealthexplorer.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CatalogueService {

	private static final Map<String, String> COUNTRY_SLUG_ALIASES = Map.ofEntries(
			Map.entry("australia", "AUS"),
			Map.entry("brazil", "BRA"),
			Map.entry("china", "CHN"),
			Map.entry("germany", "DEU"),
			Map.entry("india", "IND"),
			Map.entry("japan", "JPN"),
			Map.entry("nigeria", "NGA"),
			Map.entry("pakistan", "PAK"),
			Map.entry("saudi-arabia", "SAU"),
			Map.entry("south-africa", "ZAF"),
			Map.entry("united-kingdom", "GBR"),
			Map.entry("united-states", "USA"));

	private final CountryRepository countryRepository;
	private final TopicRepository topicRepository;
	private final IndicatorRepository indicatorRepository;

	public CatalogueService(
			CountryRepository countryRepository,
			TopicRepository topicRepository,
			IndicatorRepository indicatorRepository) {
		this.countryRepository = countryRepository;
		this.topicRepository = topicRepository;
		this.indicatorRepository = indicatorRepository;
	}

	public List<CountryResponse> getCountries() {
		return countryRepository.findAllByActiveTrueOrderByNameAsc().stream()
				.map(this::toCountryResponse)
				.toList();
	}

	public CountryResponse getCountry(String identifier) {
		String iso3 = COUNTRY_SLUG_ALIASES.getOrDefault(identifier.toLowerCase(Locale.ROOT), identifier);
		Country country = countryRepository.findByIso3IgnoreCaseAndActiveTrue(iso3)
				.orElseThrow(() -> new ResourceNotFoundException("Country", identifier));
		return toCountryResponse(country);
	}

	public List<TopicResponse> getTopics() {
		List<Topic> topics = topicRepository.findAllByActiveTrueOrderByDisplayOrderAsc();
		List<Indicator> indicators = indicatorRepository.findAllActiveWithTopic();
		return toTopicResponses(topics, indicators);
	}

	public TopicResponse getTopic(String requestedSlug) {
		String slug = canonicalTopicSlug(requestedSlug);
		Topic topic = topicRepository.findBySlugAndActiveTrue(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Topic", requestedSlug));
		List<Indicator> indicators = indicatorRepository.findActiveByTopicSlugWithTopic(slug);
		return toTopicResponses(List.of(topic), indicators).getFirst();
	}

	public List<IndicatorResponse> getIndicators() {
		List<Indicator> indicators = indicatorRepository.findAllActiveWithTopic();
		Set<String> availableSlugs = indicatorRepository.findSlugsWithActiveObservations();
		return indicators.stream()
				.map(indicator -> toIndicatorResponse(indicator, availableSlugs.contains(indicator.getSlug())))
				.toList();
	}

	public IndicatorResponse getIndicator(String slug) {
		Indicator indicator = indicatorRepository.findActiveBySlugWithTopic(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Indicator", slug));
		Set<String> availableSlugs = indicatorRepository.findSlugsWithActiveObservations();
		return toIndicatorResponse(indicator, availableSlugs.contains(indicator.getSlug()));
	}

	private List<TopicResponse> toTopicResponses(List<Topic> topics, List<Indicator> indicators) {
		Map<Long, List<String>> indicatorSlugsByTopicId = indicators.stream()
				.collect(Collectors.groupingBy(
						indicator -> indicator.getTopic().getId(),
						Collectors.mapping(Indicator::getSlug, Collectors.toList())));

		return topics.stream()
				.map(topic -> new TopicResponse(
						topic.getSlug(), topic.getSlug(), topic.getName(), topic.getDescription(),
						topic.isOverview(), topic.getDisplayOrder(), topic.isActive(),
						indicatorSlugsByTopicId.getOrDefault(topic.getId(), List.of())))
				.toList();
	}

	private CountryResponse toCountryResponse(Country country) {
		return new CountryResponse(country.getIso3(), country.getIso2(), country.getIso3(),
				country.getName(), country.getRegion(), country.isActive());
	}

	private IndicatorResponse toIndicatorResponse(Indicator indicator, boolean observationsAvailable) {
		Topic topic = indicator.getTopic();
		return new IndicatorResponse(
				indicator.getSlug(), indicator.getSlug(), indicator.getName(), indicator.getDescription(),
				indicator.getUnit(), indicator.getPreferredDirection(),
				new IndicatorResponse.TopicReference(topic.getSlug(), topic.getName()),
				indicator.isActive(), observationsAvailable);
	}

	private String canonicalTopicSlug(String slug) {
		return "child-mortality".equals(slug) ? "child-infant-mortality" : slug;
	}
}
