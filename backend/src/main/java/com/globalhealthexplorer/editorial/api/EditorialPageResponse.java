package com.globalhealthexplorer.editorial.api;

import java.util.List;

/** Stable pagination shape shared by public and administrator editorial endpoints. */
public record EditorialPageResponse<T>(
		List<T> content,
		int page,
		int size,
		long totalElements,
		int totalPages,
		boolean hasNext) { }
