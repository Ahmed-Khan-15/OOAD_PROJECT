package com.globalhealthexplorer.donation.api;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public record DonationRequest(
		@NotBlank @Size(max = 160) String donorName,
		@NotBlank @Email @Size(max = 254) String email,
		@NotNull @DecimalMin("1.00") @DecimalMax("10000.00") @Digits(integer = 8, fraction = 2) BigDecimal amount,
		@NotBlank String frequency,
		@NotNull Boolean anonymous) {

	/** Rejects unexpected fields, including card data, rather than silently accepting it. */
	@JsonAnySetter
	public void rejectUnexpectedField(String name, Object value) {
		throw new IllegalArgumentException("Unsupported donation field: " + name);
	}
}
