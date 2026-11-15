package com.globalhealthexplorer.catalogue.api;

import java.util.List;

public record TopicResponse(
		String id,
		String slug,
		String name,
		String description,
		boolean overview,
		int displayOrder,
		boolean active,
		List<String> indicatorIds) {
}
