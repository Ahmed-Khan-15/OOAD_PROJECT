package com.globalhealthexplorer.observation.service;

import com.globalhealthexplorer.catalogue.repository.CountryRepository;
import com.globalhealthexplorer.catalogue.repository.IndicatorRepository;
import com.globalhealthexplorer.common.ResourceNotFoundException;
import com.globalhealthexplorer.dataset.repository.DatasetRepository;
import com.globalhealthexplorer.observation.api.ObservationPageResponse;
import com.globalhealthexplorer.observation.api.ObservationResponse;
import com.globalhealthexplorer.observation.model.HealthObservation;
import com.globalhealthexplorer.observation.repository.HealthObservationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class ObservationService {

	private final HealthObservationRepository observationRepository;
	private final CountryRepository countryRepository;
	private final IndicatorRepository indicatorRepository;
	private final DatasetRepository datasetRepository;

	public ObservationService(HealthObservationRepository observationRepository,
			CountryRepository countryRepository, IndicatorRepository indicatorRepository,
			DatasetRepository datasetRepository) {
		this.observationRepository = observationRepository;
		this.countryRepository = countryRepository;
		this.indicatorRepository = indicatorRepository;
		this.datasetRepository = datasetRepository;
	}

	public ObservationPageResponse search(String countryIso3, String indicatorSlug, String datasetSlug,
			Integer fromYear, Integer toYear, int page, int size, String sortBy, String direction) {
		if (page < 0) throw new IllegalArgumentException("page must be zero or greater.");
		if (size < 1 || size > 100) throw new IllegalArgumentException("size must be between 1 and 100.");
		if (fromYear != null && (fromYear < 1800 || fromYear > 2200)
				|| toYear != null && (toYear < 1800 || toYear > 2200)) {
			throw new IllegalArgumentException("Year filters must be between 1800 and 2200.");
		}
		if (fromYear != null && toYear != null && fromYear > toYear) {
			throw new IllegalArgumentException("fromYear must not be greater than toYear.");
		}
		if (countryIso3 != null && !countryIso3.isBlank()) {
			String requestedCountry = countryIso3.toUpperCase(Locale.ROOT);
			countryRepository.findByIso3IgnoreCaseAndActiveTrue(requestedCountry)
					.orElseThrow(() -> new ResourceNotFoundException("Country", requestedCountry));
			countryIso3 = requestedCountry;
		} else {
			countryIso3 = null;
		}
		if (indicatorSlug != null && !indicatorSlug.isBlank()) {
			String requestedIndicator = indicatorSlug;
			indicatorRepository.findActiveBySlugWithTopic(requestedIndicator)
					.orElseThrow(() -> new ResourceNotFoundException("Indicator", requestedIndicator));
		} else {
			indicatorSlug = null;
		}
		if (datasetSlug != null && !datasetSlug.isBlank()) {
			String requestedDataset = datasetSlug;
			datasetRepository.findBySlugAndActiveTrue(requestedDataset)
					.filter(dataset -> dataset.getDataSource().isActive())
					.orElseThrow(() -> new ResourceNotFoundException("Dataset", requestedDataset));
		} else {
			datasetSlug = null;
		}

		String sortField = switch (sortBy.toLowerCase(Locale.ROOT)) {
			case "year" -> "referenceYear";
			case "value" -> "value";
			default -> throw new IllegalArgumentException("sortBy must be year or value.");
		};
		Sort.Direction sortDirection = Sort.Direction.fromOptionalString(direction)
				.orElseThrow(() -> new IllegalArgumentException("direction must be ASC or DESC."));
		Sort sort = Sort.by(sortDirection, sortField).and(Sort.by(Sort.Direction.ASC, "id"));
		Page<HealthObservation> result = observationRepository.search(countryIso3, indicatorSlug, datasetSlug,
				fromYear, toYear, PageRequest.of(page, size, sort));
		return new ObservationPageResponse(result.getContent().stream().map(this::toResponse).toList(),
				result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages(), result.hasNext());
	}

	private ObservationResponse toResponse(HealthObservation observation) {
		var country = observation.getCountry();
		var indicator = observation.getIndicator();
		var dataset = observation.getDataset();
		var source = dataset.getDataSource();
		return new ObservationResponse(
				new ObservationResponse.CountryReference(country.getIso3(), country.getName()),
				new ObservationResponse.IndicatorReference(indicator.getSlug(), indicator.getName(),
						indicator.getUnit(), indicator.getTopic().getSlug()),
				new ObservationResponse.DatasetReference(dataset.getSlug(), dataset.getName(),
						com.globalhealthexplorer.dataset.service.SlugUtil.fromName(source.getName()), source.getName(),
						dataset.getSourceUrl(), dataset.getCitation(), dataset.getLicenseName(), dataset.getFrequency()),
				observation.getReferenceYear(), observation.getValue(), observation.getDimensions(),
				observation.getValueStatus(), observation.getUncertaintyLower(), observation.getUncertaintyUpper(),
				observation.getObservationNote());
	}
}
