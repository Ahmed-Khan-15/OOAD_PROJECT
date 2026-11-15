package com.globalhealthexplorer.editorial.article.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A reusable tag shared by article listings and filters. */
@Entity
@Table(name = "article_tags")
public class ArticleTag {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 120)
	private String slug;

	@Column(nullable = false, unique = true, length = 120)
	private String name;

	protected ArticleTag() { }

	public ArticleTag(String slug, String name) {
		this.slug = slug;
		this.name = name;
	}

	public Long getId() { return id; }
	public String getSlug() { return slug; }
	public String getName() { return name; }
}
