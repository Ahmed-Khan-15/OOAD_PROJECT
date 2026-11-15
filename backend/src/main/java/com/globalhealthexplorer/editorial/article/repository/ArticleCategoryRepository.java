package com.globalhealthexplorer.editorial.article.repository;

import com.globalhealthexplorer.editorial.article.model.ArticleCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArticleCategoryRepository extends JpaRepository<ArticleCategory, Long> {
	Optional<ArticleCategory> findBySlug(String slug);
}
