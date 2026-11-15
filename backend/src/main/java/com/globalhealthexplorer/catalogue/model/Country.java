package com.globalhealthexplorer.catalogue.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "countries")
public class Country {

	@Id
	private Long id;

	@Column(nullable = false, length = 120)
	private String name;

	@JdbcTypeCode(SqlTypes.CHAR)
	@Column(name = "iso2", nullable = false, length = 2)
	private String iso2;

	@JdbcTypeCode(SqlTypes.CHAR)
	@Column(name = "iso3", nullable = false, length = 3)
	private String iso3;

	@Column(length = 80)
	private String region;

	@Column(name = "is_active", nullable = false)
	private boolean active;

	protected Country() {
	}

	public Long getId() { return id; }
	public String getName() { return name; }
	public String getIso2() { return iso2; }
	public String getIso3() { return iso3; }
	public String getRegion() { return region; }
	public boolean isActive() { return active; }
}
