package com.globalhealthexplorer.editorial.article.model;

import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Editorial aggregate root; the service coordinates its catalogue relationships and references. */
@Entity
@Table(name = "articles")
public class Article {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private ArticleCategory category;

	@Column(nullable = false, length = 240)
	private String title;

	@Column(length = 400)
	private String subtitle;

	@Column(nullable = false, unique = true, length = 240)
	private String slug;

	@Column(name = "cover_image_url", columnDefinition = "text")
	private String coverImageUrl;

	@Column(name = "author_name", nullable = false, length = 180)
	private String authorName;

	@Column(columnDefinition = "text")
	private String introduction;

	@Column(columnDefinition = "text")
	private String content;

	@Column(name = "reading_minutes")
	private Integer readingMinutes;

	@Column(nullable = false, length = 20)
	private String status;

	@Column(name = "published_at")
	private LocalDate publishedAt;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@ManyToMany
	@JoinTable(name = "article_tag_links",
			joinColumns = @JoinColumn(name = "article_id"),
			inverseJoinColumns = @JoinColumn(name = "tag_id"))
	private Set<ArticleTag> tags = new LinkedHashSet<>();

	@OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC, id ASC")
	private List<ArticleReference> references = new ArrayList<>();

	@ManyToMany
	@JoinTable(name = "article_related_articles",
			joinColumns = @JoinColumn(name = "article_id"),
			inverseJoinColumns = @JoinColumn(name = "related_article_id"))
	private Set<Article> relatedArticles = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "article_topics",
			joinColumns = @JoinColumn(name = "article_id"),
			inverseJoinColumns = @JoinColumn(name = "topic_id"))
	private Set<Topic> topics = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "article_countries",
			joinColumns = @JoinColumn(name = "article_id"),
			inverseJoinColumns = @JoinColumn(name = "country_id"))
	private Set<Country> countries = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "article_indicators",
			joinColumns = @JoinColumn(name = "article_id"),
			inverseJoinColumns = @JoinColumn(name = "indicator_id"))
	private Set<Indicator> indicators = new LinkedHashSet<>();

	protected Article() { }

	public Article(ArticleCategory category, String title, String subtitle, String slug, String coverImageUrl,
			String authorName, String introduction, String content, Integer readingMinutes,
			String status, LocalDate publishedAt, Instant now) {
		this.category = category;
		this.title = title;
		this.subtitle = subtitle;
		this.slug = slug;
		this.coverImageUrl = coverImageUrl;
		this.authorName = authorName;
		this.introduction = introduction;
		this.content = content;
		this.readingMinutes = readingMinutes;
		this.status = status;
		this.publishedAt = publishedAt;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public void update(ArticleCategory category, String title, String subtitle, String slug,
			String coverImageUrl, String authorName, String introduction, String content,
			Integer readingMinutes, String status, LocalDate publishedAt, Instant now) {
		this.category = category;
		this.title = title;
		this.subtitle = subtitle;
		this.slug = slug;
		this.coverImageUrl = coverImageUrl;
		this.authorName = authorName;
		this.introduction = introduction;
		this.content = content;
		this.readingMinutes = readingMinutes;
		this.status = status;
		this.publishedAt = publishedAt;
		this.updatedAt = now;
	}

	public void archive(Instant now) {
		this.status = "ARCHIVED";
		this.updatedAt = now;
	}

	public void replaceReferences(List<ArticleReference> values) {
		references.clear();
		references.addAll(values);
	}

	public Long getId() { return id; }
	public ArticleCategory getCategory() { return category; }
	public String getTitle() { return title; }
	public String getSubtitle() { return subtitle; }
	public String getSlug() { return slug; }
	public String getCoverImageUrl() { return coverImageUrl; }
	public String getAuthorName() { return authorName; }
	public String getIntroduction() { return introduction; }
	public String getContent() { return content; }
	public Integer getReadingMinutes() { return readingMinutes; }
	public String getStatus() { return status; }
	public LocalDate getPublishedAt() { return publishedAt; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public Set<ArticleTag> getTags() { return tags; }
	public List<ArticleReference> getReferences() { return references; }
	public Set<Article> getRelatedArticles() { return relatedArticles; }
	public Set<Topic> getTopics() { return topics; }
	public Set<Country> getCountries() { return countries; }
	public Set<Indicator> getIndicators() { return indicators; }
}
