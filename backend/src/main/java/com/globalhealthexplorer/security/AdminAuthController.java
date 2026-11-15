package com.globalhealthexplorer.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/auth")
public class AdminAuthController {

	private final AdminAuthenticationService authenticationService;
	private final SecurityContextRepository securityContextRepository;
	private final SessionAuthenticationStrategy sessionAuthenticationStrategy;

	public AdminAuthController(
			AdminAuthenticationService authenticationService,
			SecurityContextRepository securityContextRepository,
			SessionAuthenticationStrategy sessionAuthenticationStrategy) {
		this.authenticationService = authenticationService;
		this.securityContextRepository = securityContextRepository;
		this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
	}

	@PostMapping("/login")
	public AdminSessionResponse login(
			@Valid @RequestBody AdminLoginRequest request,
			HttpServletRequest servletRequest,
			HttpServletResponse servletResponse) {
		try {
			AdminPrincipal principal = authenticationService.authenticate(request.email(), request.password());
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			var authentication = UsernamePasswordAuthenticationToken.authenticated(
					principal, null, principal.getAuthorities());
			sessionAuthenticationStrategy.onAuthentication(authentication, servletRequest, servletResponse);
			context.setAuthentication(authentication);
			SecurityContextHolder.setContext(context);
			securityContextRepository.saveContext(context, servletRequest, servletResponse);
			return AdminSessionResponse.from(principal);
		} catch (AuthenticationException exception) {
			ProblemDetail problem = ProblemDetail.forStatusAndDetail(
					HttpStatus.UNAUTHORIZED, "Email or password is invalid, or the account is inactive.");
			problem.setTitle("Authentication failed");
			problem.setType(URI.create("about:blank"));
			throw new org.springframework.web.ErrorResponseException(HttpStatus.UNAUTHORIZED, problem, exception);
		}
	}

	@GetMapping("/csrf")
	public Map<String, String> getCsrfToken(CsrfToken csrfToken) {
		return Map.of("headerName", csrfToken.getHeaderName(), "token", csrfToken.getToken());
	}

	@GetMapping("/me")
	public AdminSessionResponse getCurrentSession(Principal principal) {
		if (!(principal instanceof org.springframework.security.core.Authentication authentication)
				|| !(authentication.getPrincipal() instanceof AdminPrincipal adminPrincipal)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Administrator session is required.");
		}
		return AdminSessionResponse.from(adminPrincipal);
	}
}
