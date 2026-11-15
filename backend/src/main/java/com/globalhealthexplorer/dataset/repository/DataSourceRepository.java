package com.globalhealthexplorer.dataset.repository;

import com.globalhealthexplorer.dataset.model.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DataSourceRepository extends JpaRepository<DataSource, Long> {

	List<DataSource> findAllByActiveTrueOrderByNameAsc();

	@Query("select source from DataSource source where source.active = true and "
			+ "(lower(source.name) like :pattern or lower(coalesce(source.description, '')) like :pattern)")
	Page<DataSource> searchActive(@Param("pattern") String pattern, Pageable pageable);
}
