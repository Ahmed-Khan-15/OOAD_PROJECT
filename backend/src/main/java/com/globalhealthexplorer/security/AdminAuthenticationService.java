package com.globalhealthexplorer.security;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AdminAuthenticationService {

	private final AuthenticationManager authenticationManager;
	private final AdminUserRepository adminUserRepository;

	public AdminAuthenticationService(
			AuthenticationManager authenticationManager,
			AdminUserRepository adminUserRepository) {
		this.authenticationManager = authenticationManager;
		this.adminUserRepository = adminUserRepository;
	}

	@Transactional
	public AdminPrincipal authenticate(String email, String password) {
		String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
		Authentication authentication = authenticationManager.authenticate(
				UsernamePasswordAuthenticationToken.unauthenticated(normalizedEmail, password));
		AdminPrincipal principal = (AdminPrincipal) authentication.getPrincipal();
		adminUserRepository.updateLastLogin(principal.getAdminId());
		return principal;
	}
}
