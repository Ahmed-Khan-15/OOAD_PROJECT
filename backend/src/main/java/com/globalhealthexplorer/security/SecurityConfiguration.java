package com.globalhealthexplorer.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfiguration {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	AuthenticationManager authenticationManager(
			AdminUserDetailsService adminUserDetailsService,
			PasswordEncoder passwordEncoder) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider(adminUserDetailsService);
		provider.setPasswordEncoder(passwordEncoder);
		return new ProviderManager(provider);
	}

	@Bean
	SecurityContextRepository securityContextRepository() {
		return new HttpSessionSecurityContextRepository();
	}

	@Bean
	SessionAuthenticationStrategy sessionAuthenticationStrategy() {
		return new ChangeSessionIdAuthenticationStrategy();
	}

	@Bean
	CsrfTokenRepository csrfTokenRepository() {
		HttpSessionCsrfTokenRepository repository = new HttpSessionCsrfTokenRepository();
		repository.setHeaderName("X-CSRF-TOKEN");
		return repository;
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(
			@Value("${app.cors.allowed-origins}") String allowedOrigins) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
				.map(String::trim)
				.filter(origin -> !origin.isEmpty())
				.toList());
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "X-CSRF-TOKEN"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", configuration);
		return source;
	}

	@Bean
	SecurityFilterChain applicationSecurity(
			HttpSecurity http,
			SecurityContextRepository securityContextRepository,
			CsrfTokenRepository csrfTokenRepository,
			CorsConfigurationSource corsConfigurationSource) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.csrfTokenRepository(csrfTokenRepository))
				.securityContext(context -> context.securityContextRepository(securityContextRepository))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers("/api/v1/admin/auth/login", "/api/v1/admin/auth/csrf").permitAll()
						.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/v1/**").permitAll()
						.anyRequest().permitAll())
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint((request, response, exception) -> {
							response.setStatus(401);
							response.setContentType("application/json");
							response.getWriter().write(
									"{\"title\":\"Unauthorized\",\"status\":401,\"detail\":\"Administrator authentication is required.\"}");
						})
						.accessDeniedHandler((request, response, exception) -> {
							response.setStatus(403);
							response.setContentType("application/json");
							response.getWriter().write(
									"{\"title\":\"Forbidden\",\"status\":403,\"detail\":\"The request is not allowed.\"}");
						}))
				.logout(logout -> logout
						.logoutUrl("/api/v1/admin/auth/logout")
						.logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)));

		return http.build();
	}
}
