package com.globalhealthexplorer.imports.api;

import java.util.Map;

public record ImportRowErrorResponse(
		Integer rowNumber,
		String code,
		String message,
		Map<String, Object> rawRow) {
}
