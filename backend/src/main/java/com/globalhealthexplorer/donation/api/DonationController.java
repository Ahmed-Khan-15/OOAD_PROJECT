package com.globalhealthexplorer.donation.api;

import com.globalhealthexplorer.donation.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/donations")
public class DonationController {

	private final DonationService donationService;

	public DonationController(DonationService donationService) { this.donationService = donationService; }

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public DonationReceiptResponse submit(@Valid @RequestBody DonationRequest request) {
		return donationService.submit(request);
	}
}
