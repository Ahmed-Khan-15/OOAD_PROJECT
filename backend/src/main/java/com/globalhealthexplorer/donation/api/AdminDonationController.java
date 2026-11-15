package com.globalhealthexplorer.donation.api;

import com.globalhealthexplorer.donation.service.DonationService;
import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/donations")
public class AdminDonationController {

	private final DonationService donationService;

	public AdminDonationController(DonationService donationService) { this.donationService = donationService; }

	@GetMapping
	public EditorialPageResponse<AdminDonationResponse> list(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return donationService.list(page, size);
	}

	@GetMapping("/summary")
	public DonationSummaryResponse summary() { return donationService.summary(); }

	@GetMapping("/{reference}")
	public AdminDonationResponse get(@PathVariable String reference) { return donationService.get(reference); }
}
