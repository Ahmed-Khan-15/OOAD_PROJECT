package com.globalhealthexplorer.editorial.article.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Public and admin article representation; identifiers are stable slugs, never database IDs. */
public record ArticleResponse(
		String id,
		String slug,
		String title,
		String subtitle,
		String author,
		String category,
		String categorySlug,
		List<String> tags,
		LocalDate publishedAt,
		Instant updatedAt,
		Integer readingMinutes,
		String status,
		String coverImage,
		String introduction,
		String content,
		List<ReferenceResponse> references,
		List<String> topicSlugs,
		List<String> countryIds,
		List<String> indicatorIds,
		List<String> relatedArticleSlugs) {

	public record ReferenceResponse(String label, String url) { }
}
