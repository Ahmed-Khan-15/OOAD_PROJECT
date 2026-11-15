package com.globalhealthexplorer.dataset.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IndicatorMappingRequest(
		@NotBlank String indicatorSlug,
		@Size(max = 180) String originalIndicatorCode,
		@NotBlank @Size(max = 240) String originalIndicatorName,
		@NotBlank @Size(max = 120) String originalUnit,
		String conversionNotes,
		String dimensionsDescription) {
}
