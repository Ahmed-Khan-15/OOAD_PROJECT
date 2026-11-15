package com.globalhealthexplorer.dataset.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "datasets")
public class Dataset {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "data_source_id", nullable = false)
	private DataSource dataSource;

	@Column(nullable = false, length = 220)
	private String name;

	@Column(nullable = false, length = 240)
	private String slug;

	@Column(columnDefinition = "text")
	private String description;

	@Column(name = "source_url", columnDefinition = "text")
	private String sourceUrl;

	@Column(columnDefinition = "text")
	private String citation;

	@Column(name = "license_name", length = 180)
	private String licenseName;

	@Column(name = "license_url", columnDefinition = "text")
	private String licenseUrl;

	@Column(columnDefinition = "text")
	private String methodology;

	@Column(length = 40)
	private String frequency;

	@Column(name = "published_at")
	private LocalDate publishedAt;

	@Column(name = "coverage_start_year")
	private Integer coverageStartYear;

	@Column(name = "coverage_end_year")
	private Integer coverageEndYear;

	@Column(name = "is_active", nullable = false)
	private boolean active;

	protected Dataset() {
	}

	public Dataset(DataSource dataSource, String name, String slug, String description,
			String sourceUrl, String citation, String licenseName, String licenseUrl,
			String methodology, String frequency, LocalDate publishedAt,
			Integer coverageStartYear, Integer coverageEndYear, boolean active) {
		update(dataSource, name, slug, description, sourceUrl, citation, licenseName,
				licenseUrl, methodology, frequency, publishedAt, coverageStartYear, coverageEndYear, active);
	}

	public void update(DataSource dataSource, String name, String slug, String description,
			String sourceUrl, String citation, String licenseName, String licenseUrl,
			String methodology, String frequency, LocalDate publishedAt,
			Integer coverageStartYear, Integer coverageEndYear, boolean active) {
		this.dataSource = dataSource;
		this.name = name;
		this.slug = slug;
		this.description = description;
		this.sourceUrl = sourceUrl;
		this.citation = citation;
		this.licenseName = licenseName;
		this.licenseUrl = licenseUrl;
		this.methodology = methodology;
		this.frequency = frequency;
		this.publishedAt = publishedAt;
		this.coverageStartYear = coverageStartYear;
		this.coverageEndYear = coverageEndYear;
		this.active = active;
	}

	public Long getId() { return id; }
	public DataSource getDataSource() { return dataSource; }
	public String getName() { return name; }
	public String getSlug() { return slug; }
	public String getDescription() { return description; }
	public String getSourceUrl() { return sourceUrl; }
	public String getCitation() { return citation; }
	public String getLicenseName() { return licenseName; }
	public String getLicenseUrl() { return licenseUrl; }
	public String getMethodology() { return methodology; }
	public String getFrequency() { return frequency; }
	public LocalDate getPublishedAt() { return publishedAt; }
	public Integer getCoverageStartYear() { return coverageStartYear; }
	public Integer getCoverageEndYear() { return coverageEndYear; }
	public boolean isActive() { return active; }
}
