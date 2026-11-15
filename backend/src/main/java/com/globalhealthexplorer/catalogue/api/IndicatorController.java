package com.globalhealthexplorer.catalogue.api;

import com.globalhealthexplorer.catalogue.service.CatalogueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/indicators")
public class IndicatorController {

	private final CatalogueService catalogueService;

	public IndicatorController(CatalogueService catalogueService) {
		this.catalogueService = catalogueService;
	}

	@GetMapping
	public List<IndicatorResponse> getIndicators() {
		return catalogueService.getIndicators();
	}

	@GetMapping("/{slug}")
	public IndicatorResponse getIndicator(@PathVariable String slug) {
		return catalogueService.getIndicator(slug);
	}
}
