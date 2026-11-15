package com.globalhealthexplorer.editorial.article.repository;

import com.globalhealthexplorer.editorial.article.model.ArticleTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArticleTagRepository extends JpaRepository<ArticleTag, Long> {
	Optional<ArticleTag> findBySlug(String slug);
}
