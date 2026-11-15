package com.globalhealthexplorer.donation.api;

import java.math.BigDecimal;

public record DonationSummaryResponse(
		long donationCount,
		BigDecimal simulatedTotal,
		String currency,
		long oneTimeCount,
		long monthlyCommitmentCount,
		long simulatedSuccessCount,
		boolean simulated) { }
