package com.globalhealthexplorer.dataset.repository;

import com.globalhealthexplorer.dataset.model.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DatasetRepository extends JpaRepository<Dataset, Long> {

	List<Dataset> findAllByOrderByNameAsc();

	List<Dataset> findAllByActiveTrueOrderByNameAsc();

	Optional<Dataset> findBySlug(String slug);

	Optional<Dataset> findBySlugAndActiveTrue(String slug);

	boolean existsBySlug(String slug);

	@Query("select dataset from Dataset dataset join dataset.dataSource source "
			+ "where dataset.active = true and source.active = true and "
			+ "(lower(dataset.name) like :pattern or lower(coalesce(dataset.description, '')) like :pattern)")
	Page<Dataset> searchPublic(@Param("pattern") String pattern, Pageable pageable);
}
