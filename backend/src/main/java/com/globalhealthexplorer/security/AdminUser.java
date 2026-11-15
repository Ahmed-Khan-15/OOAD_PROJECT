package com.globalhealthexplorer.security;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "admin_users")
public class AdminUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 254)
	private String email;

	@Column(name = "password_hash", nullable = false, length = 255)
	private String passwordHash;

	@Column(name = "display_name", nullable = false, length = 120)
	private String displayName;

	@Column(name = "is_active", nullable = false)
	private boolean active = true;

	@Column(name = "last_login_at")
	private Instant lastLoginAt;

	protected AdminUser() {
	}

	public AdminUser(String email, String passwordHash, String displayName) {
		this.email = email;
		this.passwordHash = passwordHash;
		this.displayName = displayName;
	}

	public Long getId() { return id; }
	public String getEmail() { return email; }
	public String getPasswordHash() { return passwordHash; }
	public String getDisplayName() { return displayName; }
	public boolean isActive() { return active; }
}
