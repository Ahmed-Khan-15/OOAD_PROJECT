package com.globalhealthexplorer.editorial.article.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record ArticleRequest(
		@NotBlank @Size(max = 240) String title,
		@Size(max = 400) String subtitle,
		@NotBlank @Size(max = 240) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
		@Size(max = 1000) String coverImage,
		@NotBlank @Size(max = 180) String author,
		@NotBlank String categorySlug,
		String introduction,
		String content,
		Integer readingMinutes,
		@NotBlank String status,
		LocalDate publishedAt,
		@Size(max = 40) List<@NotBlank @Size(max = 120) String> tags,
		@Size(max = 40) List<@NotNull @Valid ReferenceInput> references,
		@Size(max = 30) List<@NotBlank String> topicSlugs,
		@Size(max = 30) List<@NotBlank String> countryIds,
		@Size(max = 60) List<@NotBlank String> indicatorIds,
		@Size(max = 20) List<@NotBlank String> relatedArticleSlugs) {

	public record ReferenceInput(@NotBlank @Size(max = 300) String label, @NotBlank @Size(max = 2000) String url) { }
}
