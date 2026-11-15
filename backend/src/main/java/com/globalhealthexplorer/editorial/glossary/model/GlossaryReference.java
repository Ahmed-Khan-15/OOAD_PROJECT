package com.globalhealthexplorer.editorial.glossary.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Citation attached to a glossary definition. */
@Entity
@Table(name = "glossary_references")
public class GlossaryReference {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "glossary_term_id", nullable = false)
	private GlossaryTerm glossaryTerm;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	@Column(nullable = false, length = 300)
	private String label;

	@Column(nullable = false, columnDefinition = "text")
	private String url;

	protected GlossaryReference() { }

	public GlossaryReference(GlossaryTerm glossaryTerm, int displayOrder, String label, String url) {
		this.glossaryTerm = glossaryTerm;
		this.displayOrder = displayOrder;
		this.label = label;
		this.url = url;
	}

	public int getDisplayOrder() { return displayOrder; }
	public String getLabel() { return label; }
	public String getUrl() { return url; }
}
