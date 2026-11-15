package com.globalhealthexplorer.catalogue.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "topics")
public class Topic {

	@Id
	private Long id;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, length = 140)
	private String slug;

	@Column(columnDefinition = "text")
	private String description;

	@Column(name = "is_overview", nullable = false)
	private boolean overview;

	@Column(name = "is_active", nullable = false)
	private boolean active;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected Topic() {
	}

	public Long getId() { return id; }
	public String getName() { return name; }
	public String getSlug() { return slug; }
	public String getDescription() { return description; }
	public boolean isOverview() { return overview; }
	public boolean isActive() { return active; }
	public int getDisplayOrder() { return displayOrder; }
}
