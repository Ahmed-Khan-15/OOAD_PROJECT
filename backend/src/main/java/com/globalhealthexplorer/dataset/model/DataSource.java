package com.globalhealthexplorer.dataset.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "data_sources")
public class DataSource {

	@Id
	private Long id;

	@Column(nullable = false, length = 180)
	private String name;

	@Column(length = 40)
	private String abbreviation;

	@Column(name = "website_url", columnDefinition = "text")
	private String websiteUrl;

	@Column(columnDefinition = "text")
	private String description;

	@Column(name = "is_active", nullable = false)
	private boolean active;

	protected DataSource() {
	}

	public Long getId() { return id; }
	public String getName() { return name; }
	public String getAbbreviation() { return abbreviation; }
	public String getWebsiteUrl() { return websiteUrl; }
	public String getDescription() { return description; }
	public boolean isActive() { return active; }
}
