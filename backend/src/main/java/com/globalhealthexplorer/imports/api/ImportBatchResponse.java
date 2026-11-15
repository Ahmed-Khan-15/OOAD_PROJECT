package com.globalhealthexplorer.imports.api;

import java.time.Instant;
import java.util.List;

public record ImportBatchResponse(
		String datasetId,
		String status,
		String filename,
		String checksum,
		Instant startedAt,
		Instant completedAt,
		int totalRows,
		int acceptedRows,
		int rejectedRows,
		int duplicateRows,
		String summary,
		List<ImportRowErrorResponse> errors) {
}
