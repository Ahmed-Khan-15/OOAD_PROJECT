package com.globalhealthexplorer.editorial.glossary.repository;

import com.globalhealthexplorer.editorial.glossary.model.GlossaryTerm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GlossaryTermRepository extends JpaRepository<GlossaryTerm, Long> {

	Optional<GlossaryTerm> findBySlug(String slug);
	boolean existsBySlug(String slug);
	Page<GlossaryTerm> findAllByOrderByTermAsc(Pageable pageable);

	@Query("""
			select term from GlossaryTerm term
			where :keyword is null
			   or lower(term.term) like concat('%', lower(:keyword), '%')
			   or lower(term.definition) like concat('%', lower(:keyword), '%')
			   or lower(coalesce(term.extendedExplanation, '')) like concat('%', lower(:keyword), '%')
			""")
	Page<GlossaryTerm> search(@Param("keyword") String keyword, Pageable pageable);

	@Query("""
			select term from GlossaryTerm term where
			(lower(term.term) like :pattern or lower(term.definition) like :pattern
			 or lower(coalesce(term.extendedExplanation, '')) like :pattern)
			""")
	Page<GlossaryTerm> searchPublic(@Param("pattern") String pattern, Pageable pageable);
}
