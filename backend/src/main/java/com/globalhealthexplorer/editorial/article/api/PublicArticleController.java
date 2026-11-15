package com.globalhealthexplorer.editorial.article.api;

import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import com.globalhealthexplorer.editorial.article.service.ArticleService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/articles")
public class PublicArticleController {

	private final ArticleService articleService;

	public PublicArticleController(ArticleService articleService) { this.articleService = articleService; }

	@GetMapping
	public EditorialPageResponse<ArticleResponse> list(
			@RequestParam(required = false) String category,
			@RequestParam(required = false) String tag,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return articleService.listPublic(category, tag, page, size);
	}

	@GetMapping("/{slug}")
	public ArticleResponse get(@PathVariable String slug) { return articleService.getPublic(slug); }
}
