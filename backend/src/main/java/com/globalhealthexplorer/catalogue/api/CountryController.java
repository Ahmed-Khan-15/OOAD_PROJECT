package com.globalhealthexplorer.catalogue.api;

import com.globalhealthexplorer.catalogue.service.CatalogueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/countries")
public class CountryController {

	private final CatalogueService catalogueService;

	public CountryController(CatalogueService catalogueService) {
		this.catalogueService = catalogueService;
	}

	@GetMapping
	public List<CountryResponse> getCountries() {
		return catalogueService.getCountries();
	}

	@GetMapping("/{identifier}")
	public CountryResponse getCountry(@PathVariable String identifier) {
		return catalogueService.getCountry(identifier);
	}
}
