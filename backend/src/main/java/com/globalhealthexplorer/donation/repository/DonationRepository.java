package com.globalhealthexplorer.donation.repository;

import com.globalhealthexplorer.donation.model.Donation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface DonationRepository extends JpaRepository<Donation, Long> {
	Optional<Donation> findByReference(String reference);
	boolean existsByReference(String reference);
	Page<Donation> findAllByOrderByCreatedAtDesc(Pageable pageable);
	long countByStatus(String status);
	long countByFrequency(String frequency);
	@Query("select coalesce(sum(donation.amount), 0) from Donation donation where donation.status = 'SIMULATED_SUCCESS'")
	BigDecimal sumSimulatedAmount();
}
