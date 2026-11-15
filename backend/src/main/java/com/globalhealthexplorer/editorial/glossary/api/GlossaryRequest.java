package com.globalhealthexplorer.editorial.glossary.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GlossaryRequest(
		@NotBlank @Size(max = 200) String term,
		@NotBlank @Size(max = 220) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
		@NotBlank String definition,
		String extendedExplanation,
		@Size(max = 40) List<@NotNull @Valid ReferenceInput> references,
		@Size(max = 30) List<@NotBlank String> relatedTermSlugs,
		@Size(max = 30) List<@NotBlank String> relatedArticleSlugs,
		@Size(max = 30) List<@NotBlank String> relatedTopicSlugs,
		@Size(max = 60) List<@NotBlank String> relatedIndicatorIds) {

	public record ReferenceInput(@NotBlank @Size(max = 300) String label, @NotBlank @Size(max = 2000) String url) { }
}
