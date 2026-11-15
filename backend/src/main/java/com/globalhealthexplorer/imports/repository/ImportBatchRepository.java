package com.globalhealthexplorer.imports.repository;

import com.globalhealthexplorer.imports.model.ImportBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportBatchRepository extends JpaRepository<ImportBatch, Long> {

	List<ImportBatch> findAllByDatasetIdOrderByStartedAtDesc(Long datasetId);
}
