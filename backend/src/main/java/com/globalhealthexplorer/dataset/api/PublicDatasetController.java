package com.globalhealthexplorer.dataset.api;

import com.globalhealthexplorer.dataset.service.DatasetService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PublicDatasetController {

	private final DatasetService datasetService;

	public PublicDatasetController(DatasetService datasetService) {
		this.datasetService = datasetService;
	}

	@GetMapping("/datasets")
	public List<DatasetResponse> getDatasets() {
		return datasetService.getPublicDatasets();
	}

	@GetMapping("/datasets/{slug}")
	public DatasetResponse getDataset(@PathVariable String slug) {
		return datasetService.getPublicDataset(slug);
	}

	@GetMapping("/sources")
	public List<SourceResponse> getSources() {
		return datasetService.getPublicSources();
	}

	@GetMapping("/sources/{slug}")
	public SourceResponse getSource(@PathVariable String slug) {
		return datasetService.getPublicSource(slug);
	}
}
