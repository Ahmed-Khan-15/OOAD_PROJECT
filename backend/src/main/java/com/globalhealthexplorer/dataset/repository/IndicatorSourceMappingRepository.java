package com.globalhealthexplorer.dataset.repository;

import com.globalhealthexplorer.dataset.model.IndicatorSourceMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IndicatorSourceMappingRepository extends JpaRepository<IndicatorSourceMapping, Long> {

	List<IndicatorSourceMapping> findAllByDatasetIdOrderByIdAsc(Long datasetId);

	@Query("select count(observation) > 0 from HealthObservation observation where observation.sourceMapping.id = :mappingId")
	boolean hasObservations(@Param("mappingId") Long mappingId);
}
