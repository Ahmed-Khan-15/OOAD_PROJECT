package com.globalhealthexplorer.dataset.api;

import com.globalhealthexplorer.dataset.service.DatasetService;
import com.globalhealthexplorer.imports.api.ImportBatchResponse;
import com.globalhealthexplorer.imports.service.CsvImportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/datasets")
public class AdminDatasetController {

	private final DatasetService datasetService;
	private final CsvImportService csvImportService;

	public AdminDatasetController(DatasetService datasetService, CsvImportService csvImportService) {
		this.datasetService = datasetService;
		this.csvImportService = csvImportService;
	}

	@GetMapping
	public List<DatasetResponse> getDatasets() {
		return datasetService.getAdminDatasets();
	}

	@GetMapping("/{slug}")
	public DatasetResponse getDataset(@PathVariable String slug) {
		return datasetService.getAdminDataset(slug);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public DatasetResponse createDataset(@Valid @RequestBody DatasetRequest request) {
		return datasetService.createDataset(request);
	}

	@PutMapping("/{slug}")
	public DatasetResponse updateDataset(@PathVariable String slug, @Valid @RequestBody DatasetRequest request) {
		return datasetService.updateDataset(slug, request);
	}

	@PostMapping(path = "/{slug}/imports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public ImportBatchResponse importCsv(@PathVariable String slug,
			@RequestPart("file") MultipartFile file, Principal principal) {
		return csvImportService.importCsv(slug, file, principal.getName());
	}

	@GetMapping("/{slug}/imports")
	public List<ImportBatchResponse> getImports(@PathVariable String slug) {
		return csvImportService.getImports(slug);
	}
}
