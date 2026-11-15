package com.globalhealthexplorer.dataset.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record DatasetRequest(
		@NotBlank @Size(max = 220) String name,
		@NotBlank @Size(max = 240) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
		@NotBlank String sourceId,
		String description,
		String sourceUrl,
		String citation,
		@Size(max = 180) String licenseName,
		String licenseUrl,
		String methodology,
		@Size(max = 40) String frequency,
		LocalDate publishedAt,
		Integer coverageStartYear,
		Integer coverageEndYear,
		@NotNull Boolean active,
		@NotEmpty List<@Valid IndicatorMappingRequest> indicators) {
}
