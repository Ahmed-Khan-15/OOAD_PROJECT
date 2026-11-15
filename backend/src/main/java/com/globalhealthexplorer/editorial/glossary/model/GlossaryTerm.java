package com.globalhealthexplorer.editorial.glossary.model;

import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.model.Topic;
import com.globalhealthexplorer.editorial.article.model.Article;
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
import jakarta.persistence.OrderBy;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Glossary aggregate root with relational links to relevant editorial and catalogue content. */
@Entity
@Table(name = "glossary_terms")
public class GlossaryTerm {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 200)
	private String term;

	@Column(nullable = false, unique = true, length = 220)
	private String slug;

	@Column(nullable = false, columnDefinition = "text")
	private String definition;

	@Column(name = "extended_explanation", columnDefinition = "text")
	private String extendedExplanation;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	@OneToMany(mappedBy = "glossaryTerm", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("displayOrder ASC, id ASC")
	private List<GlossaryReference> references = new ArrayList<>();

	@ManyToMany
	@JoinTable(name = "glossary_related_terms",
			joinColumns = @JoinColumn(name = "term_id"),
			inverseJoinColumns = @JoinColumn(name = "related_term_id"))
	private Set<GlossaryTerm> relatedTerms = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "glossary_articles",
			joinColumns = @JoinColumn(name = "glossary_term_id"),
			inverseJoinColumns = @JoinColumn(name = "article_id"))
	private Set<Article> articles = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "glossary_topics",
			joinColumns = @JoinColumn(name = "glossary_term_id"),
			inverseJoinColumns = @JoinColumn(name = "topic_id"))
	private Set<Topic> topics = new LinkedHashSet<>();

	@ManyToMany
	@JoinTable(name = "glossary_indicators",
			joinColumns = @JoinColumn(name = "glossary_term_id"),
			inverseJoinColumns = @JoinColumn(name = "indicator_id"))
	private Set<Indicator> indicators = new LinkedHashSet<>();

	protected GlossaryTerm() { }

	public GlossaryTerm(String term, String slug, String definition, String extendedExplanation, Instant now) {
		this.term = term;
		this.slug = slug;
		this.definition = definition;
		this.extendedExplanation = extendedExplanation;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public void update(String term, String slug, String definition, String extendedExplanation, Instant now) {
		this.term = term;
		this.slug = slug;
		this.definition = definition;
		this.extendedExplanation = extendedExplanation;
		this.updatedAt = now;
	}

	public void replaceReferences(List<GlossaryReference> values) {
		references.clear();
		references.addAll(values);
	}

	public Long getId() { return id; }
	public String getTerm() { return term; }
	public String getSlug() { return slug; }
	public String getDefinition() { return definition; }
	public String getExtendedExplanation() { return extendedExplanation; }
	public Instant getCreatedAt() { return createdAt; }
	public Instant getUpdatedAt() { return updatedAt; }
	public List<GlossaryReference> getReferences() { return references; }
	public Set<GlossaryTerm> getRelatedTerms() { return relatedTerms; }
	public Set<Article> getArticles() { return articles; }
	public Set<Topic> getTopics() { return topics; }
	public Set<Indicator> getIndicators() { return indicators; }
}
