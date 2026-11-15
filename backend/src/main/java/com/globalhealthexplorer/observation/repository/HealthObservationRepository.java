package com.globalhealthexplorer.observation.repository;

import com.globalhealthexplorer.observation.model.HealthObservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface HealthObservationRepository extends JpaRepository<HealthObservation, Long> {

	@Query(value = """
			select observation
			from HealthObservation observation
			join fetch observation.country country
			join fetch observation.indicator indicator
			join fetch indicator.topic topic
			join fetch observation.dataset dataset
			join fetch dataset.dataSource source
			left join fetch observation.sourceMapping sourceMapping
			left join fetch observation.importBatch batch
			where (:countryIso3 is null or country.iso3 = :countryIso3)
			  and (:indicatorSlug is null or indicator.slug = :indicatorSlug)
			  and (:datasetSlug is null or dataset.slug = :datasetSlug)
			  and (:fromYear is null or observation.referenceYear >= :fromYear)
			  and (:toYear is null or observation.referenceYear <= :toYear)
			  and country.active = true
			  and indicator.active = true
			  and topic.active = true
			  and dataset.active = true
			  and source.active = true
			  and observation.valueStatus <> 'UNKNOWN'
			  and (batch is null or batch.status in ('COMPLETED', 'COMPLETED_WITH_ERRORS'))
			""",
			countQuery = """
			select count(observation)
			from HealthObservation observation
			join observation.country country
			join observation.indicator indicator
			join indicator.topic topic
			join observation.dataset dataset
			join dataset.dataSource source
			left join observation.importBatch batch
			where (:countryIso3 is null or country.iso3 = :countryIso3)
			  and (:indicatorSlug is null or indicator.slug = :indicatorSlug)
			  and (:datasetSlug is null or dataset.slug = :datasetSlug)
			  and (:fromYear is null or observation.referenceYear >= :fromYear)
			  and (:toYear is null or observation.referenceYear <= :toYear)
			  and country.active = true and indicator.active = true and topic.active = true
			  and dataset.active = true and source.active = true
			  and observation.valueStatus <> 'UNKNOWN'
			  and (batch is null or batch.status in ('COMPLETED', 'COMPLETED_WITH_ERRORS'))
			""")
	Page<HealthObservation> search(
			@Param("countryIso3") String countryIso3,
			@Param("indicatorSlug") String indicatorSlug,
			@Param("datasetSlug") String datasetSlug,
			@Param("fromYear") Integer fromYear,
			@Param("toYear") Integer toYear,
			Pageable pageable);

	@Modifying
	@Query(value = """
			insert into health_observations (
				country_id, indicator_id, dataset_id, source_mapping_id, import_batch_id,
				reference_year, value, dimensions, value_status, uncertainty_lower,
				uncertainty_upper, original_value_text, observation_note
			) values (
				:countryId, :indicatorId, :datasetId, :sourceMappingId, :importBatchId,
				:referenceYear, :value, cast(:dimensions as jsonb), :valueStatus,
				:uncertaintyLower, :uncertaintyUpper, :originalValueText, :observationNote
			)
			on conflict (country_id, indicator_id, dataset_id, reference_year, dimensions) do nothing
			""", nativeQuery = true)
	int insertIfNotDuplicate(
			@Param("countryId") long countryId,
			@Param("indicatorId") long indicatorId,
			@Param("datasetId") long datasetId,
			@Param("sourceMappingId") Long sourceMappingId,
			@Param("importBatchId") long importBatchId,
			@Param("referenceYear") int referenceYear,
			@Param("value") BigDecimal value,
			@Param("dimensions") String dimensions,
			@Param("valueStatus") String valueStatus,
			@Param("uncertaintyLower") BigDecimal uncertaintyLower,
			@Param("uncertaintyUpper") BigDecimal uncertaintyUpper,
			@Param("originalValueText") String originalValueText,
			@Param("observationNote") String observationNote);
}
