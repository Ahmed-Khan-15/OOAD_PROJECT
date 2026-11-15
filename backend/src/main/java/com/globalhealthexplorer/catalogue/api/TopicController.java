package com.globalhealthexplorer.catalogue.api;

import com.globalhealthexplorer.catalogue.service.CatalogueService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/topics")
public class TopicController {

	private final CatalogueService catalogueService;

	public TopicController(CatalogueService catalogueService) {
		this.catalogueService = catalogueService;
	}

	@GetMapping
	public List<TopicResponse> getTopics() {
		return catalogueService.getTopics();
	}

	@GetMapping("/{slug}")
	public TopicResponse getTopic(@PathVariable String slug) {
		return catalogueService.getTopic(slug);
	}
}
