package com.globalhealthexplorer.editorial.glossary.api;

import java.time.Instant;
import java.util.List;

/** Glossary representation aligned to the current frontend fields and stable public slugs. */
public record GlossaryResponse(
		String id,
		String term,
		String slug,
		String definition,
		String extendedExplanation,
		Instant createdAt,
		Instant updatedAt,
		List<String> relatedTopicSlugs,
		List<String> relatedArticleSlugs,
		List<String> relatedIndicatorIds,
		List<String> relatedTermSlugs,
		List<ReferenceResponse> references) {

	public record ReferenceResponse(String label, String url) { }
}
