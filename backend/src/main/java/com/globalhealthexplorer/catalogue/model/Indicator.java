package com.globalhealthexplorer.catalogue.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "indicators")
public class Indicator {

	@Id
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "topic_id", nullable = false)
	private Topic topic;

	@Column(nullable = false, length = 200)
	private String name;

	@Column(nullable = false, length = 220)
	private String slug;

	@Column(columnDefinition = "text")
	private String description;

	@Column(nullable = false, length = 100)
	private String unit;

	@Column(name = "preferred_direction", nullable = false, length = 20)
	private String preferredDirection;

	@Column(name = "is_active", nullable = false)
	private boolean active;

	@Column(name = "display_order", nullable = false)
	private int displayOrder;

	protected Indicator() {
	}

	public Long getId() { return id; }
	public Topic getTopic() { return topic; }
	public String getName() { return name; }
	public String getSlug() { return slug; }
	public String getDescription() { return description; }
	public String getUnit() { return unit; }
	public String getPreferredDirection() { return preferredDirection; }
	public boolean isActive() { return active; }
	public int getDisplayOrder() { return displayOrder; }
}
