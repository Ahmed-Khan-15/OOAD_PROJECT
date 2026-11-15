package com.globalhealthexplorer.editorial.article.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A controlled editorial category seeded by Flyway. */
@Entity
@Table(name = "article_categories")
public class ArticleCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 80)
	private String slug;

	@Column(nullable = false, unique = true, length = 120)
	private String name;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected ArticleCategory() { }

	public Long getId() { return id; }
	public String getSlug() { return slug; }
	public String getName() { return name; }
}
