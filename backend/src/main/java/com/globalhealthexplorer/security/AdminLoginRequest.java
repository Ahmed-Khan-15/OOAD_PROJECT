package com.globalhealthexplorer.security;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminLoginRequest(
		@NotBlank @Email @Size(max = 254) String email,
		@NotBlank @Size(max = 100) String password) {

	@Override
	public String toString() {
		return "AdminLoginRequest[email=" + email + ", password=[REDACTED]]";
	}
}
