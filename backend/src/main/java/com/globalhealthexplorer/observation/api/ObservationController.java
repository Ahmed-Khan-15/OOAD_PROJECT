package com.globalhealthexplorer.observation.api;

import com.globalhealthexplorer.observation.service.ObservationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/observations")
public class ObservationController {

	private final ObservationService observationService;

	public ObservationController(ObservationService observationService) {
		this.observationService = observationService;
	}

	@GetMapping
	public ObservationPageResponse search(
			@RequestParam(required = false) String country,
			@RequestParam(required = false) String indicator,
			@RequestParam(required = false) String dataset,
			@RequestParam(required = false) Integer fromYear,
			@RequestParam(required = false) Integer toYear,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "50") int size,
			@RequestParam(defaultValue = "year") String sortBy,
			@RequestParam(defaultValue = "ASC") String direction) {
		return observationService.search(country, indicator, dataset, fromYear, toYear,
				page, size, sortBy, direction);
	}
}
