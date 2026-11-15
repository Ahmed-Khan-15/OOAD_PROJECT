package com.globalhealthexplorer.catalogue.api;

public record IndicatorResponse(
		String id,
		String slug,
		String name,
		String description,
		String unit,
		String preferredDirection,
		TopicReference topic,
		boolean active,
		boolean observationsAvailable) {

	public record TopicReference(String id, String name) {
	}
}
