package com.globalhealthexplorer.dataset.api;

import java.time.LocalDate;
import java.util.List;

public record DatasetResponse(
		String id,
		String slug,
		String name,
		String description,
		SourceReference source,
		String sourceUrl,
		String citation,
		String licenseName,
		String licenseUrl,
		String methodology,
		String frequency,
		LocalDate publishedAt,
		Integer coverageStartYear,
		Integer coverageEndYear,
		String status,
		List<IndicatorMappingResponse> indicators) {

	public record SourceReference(String id, String name, String abbreviation) {
	}

	public record IndicatorMappingResponse(
			String indicatorId,
			String indicatorName,
			String unit,
			String originalIndicatorCode,
			String originalIndicatorName,
			String originalUnit,
			String conversionNotes,
			String dimensionsDescription) {
	}
}
