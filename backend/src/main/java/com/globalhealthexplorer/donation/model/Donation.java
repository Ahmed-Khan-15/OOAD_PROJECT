package com.globalhealthexplorer.donation.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;

/** A simulated contribution record; deliberately contains no payment-card data. */
@Entity
@Table(name = "donations")
public class Donation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 40)
	private String reference;

	@Column(name = "donor_name", nullable = false, length = 160)
	private String donorName;

	@Column(nullable = false, length = 254)
	private String email;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@JdbcTypeCode(SqlTypes.CHAR)
	@Column(nullable = false, length = 3)
	private String currency = "USD";

	@Column(nullable = false, length = 12)
	private String frequency;

	@Column(nullable = false)
	private boolean anonymous;

	@Column(nullable = false, length = 24)
	private String status = "SIMULATED_SUCCESS";

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Donation() { }

	public Donation(String reference, String donorName, String email, BigDecimal amount,
			String frequency, boolean anonymous, Instant createdAt) {
		this.reference = reference;
		this.donorName = donorName;
		this.email = email;
		this.amount = amount;
		this.frequency = frequency;
		this.anonymous = anonymous;
		this.createdAt = createdAt;
	}

	public Long getId() { return id; }
	public String getReference() { return reference; }
	public String getDonorName() { return donorName; }
	public String getEmail() { return email; }
	public BigDecimal getAmount() { return amount; }
	public String getCurrency() { return currency; }
	public String getFrequency() { return frequency; }
	public boolean isAnonymous() { return anonymous; }
	public String getStatus() { return status; }
	public Instant getCreatedAt() { return createdAt; }
}
