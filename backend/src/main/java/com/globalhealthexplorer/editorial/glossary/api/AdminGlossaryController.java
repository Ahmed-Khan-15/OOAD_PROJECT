package com.globalhealthexplorer.editorial.glossary.api;

import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import com.globalhealthexplorer.editorial.glossary.service.GlossaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/glossary")
public class AdminGlossaryController {

	private final GlossaryService glossaryService;

	public AdminGlossaryController(GlossaryService glossaryService) { this.glossaryService = glossaryService; }

	@GetMapping
	public EditorialPageResponse<GlossaryResponse> list(
			@RequestParam(name = "q", required = false) String query,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return glossaryService.listAdmin(query, page, size);
	}

	@GetMapping("/{slug}")
	public GlossaryResponse get(@PathVariable String slug) { return glossaryService.getAdmin(slug); }

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public GlossaryResponse create(@Valid @RequestBody GlossaryRequest request) { return glossaryService.create(request); }

	@PutMapping("/{slug}")
	public GlossaryResponse update(@PathVariable String slug, @Valid @RequestBody GlossaryRequest request) {
		return glossaryService.update(slug, request);
	}

	@DeleteMapping("/{slug}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String slug) { glossaryService.delete(slug); }
}
