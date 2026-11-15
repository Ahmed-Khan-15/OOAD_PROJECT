package com.globalhealthexplorer.dataset.service;

import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.common.ResourceNotFoundException;
import com.globalhealthexplorer.dataset.api.DatasetRequest;
import com.globalhealthexplorer.dataset.api.DatasetResponse;
import com.globalhealthexplorer.dataset.api.IndicatorMappingRequest;
import com.globalhealthexplorer.dataset.api.SourceResponse;
import com.globalhealthexplorer.dataset.model.DataSource;
import com.globalhealthexplorer.dataset.model.Dataset;
import com.globalhealthexplorer.dataset.model.IndicatorSourceMapping;
import com.globalhealthexplorer.dataset.repository.DataSourceRepository;
import com.globalhealthexplorer.dataset.repository.DatasetRepository;
import com.globalhealthexplorer.dataset.repository.IndicatorSourceMappingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/** Manages dataset metadata and mappings while returning API DTOs instead of entities. */
@Service
@Transactional(readOnly = true)
public class DatasetService {

	private final DatasetRepository datasetRepository;
	private final DataSourceRepository dataSourceRepository;
	private final IndicatorSourceMappingRepository mappingRepository;
	private final IndicatorRepository indicatorRepository;

	public DatasetService(
			DatasetRepository datasetRepository,
			DataSourceRepository dataSourceRepository,
			IndicatorSourceMappingRepository mappingRepository,
			IndicatorRepository indicatorRepository) {
		this.datasetRepository = datasetRepository;
		this.dataSourceRepository = dataSourceRepository;
		this.mappingRepository = mappingRepository;
		this.indicatorRepository = indicatorRepository;
	}

	public List<DatasetResponse> getPublicDatasets() {
		return datasetRepository.findAllByActiveTrueOrderByNameAsc().stream()
				.filter(dataset -> dataset.getDataSource().isActive())
				.map(this::toResponse)
				.toList();
	}

	public DatasetResponse getPublicDataset(String slug) {
		Dataset dataset = datasetRepository.findBySlugAndActiveTrue(slug)
				.filter(item -> item.getDataSource().isActive())
				.orElseThrow(() -> new ResourceNotFoundException("Dataset", slug));
		return toResponse(dataset);
	}

	public List<DatasetResponse> getAdminDatasets() {
		return datasetRepository.findAllByOrderByNameAsc().stream().map(this::toResponse).toList();
	}

	public DatasetResponse getAdminDataset(String slug) {
		return toResponse(findDataset(slug));
	}

	@Transactional
	public DatasetResponse createDataset(DatasetRequest request) {
		if (datasetRepository.existsBySlug(request.slug())) {
			throw new IllegalArgumentException("A dataset with this slug already exists.");
		}
		DataSource source = findActiveSource(request.sourceId());
		validateMetadata(request);
		List<ResolvedMapping> mappings = validateMappings(request.indicators());

		Dataset dataset = datasetRepository.saveAndFlush(new Dataset(
				source, request.name().trim(), request.slug(), blankToNull(request.description()),
				validateUrl(request.sourceUrl(), "sourceUrl"), blankToNull(request.citation()),
				blankToNull(request.licenseName()), validateUrl(request.licenseUrl(), "licenseUrl"),
				blankToNull(request.methodology()), blankToNull(request.frequency()), request.publishedAt(),
				request.coverageStartYear(), request.coverageEndYear(), request.active()));
		saveMappings(dataset, mappings);
		return toResponse(dataset);
	}

	@Transactional
	public DatasetResponse updateDataset(String slug, DatasetRequest request) {
		Dataset dataset = findDataset(slug);
		if (!dataset.getSlug().equals(request.slug()) && datasetRepository.existsBySlug(request.slug())) {
			throw new IllegalArgumentException("A dataset with this slug already exists.");
		}
		DataSource source = findActiveSource(request.sourceId());
		validateMetadata(request);
		List<ResolvedMapping> mappings = validateMappings(request.indicators());

		dataset.update(source, request.name().trim(), request.slug(), blankToNull(request.description()),
				validateUrl(request.sourceUrl(), "sourceUrl"), blankToNull(request.citation()),
				blankToNull(request.licenseName()), validateUrl(request.licenseUrl(), "licenseUrl"),
				blankToNull(request.methodology()), blankToNull(request.frequency()), request.publishedAt(),
				request.coverageStartYear(), request.coverageEndYear(), request.active());
		datasetRepository.save(dataset);
		updateMappings(dataset, mappings);
		return toResponse(dataset);
	}

	public List<SourceResponse> getPublicSources() {
		List<Dataset> datasets = datasetRepository.findAllByActiveTrueOrderByNameAsc().stream()
				.filter(dataset -> dataset.getDataSource().isActive())
				.toList();
		Map<Long, List<String>> datasetSlugsBySource = datasets.stream()
				.collect(Collectors.groupingBy(dataset -> dataset.getDataSource().getId(),
						Collectors.mapping(Dataset::getSlug, Collectors.toList())));
		return dataSourceRepository.findAllByActiveTrueOrderByNameAsc().stream()
				.map(source -> toSourceResponse(source,
						datasetSlugsBySource.getOrDefault(source.getId(), List.of())))
				.toList();
	}

	public SourceResponse getPublicSource(String slug) {
		return getPublicSources().stream()
				.filter(source -> source.id().equals(slug))
				.findFirst()
				.orElseThrow(() -> new ResourceNotFoundException("Data source", slug));
	}

	public List<DatasetResponse.IndicatorMappingResponse> getMappings(Dataset dataset) {
		return mappingRepository.findAllByDatasetIdOrderByIdAsc(dataset.getId()).stream()
				.map(this::toMappingResponse)
				.toList();
	}

	public Dataset findDataset(String slug) {
		return datasetRepository.findBySlug(slug)
				.orElseThrow(() -> new ResourceNotFoundException("Dataset", slug));
	}

	private DataSource findActiveSource(String sourceSlug) {
		return dataSourceRepository.findAllByActiveTrueOrderByNameAsc().stream()
				.filter(source -> SlugUtil.fromName(source.getName()).equals(sourceSlug))
				.findFirst()
				.orElseThrow(() -> new ResourceNotFoundException("Active data source", sourceSlug));
	}

	private List<ResolvedMapping> validateMappings(List<IndicatorMappingRequest> requests) {
		List<ResolvedMapping> mappings = new ArrayList<>();
		Set<String> sourceKeys = new HashSet<>();
		for (IndicatorMappingRequest request : requests) {
			Indicator indicator = indicatorRepository.findActiveBySlugWithTopic(request.indicatorSlug())
					.orElseThrow(() -> new ResourceNotFoundException("Active indicator", request.indicatorSlug()));
			String code = blankToNull(request.originalIndicatorCode());
			String matchingKey = code == null ? indicator.getSlug() : code;
			if (!sourceKeys.add(matchingKey.toLowerCase(Locale.ROOT))) {
				throw new IllegalArgumentException("Dataset indicator mappings must have unique source codes.");
			}
			mappings.add(new ResolvedMapping(indicator, code, request.originalIndicatorName().trim(),
					request.originalUnit().trim(), blankToNull(request.conversionNotes()),
					blankToNull(request.dimensionsDescription())));
		}
		return mappings;
	}

	private void saveMappings(Dataset dataset, List<ResolvedMapping> mappings) {
		mappingRepository.saveAll(mappings.stream().map(mapping -> toMapping(dataset, mapping)).toList());
		mappingRepository.flush();
	}

	/** Retains mapping identity for imported observations and blocks removal of referenced mappings. */
	private void updateMappings(Dataset dataset, List<ResolvedMapping> requestedMappings) {
		Map<Long, IndicatorSourceMapping> existingByIndicator = new LinkedHashMap<>();
		for (IndicatorSourceMapping mapping : mappingRepository.findAllByDatasetIdOrderByIdAsc(dataset.getId())) {
			existingByIndicator.put(mapping.getIndicator().getId(), mapping);
		}

		Set<Long> requestedIndicatorIds = new HashSet<>();
		List<IndicatorSourceMapping> addedMappings = new ArrayList<>();
		for (ResolvedMapping requested : requestedMappings) {
			Long indicatorId = requested.indicator().getId();
			requestedIndicatorIds.add(indicatorId);
			IndicatorSourceMapping existing = existingByIndicator.get(indicatorId);
			if (existing == null) {
				addedMappings.add(toMapping(dataset, requested));
			} else {
				if (mappingHasChanged(existing, requested)
						&& mappingRepository.hasObservations(existing.getId())) {
					throw new IllegalArgumentException("A mapping with imported observations cannot be changed.");
				}
				existing.update(requested.originalCode(), requested.originalName(), requested.originalUnit(),
						requested.conversionNotes(), requested.dimensionsDescription());
			}
		}

		List<IndicatorSourceMapping> removedMappings = existingByIndicator.entrySet().stream()
				.filter(entry -> !requestedIndicatorIds.contains(entry.getKey()))
				.map(Map.Entry::getValue).toList();
		if (removedMappings.stream().anyMatch(mapping -> mappingRepository.hasObservations(mapping.getId()))) {
			throw new IllegalArgumentException("An indicator mapping with imported observations cannot be removed.");
		}
		mappingRepository.deleteAll(removedMappings);
		mappingRepository.saveAll(addedMappings);
		mappingRepository.flush();
	}

	private IndicatorSourceMapping toMapping(Dataset dataset, ResolvedMapping mapping) {
		return new IndicatorSourceMapping(dataset, mapping.indicator(), mapping.originalCode(),
				mapping.originalName(), mapping.originalUnit(), mapping.conversionNotes(),
				mapping.dimensionsDescription());
	}

	private boolean mappingHasChanged(IndicatorSourceMapping existing, ResolvedMapping requested) {
		return !Objects.equals(existing.getOriginalIndicatorCode(), requested.originalCode())
				|| !Objects.equals(existing.getOriginalIndicatorName(), requested.originalName())
				|| !Objects.equals(existing.getOriginalUnit(), requested.originalUnit())
				|| !Objects.equals(existing.getConversionNotes(), requested.conversionNotes())
				|| !Objects.equals(existing.getDimensionsDescription(), requested.dimensionsDescription());
	}

	private void validateMetadata(DatasetRequest request) {
		if (request.coverageStartYear() != null && (request.coverageStartYear() < 1800 || request.coverageStartYear() > 2200)) {
			throw new IllegalArgumentException("coverageStartYear must be between 1800 and 2200.");
		}
		if (request.coverageEndYear() != null && (request.coverageEndYear() < 1800 || request.coverageEndYear() > 2200)) {
			throw new IllegalArgumentException("coverageEndYear must be between 1800 and 2200.");
		}
		if (request.coverageStartYear() != null && request.coverageEndYear() != null
				&& request.coverageStartYear() > request.coverageEndYear()) {
			throw new IllegalArgumentException("Dataset coverage start year must not exceed its end year.");
		}
	}

	private String validateUrl(String value, String fieldName) {
		String cleaned = blankToNull(value);
		if (cleaned == null) return null;
		try {
			URI uri = URI.create(cleaned);
			if (uri.getHost() == null || !("http".equalsIgnoreCase(uri.getScheme())
					|| "https".equalsIgnoreCase(uri.getScheme()))) {
				throw new IllegalArgumentException(fieldName + " must be an HTTP or HTTPS URL.");
			}
			return cleaned;
		} catch (IllegalArgumentException exception) {
			if (exception.getMessage() != null && exception.getMessage().startsWith(fieldName + " ")) throw exception;
			throw new IllegalArgumentException(fieldName + " must be a valid HTTP or HTTPS URL.");
		}
	}

	private DatasetResponse toResponse(Dataset dataset) {
		DataSource source = dataset.getDataSource();
		List<DatasetResponse.IndicatorMappingResponse> mappings = getMappings(dataset);
		return new DatasetResponse(dataset.getSlug(), dataset.getSlug(), dataset.getName(), dataset.getDescription(),
				new DatasetResponse.SourceReference(SlugUtil.fromName(source.getName()), source.getName(), source.getAbbreviation()),
				dataset.getSourceUrl(), dataset.getCitation(), dataset.getLicenseName(), dataset.getLicenseUrl(),
				dataset.getMethodology(), dataset.getFrequency(), dataset.getPublishedAt(),
				dataset.getCoverageStartYear(), dataset.getCoverageEndYear(),
				dataset.isActive() ? "ACTIVE" : "INACTIVE", mappings);
	}

	private DatasetResponse.IndicatorMappingResponse toMappingResponse(IndicatorSourceMapping mapping) {
		Indicator indicator = mapping.getIndicator();
		return new DatasetResponse.IndicatorMappingResponse(indicator.getSlug(), indicator.getName(),
				indicator.getUnit(), mapping.getOriginalIndicatorCode(), mapping.getOriginalIndicatorName(),
				mapping.getOriginalUnit(), mapping.getConversionNotes(), mapping.getDimensionsDescription());
	}

	private SourceResponse toSourceResponse(DataSource source, List<String> datasetSlugs) {
		return new SourceResponse(SlugUtil.fromName(source.getName()), source.getName(),
				source.getAbbreviation(), source.getWebsiteUrl(), source.getDescription(),
				source.isActive(), datasetSlugs);
	}

	private String blankToNull(String value) {
		return value == null || value.isBlank() ? null : value.trim();
	}

	private record ResolvedMapping(Indicator indicator, String originalCode, String originalName,
			String originalUnit, String conversionNotes, String dimensionsDescription) {
	}
}
