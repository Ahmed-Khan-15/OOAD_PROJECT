package com.globalhealthexplorer.editorial.article.repository;

import com.globalhealthexplorer.editorial.article.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

	Optional<Article> findBySlug(String slug);

	Optional<Article> findBySlugAndStatus(String slug, String status);

	boolean existsBySlug(String slug);

	List<Article> findAllByOrderByUpdatedAtDesc();

	@Query("""
			select distinct article from Article article
			left join article.tags tag
			where article.status = 'PUBLISHED'
			  and (:categorySlug is null or article.category.slug = :categorySlug)
			  and (:tagSlug is null or tag.slug = :tagSlug)
			""")
	Page<Article> findPublished(
			@Param("categorySlug") String categorySlug,
			@Param("tagSlug") String tagSlug,
			Pageable pageable);

	@Query("""
			select distinct article from Article article
			left join article.tags tag
			where (:categorySlug is null or article.category.slug = :categorySlug)
			  and (:tagSlug is null or tag.slug = :tagSlug)
			""")
	Page<Article> findAdminFiltered(
			@Param("categorySlug") String categorySlug,
			@Param("tagSlug") String tagSlug,
			Pageable pageable);

	@Query("""
			select distinct article from Article article left join article.tags tag
			where article.status = 'PUBLISHED' and
			(lower(article.title) like :pattern or lower(coalesce(article.subtitle, '')) like :pattern
			 or lower(coalesce(article.introduction, '')) like :pattern or lower(tag.name) like :pattern)
			""")
	Page<Article> searchPublic(@Param("pattern") String pattern, Pageable pageable);
}
