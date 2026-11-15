package com.globalhealthexplorer.donation.api;

import java.math.BigDecimal;
import java.time.Instant;

/** Administrator-only record, including private donor contact details. */
public record AdminDonationResponse(
		String reference,
		String donorName,
		String email,
		BigDecimal amount,
		String currency,
		String frequency,
		boolean anonymous,
		String status,
		Instant createdAt,
		boolean simulated) { }
