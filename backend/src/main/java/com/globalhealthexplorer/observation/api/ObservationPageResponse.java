package com.globalhealthexplorer.observation.api;

import java.util.List;

public record ObservationPageResponse(
		List<ObservationResponse> content,
		int page,
		int size,
		long totalElements,
		int totalPages,
		boolean hasNext) {
}
