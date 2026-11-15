package com.globalhealthexplorer.catalogue.repository;

import com.globalhealthexplorer.catalogue.model.Indicator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface IndicatorRepository extends JpaRepository<Indicator, Long> {

	@Query("""
			select indicator
			from Indicator indicator
			join fetch indicator.topic topic
			where indicator.active = true and topic.active = true
			order by topic.displayOrder, indicator.displayOrder, indicator.name
			""")
	List<Indicator> findAllActiveWithTopic();

	@Query("""
			select indicator
			from Indicator indicator
			join fetch indicator.topic topic
			where indicator.slug = :slug and indicator.active = true and topic.active = true
			""")
	Optional<Indicator> findActiveBySlugWithTopic(String slug);

	@Query(value = """
			select distinct indicator.slug
			from indicators indicator
			join health_observations observation on observation.indicator_id = indicator.id
			join datasets dataset on dataset.id = observation.dataset_id
			join data_sources source on source.id = dataset.data_source_id
			join countries country on country.id = observation.country_id
			where indicator.is_active = true
			  and dataset.is_active = true
			  and source.is_active = true
			  and country.is_active = true
			""", nativeQuery = true)
	Set<String> findSlugsWithActiveObservations();

	@Query("""
			select indicator from Indicator indicator join fetch indicator.topic topic
			where indicator.active = true and topic.active = true and
			(lower(indicator.name) like :pattern or lower(coalesce(indicator.description, '')) like :pattern
			 or lower(indicator.unit) like :pattern or lower(topic.name) like :pattern)
			""")
	Page<Indicator> searchActive(@Param("pattern") String pattern, Pageable pageable);

	@Query("""
			select indicator
			from Indicator indicator
			join fetch indicator.topic topic
			where topic.slug = :topicSlug and topic.active = true
			  and indicator.active = true
			order by indicator.displayOrder, indicator.name
			""")
	List<Indicator> findActiveByTopicSlugWithTopic(String topicSlug);
}
