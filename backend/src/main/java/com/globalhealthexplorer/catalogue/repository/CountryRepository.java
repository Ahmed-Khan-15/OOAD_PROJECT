package com.globalhealthexplorer.catalogue.repository;

import com.globalhealthexplorer.catalogue.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {

	List<Country> findAllByActiveTrueOrderByNameAsc();

	Optional<Country> findByIso3IgnoreCaseAndActiveTrue(String iso3);

	@Query("select country from Country country where country.active = true and "
			+ "(lower(country.name) like :pattern or lower(coalesce(country.region, '')) like :pattern)")
	Page<Country> searchActive(@Param("pattern") String pattern, Pageable pageable);
}
