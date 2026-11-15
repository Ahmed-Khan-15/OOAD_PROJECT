package com.globalhealthexplorer.security;

public record AdminSessionResponse(String email, String displayName) {

	public static AdminSessionResponse from(AdminPrincipal principal) {
		return new AdminSessionResponse(principal.getEmail(), principal.getDisplayName());
	}
}
