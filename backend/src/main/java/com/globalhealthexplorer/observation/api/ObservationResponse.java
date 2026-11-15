package com.globalhealthexplorer.observation.api;

import java.math.BigDecimal;
import java.util.Map;

public record ObservationResponse(
		CountryReference country,
		IndicatorReference indicator,
		DatasetReference dataset,
		int year,
		BigDecimal value,
		Map<String, Object> dimensions,
		String valueStatus,
		BigDecimal uncertaintyLower,
		BigDecimal uncertaintyUpper,
		String note) {

	public record CountryReference(String id, String name) { }
	public record IndicatorReference(String id, String name, String unit, String topicId) { }
	public record DatasetReference(String id, String name, String sourceId, String sourceName,
			String sourceUrl, String citation, String licenseName, String frequency) { }
}
