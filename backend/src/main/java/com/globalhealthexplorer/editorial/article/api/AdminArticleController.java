package com.globalhealthexplorer.editorial.article.api;

import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import com.globalhealthexplorer.editorial.article.service.ArticleService;
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
@RequestMapping("/api/v1/admin/articles")
public class AdminArticleController {

	private final ArticleService articleService;

	public AdminArticleController(ArticleService articleService) { this.articleService = articleService; }

	@GetMapping
	public EditorialPageResponse<ArticleResponse> list(
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String tag,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return articleService.listAdmin(category, tag, page, size);
	}

	@GetMapping("/{slug}")
	public ArticleResponse get(@PathVariable String slug) { return articleService.getAdmin(slug); }

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public ArticleResponse create(@Valid @RequestBody ArticleRequest request) { return articleService.create(request); }

	@PutMapping("/{slug}")
	public ArticleResponse update(@PathVariable String slug, @Valid @RequestBody ArticleRequest request) {
		return articleService.update(slug, request);
	}

	@DeleteMapping("/{slug}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String slug) { articleService.deleteOrArchive(slug); }
}
