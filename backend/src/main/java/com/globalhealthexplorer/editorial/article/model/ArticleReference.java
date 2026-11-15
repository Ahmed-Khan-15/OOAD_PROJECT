package com.globalhealthexplorer.editorial.article.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Ordered citation attached to an article. */
@Entity
@Table(name = "article_references")
public class ArticleReference {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "article_id", nullable = false)
	private Article article;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	@Column(nullable = false, length = 300)
	private String label;

	@Column(nullable = false, columnDefinition = "text")
	private String url;

	protected ArticleReference() { }

	public ArticleReference(Article article, int displayOrder, String label, String url) {
		this.article = article;
		this.displayOrder = displayOrder;
		this.label = label;
		this.url = url;
	}

	public int getDisplayOrder() { return displayOrder; }
	public String getLabel() { return label; }
	public String getUrl() { return url; }
}
