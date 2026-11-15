package com.globalhealthexplorer.catalogue.repository;

import com.globalhealthexplorer.catalogue.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {

	List<Topic> findAllByActiveTrueOrderByDisplayOrderAsc();

	Optional<Topic> findBySlugAndActiveTrue(String slug);

	@Query("select topic from Topic topic where topic.active = true and "
			+ "(lower(topic.name) like :pattern or lower(coalesce(topic.description, '')) like :pattern)")
	Page<Topic> searchActive(@Param("pattern") String pattern, Pageable pageable);
}
