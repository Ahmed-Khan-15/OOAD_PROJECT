package com.globalhealthexplorer.donation.service;

import com.globalhealthexplorer.common.ResourceNotFoundException;
import com.globalhealthexplorer.donation.api.AdminDonationResponse;
import com.globalhealthexplorer.donation.api.DonationReceiptResponse;
import com.globalhealthexplorer.donation.api.DonationRequest;
import com.globalhealthexplorer.donation.api.DonationSummaryResponse;
import com.globalhealthexplorer.donation.model.Donation;
import com.globalhealthexplorer.donation.repository.DonationRepository;
import com.globalhealthexplorer.editorial.api.EditorialPageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

/** Records demonstration-only commitments and keeps donor PII in administrator responses only. */
@Service
@Transactional(readOnly = true)
public class DonationService {

	private final DonationRepository donationRepository;

	public DonationService(DonationRepository donationRepository) { this.donationRepository = donationRepository; }

	@Transactional
	public DonationReceiptResponse submit(DonationRequest request) {
		String frequency = request.frequency().trim().toUpperCase(Locale.ROOT);
		if (!frequency.equals("ONCE") && !frequency.equals("MONTHLY")) {
			throw new IllegalArgumentException("frequency must be ONCE or MONTHLY.");
		}
		String reference = newReference();
		Donation donation = donationRepository.saveAndFlush(new Donation(reference, request.donorName().trim(),
				request.email().trim().toLowerCase(Locale.ROOT), request.amount(), frequency,
				request.anonymous(), Instant.now()));
		String message = frequency.equals("MONTHLY")
				? "Simulated demonstration only. No payment was processed; monthly support is a non-billing commitment."
				: "Simulated demonstration only. No payment was processed and no money was charged.";
		return new DonationReceiptResponse(donation.getReference(), donation.getAmount(), donation.getCurrency(),
				donation.getFrequency(), donation.getStatus(), donation.getCreatedAt(), true, message);
	}

	public EditorialPageResponse<AdminDonationResponse> list(int page, int size) {
		validatePage(page, size);
		Page<Donation> results = donationRepository.findAllByOrderByCreatedAtDesc(
				PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by("id"))));
		return new EditorialPageResponse<>(results.getContent().stream().map(this::toAdminResponse).toList(),
				results.getNumber(), results.getSize(), results.getTotalElements(), results.getTotalPages(), results.hasNext());
	}

	public AdminDonationResponse get(String reference) {
		return donationRepository.findByReference(reference).map(this::toAdminResponse)
				.orElseThrow(() -> new ResourceNotFoundException("Donation", reference));
	}

	public DonationSummaryResponse summary() {
		return new DonationSummaryResponse(donationRepository.count(), donationRepository.sumSimulatedAmount(), "USD",
				donationRepository.countByFrequency("ONCE"), donationRepository.countByFrequency("MONTHLY"),
				donationRepository.countByStatus("SIMULATED_SUCCESS"), true);
	}

	private String newReference() {
		String year = Integer.toString(LocalDate.now(ZoneOffset.UTC).getYear());
		for (int attempt = 0; attempt < 5; attempt++) {
			String reference = "GHE-" + year + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
			if (!donationRepository.existsByReference(reference)) return reference;
		}
		throw new IllegalStateException("Could not generate a unique simulated donation reference.");
	}

	private AdminDonationResponse toAdminResponse(Donation donation) {
		return new AdminDonationResponse(donation.getReference(), donation.getDonorName(), donation.getEmail(),
				donation.getAmount(), donation.getCurrency(), donation.getFrequency(), donation.isAnonymous(),
				donation.getStatus(), donation.getCreatedAt(), true);
	}

	private void validatePage(int page, int size) {
		if (page < 0) throw new IllegalArgumentException("page must be zero or greater.");
		if (size < 1 || size > 100) throw new IllegalArgumentException("size must be between 1 and 100.");
	}
}
