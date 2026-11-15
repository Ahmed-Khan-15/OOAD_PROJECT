package com.globalhealthexplorer.imports.repository;

import com.globalhealthexplorer.imports.model.ImportError;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportErrorRepository extends JpaRepository<ImportError, Long> {

	List<ImportError> findAllByImportBatchIdOrderByRowNumberAscIdAsc(Long importBatchId);
}
