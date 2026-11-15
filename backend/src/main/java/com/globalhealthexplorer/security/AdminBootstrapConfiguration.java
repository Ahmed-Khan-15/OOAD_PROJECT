package com.globalhealthexplorer.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

/** Creates the first administrator only when an operator explicitly enables the one-time bootstrap. */
@Configuration
public class AdminBootstrapConfiguration {

	@Bean
	@ConditionalOnProperty(prefix = "app.admin.bootstrap", name = "enabled", havingValue = "true")
	ApplicationRunner bootstrapFirstAdministrator(
			AdminUserRepository adminUserRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.admin.bootstrap.email:}") String email,
			@Value("${app.admin.bootstrap.password:}") String password,
			@Value("${app.admin.bootstrap.display-name:}") String displayName) {
		return arguments -> {
			String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
			if (normalizedEmail.isBlank() || password.length() < 12 || displayName.isBlank()) {
				throw new IllegalStateException(
						"Admin bootstrap requires an email, display name, and password of at least 12 characters.");
			}
			if (adminUserRepository.count() != 0) {
				throw new IllegalStateException(
						"Admin bootstrap is enabled but admin_users already contains an account; disable bootstrap.");
			}
			adminUserRepository.save(new AdminUser(
					normalizedEmail, passwordEncoder.encode(password), displayName.trim()));
		};
	}
}
