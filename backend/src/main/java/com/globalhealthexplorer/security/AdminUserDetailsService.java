package com.globalhealthexplorer.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdminUserDetailsService implements UserDetailsService {

	private final AdminUserRepository adminUserRepository;

	public AdminUserDetailsService(AdminUserRepository adminUserRepository) {
		this.adminUserRepository = adminUserRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return adminUserRepository.findByEmailIgnoreCase(email.trim())
				.map(AdminPrincipal::new)
				.orElseThrow(() -> new UsernameNotFoundException("Administrator account was not found."));
	}
}
