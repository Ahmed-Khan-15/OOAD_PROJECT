package com.globalhealthexplorer.dataset.api;

import java.util.List;

public record SourceResponse(
		String id,
		String name,
		String abbreviation,
		String websiteUrl,
		String description,
		boolean active,
		List<String> datasetIds) {
}
