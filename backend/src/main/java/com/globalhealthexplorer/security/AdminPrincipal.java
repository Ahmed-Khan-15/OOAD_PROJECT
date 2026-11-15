package com.globalhealthexplorer.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;

public class AdminPrincipal implements UserDetails {

	@Serial
	private static final long serialVersionUID = 1L;

	private final Long adminId;
	private final String email;
	private final String passwordHash;
	private final String displayName;
	private final boolean active;

	public AdminPrincipal(AdminUser adminUser) {
		this.adminId = adminUser.getId();
		this.email = adminUser.getEmail();
		this.passwordHash = adminUser.getPasswordHash();
		this.displayName = adminUser.getDisplayName();
		this.active = adminUser.isActive();
	}

	public Long getAdminId() { return adminId; }
	public String getEmail() { return email; }
	public String getDisplayName() { return displayName; }

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
	}

	@Override
	public String getPassword() { return passwordHash; }

	@Override
	public String getUsername() { return email; }

	@Override
	public boolean isAccountNonExpired() { return true; }

	@Override
	public boolean isAccountNonLocked() { return true; }

	@Override
	public boolean isCredentialsNonExpired() { return true; }

	@Override
	public boolean isEnabled() { return active; }
}
