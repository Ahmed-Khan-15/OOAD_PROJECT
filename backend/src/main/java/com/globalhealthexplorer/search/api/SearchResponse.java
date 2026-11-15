package com.globalhealthexplorer.search.api;

import java.util.List;

/** Search results grouped for the existing frontend's result sections. */
public record SearchResponse(
		String query,
		int minimumQueryLength,
		int perCategoryLimit,
		int totalResults,
		List<SearchResult> countries,
		List<SearchResult> topics,
		List<SearchResult> indicators,
		List<SearchResult> articles,
		List<SearchResult> glossary,
		List<SearchResult> datasets,
		List<SearchResult> sources) { }
