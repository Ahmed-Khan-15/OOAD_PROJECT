package com.globalhealthexplorer.donation.api;

import java.math.BigDecimal;
import java.time.Instant;

/** Public receipt response contains no donor contact details. */
public record DonationReceiptResponse(
		String reference,
		BigDecimal amount,
		String currency,
		String frequency,
		String status,
		Instant createdAt,
		boolean simulated,
		String receiptMessage) { }
