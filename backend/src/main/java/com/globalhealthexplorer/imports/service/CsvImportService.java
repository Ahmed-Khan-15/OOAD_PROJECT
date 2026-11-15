package com.globalhealthexplorer.imports.service;

import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.catalogue.repository.CountryRepository;
import com.globalhealthexplorer.dataset.model.Dataset;
import com.globalhealthexplorer.dataset.model.IndicatorSourceMapping;
import com.globalhealthexplorer.dataset.repository.IndicatorSourceMappingRepository;
import com.globalhealthexplorer.dataset.service.DatasetService;
import com.globalhealthexplorer.imports.api.ImportBatchResponse;
import com.globalhealthexplorer.imports.api.ImportRowErrorResponse;
import com.globalhealthexplorer.imports.model.ImportBatch;
import com.globalhealthexplorer.imports.model.ImportError;
import com.globalhealthexplorer.imports.repository.ImportBatchRepository;
import com.globalhealthexplorer.imports.repository.ImportErrorRepository;
import com.globalhealthexplorer.observation.repository.HealthObservationRepository;
import com.globalhealthexplorer.security.AdminUser;
import com.globalhealthexplorer.security.AdminUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.HexFormat;

/** Validates dataset CSV files, records batch results, and writes only valid observations. */
@Service
public class CsvImportService {

	private static final int MAX_FILE_BYTES = 10 * 1024 * 1024;
	private static final Set<String> REQUIRED_HEADERS = Set.of("country_iso3", "indicator", "year", "value", "unit");
	private static final Set<String> ALLOWED_STATUSES = Set.of("REPORTED", "ESTIMATED", "MODELLED", "PROJECTED");

	private final DatasetService datasetService;
	private final IndicatorSourceMappingRepository mappingRepository;
	private final CountryRepository countryRepository;
	private final AdminUserRepository adminUserRepository;
	private final ImportBatchRepository batchRepository;
	private final ImportErrorRepository errorRepository;
	private final HealthObservationRepository observationRepository;
	private final ObjectMapper objectMapper;
	private final CsvDocumentParser csvParser = new CsvDocumentParser();

	public CsvImportService(
			DatasetService datasetService,
			IndicatorSourceMappingRepository mappingRepository,
			CountryRepository countryRepository,
			AdminUserRepository adminUserRepository,
			ImportBatchRepository batchRepository,
			ImportErrorRepository errorRepository,
			HealthObservationRepository observationRepository,
			ObjectMapper objectMapper) {
		this.datasetService = datasetService;
		this.mappingRepository = mappingRepository;
		this.countryRepository = countryRepository;
		this.adminUserRepository = adminUserRepository;
		this.batchRepository = batchRepository;
		this.errorRepository = errorRepository;
		this.observationRepository = observationRepository;
		this.objectMapper = objectMapper;
	}

	@Transactional
	public ImportBatchResponse importCsv(String datasetSlug, MultipartFile file, String adminEmail) {
		if (file == null || file.isEmpty()) throw new IllegalArgumentException("Choose a non-empty CSV file.");
		if (file.getSize() > MAX_FILE_BYTES) throw new IllegalArgumentException("CSV files must be 10 MB or smaller.");
		String filename = safeFilename(file.getOriginalFilename());
		if (!filename.toLowerCase(Locale.ROOT).endsWith(".csv")) {
			throw new IllegalArgumentException("The uploaded file must use the .csv extension.");
		}

		Dataset dataset = datasetService.findDataset(datasetSlug);
		AdminUser admin = adminUserRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
		byte[] contents;
		try {
			contents = file.getBytes();
		} catch (IOException exception) {
			throw new IllegalArgumentException("The uploaded CSV could not be read.");
		}
		ImportBatch batch = batchRepository.saveAndFlush(new ImportBatch(
				dataset, admin, filename, sha256(contents), Instant.now()));
		List<ImportError> errors = new ArrayList<>();
		CsvDocumentParser.ParsedDocument document;
		try {
			String csv = StandardCharsets.UTF_8.newDecoder()
					.onMalformedInput(CodingErrorAction.REPORT)
					.onUnmappableCharacter(CodingErrorAction.REPORT)
					.decode(ByteBuffer.wrap(contents)).toString();
			document = csvParser.parse(csv);
			List<String> normalizedHeaders = normalizeHeaders(document.headers());
			Set<String> missingHeaders = new HashSet<>(REQUIRED_HEADERS);
			missingHeaders.removeAll(normalizedHeaders);
			if (!missingHeaders.isEmpty()) {
				throw new IllegalArgumentException("CSV is missing required columns: " + String.join(", ", missingHeaders) + ".");
			}
		} catch (CharacterCodingException | IllegalArgumentException exception) {
			String message = exception.getMessage() == null ? "CSV structure is invalid." : exception.getMessage();
			errors.add(new ImportError(batch, null, "INVALID_FILE", message, null));
			batch.complete("FAILED", Instant.now(), 0, 0, 0, 0, message);
			errorRepository.saveAll(errors);
			return toResponse(batch, errors);
		}

		List<String> headers = normalizeHeaders(document.headers());
		Map<String, Integer> columnIndexes = new HashMap<>();
		for (int index = 0; index < headers.size(); index++) columnIndexes.put(headers.get(index), index);
		List<IndicatorSourceMapping> mappings = mappingRepository.findAllByDatasetIdOrderByIdAsc(dataset.getId());
		Map<String, List<IndicatorSourceMapping>> mappingsByKey = buildMappingLookup(mappings);
		Set<String> seenInFile = new HashSet<>();
		int accepted = 0;
		int rejected = 0;
		int duplicates = 0;
		int total = document.rows().size();

		for (CsvDocumentParser.ParsedRow row : document.rows()) {
			Map<String, Object> rawRow = rawRow(headers, row.cells());
			try {
				if (row.cells().size() > headers.size()) {
					throw rowError("INVALID_ROW", "Row has more values than the header.");
				}
				ValidatedObservation observation = validateRow(dataset, row, columnIndexes, mappingsByKey);
				String key = observation.identityKey();
				if (!seenInFile.add(key)) {
					duplicates++;
					errors.add(new ImportError(batch, row.lineNumber(), "DUPLICATE_OBSERVATION",
							"This file repeats the same country, indicator, year, and dimensions.", rawRow));
					continue;
				}
			int inserted = observationRepository.insertIfNotDuplicate(
					observation.country().getId(), observation.indicator().getId(), dataset.getId(),
					observation.mapping().getId(), batch.getId(), observation.year(), observation.value(),
					observation.dimensionsJson(), observation.valueStatus(), observation.uncertaintyLower(),
					observation.uncertaintyUpper(), observation.originalValueText(), observation.note());
			if (inserted == 1) {
				accepted++;
			} else {
				duplicates++;
				errors.add(new ImportError(batch, row.lineNumber(), "DUPLICATE_OBSERVATION",
						"An observation with this dataset, country, indicator, year, and dimensions already exists.", rawRow));
			}
			} catch (RowValidationException exception) {
				rejected++;
				errors.add(new ImportError(batch, row.lineNumber(), exception.code(), exception.getMessage(), rawRow));
			}
		}

		String status = rejected == 0 && duplicates == 0 ? "COMPLETED" : "COMPLETED_WITH_ERRORS";
		String summary = "Accepted " + accepted + ", rejected " + rejected + ", duplicate " + duplicates + " of " + total + " rows.";
		batch.complete(status, Instant.now(), total, accepted, rejected, duplicates, summary);
		if (!errors.isEmpty()) errorRepository.saveAll(errors);
		return toResponse(batch, errors);
	}

	@Transactional(readOnly = true)
	public List<ImportBatchResponse> getImports(String datasetSlug) {
		Dataset dataset = datasetService.findDataset(datasetSlug);
		return batchRepository.findAllByDatasetIdOrderByStartedAtDesc(dataset.getId()).stream()
				.map(batch -> toResponse(batch,
						errorRepository.findAllByImportBatchIdOrderByRowNumberAscIdAsc(batch.getId())))
				.toList();
	}

	private ValidatedObservation validateRow(
			Dataset dataset,
			CsvDocumentParser.ParsedRow row,
			Map<String, Integer> columns,
			Map<String, List<IndicatorSourceMapping>> mappingsByKey) {
		String countryCode = value(row, columns, "country_iso3").toUpperCase(Locale.ROOT);
		Country country = countryRepository.findByIso3IgnoreCaseAndActiveTrue(countryCode)
				.orElseThrow(() -> rowError("UNKNOWN_COUNTRY", "Unknown or inactive ISO-3 country code: " + countryCode + "."));

		String indicatorKey = value(row, columns, "indicator").toLowerCase(Locale.ROOT);
		List<IndicatorSourceMapping> candidates = mappingsByKey.getOrDefault(indicatorKey, List.of());
		if (candidates.isEmpty()) {
			throw rowError("UNMAPPED_INDICATOR", "Indicator value is not mapped by this dataset: " + value(row, columns, "indicator") + ".");
		}
		if (candidates.size() != 1) throw rowError("AMBIGUOUS_MAPPING", "This indicator key maps to more than one dataset indicator.");
		IndicatorSourceMapping mapping = candidates.getFirst();
		Indicator indicator = mapping.getIndicator();
		String sourceUnit = mapping.getOriginalUnit();
		if (sourceUnit == null || !sourceUnit.equals(indicator.getUnit())) {
			throw rowError("UNIT_CONVERSION_UNSUPPORTED",
					"Dataset mapping unit does not match the canonical indicator unit; automatic unit conversion is not supported.");
		}
		String rowUnit = value(row, columns, "unit");
		if (!sourceUnit.equals(rowUnit)) {
			throw rowError("UNIT_MISMATCH", "CSV unit must exactly match the dataset mapping unit: " + sourceUnit + ".");
		}

		int year;
		try {
			year = Integer.parseInt(value(row, columns, "year"));
		} catch (NumberFormatException exception) {
			throw rowError("INVALID_YEAR", "Year must be a whole number.");
		}
		if (year < 1800 || year > 2200) throw rowError("INVALID_YEAR", "Year must be between 1800 and 2200.");
		if (dataset.getCoverageStartYear() != null && year < dataset.getCoverageStartYear()
				|| dataset.getCoverageEndYear() != null && year > dataset.getCoverageEndYear()) {
			throw rowError("YEAR_OUTSIDE_COVERAGE", "Year is outside the dataset coverage.");
		}

		BigDecimal numericValue = decimal(value(row, columns, "value"), "INVALID_VALUE", "Value must be a finite decimal number.");
		validatePrecision(numericValue, "value");
		String status = value(row, columns, "value_status");
		status = status.isBlank() ? "REPORTED" : status.toUpperCase(Locale.ROOT);
		if (!ALLOWED_STATUSES.contains(status)) {
			throw rowError("INVALID_VALUE_STATUS", "value_status must be REPORTED, ESTIMATED, MODELLED, or PROJECTED.");
		}
		Map<String, Object> dimensions = parseDimensions(value(row, columns, "dimensions"));
		BigDecimal lower = optionalDecimal(value(row, columns, "uncertainty_lower"), "uncertainty_lower");
		BigDecimal upper = optionalDecimal(value(row, columns, "uncertainty_upper"), "uncertainty_upper");
		if (lower != null && lower.compareTo(numericValue) > 0
				|| upper != null && upper.compareTo(numericValue) < 0
				|| lower != null && upper != null && lower.compareTo(upper) > 0) {
			throw rowError("INVALID_UNCERTAINTY", "Uncertainty bounds must contain the observation value and be ordered.");
		}
		validatePrecision(lower, "uncertainty_lower");
		validatePrecision(upper, "uncertainty_upper");
		String dimensionsJson = writeJson(new TreeMap<>(dimensions));
		String identity = country.getIso3() + "|" + indicator.getSlug() + "|" + year + "|" + dimensionsJson;
		return new ValidatedObservation(country, indicator, mapping, year, numericValue, dimensionsJson,
				status, lower, upper, value(row, columns, "value"), nullableValue(row, columns, "notes"), identity);
	}

	private Map<String, List<IndicatorSourceMapping>> buildMappingLookup(List<IndicatorSourceMapping> mappings) {
		Map<String, List<IndicatorSourceMapping>> result = new HashMap<>();
		for (IndicatorSourceMapping mapping : mappings) {
			addMappingKey(result, mapping.getIndicator().getSlug(), mapping);
			if (mapping.getOriginalIndicatorCode() != null && !mapping.getOriginalIndicatorCode().isBlank()) {
				addMappingKey(result, mapping.getOriginalIndicatorCode(), mapping);
			}
		}
		return result;
	}

	private void addMappingKey(Map<String, List<IndicatorSourceMapping>> lookup, String key,
			IndicatorSourceMapping mapping) {
		List<IndicatorSourceMapping> current = lookup.computeIfAbsent(key.toLowerCase(Locale.ROOT), ignored -> new ArrayList<>());
		if (current.stream().noneMatch(existing -> existing.getId().equals(mapping.getId()))) current.add(mapping);
	}

	private Map<String, Object> parseDimensions(String json) {
		if (json.isBlank()) return Map.of();
		try {
			Object parsed = objectMapper.readValue(json, Map.class);
			if (!(parsed instanceof Map<?, ?> raw)) throw rowError("INVALID_DIMENSIONS", "dimensions must be a JSON object.");
			Map<String, Object> dimensions = new TreeMap<>();
			if (raw.size() > 30) throw rowError("INVALID_DIMENSIONS", "dimensions may contain at most 30 entries.");
			for (Map.Entry<?, ?> entry : raw.entrySet()) {
				if (!(entry.getKey() instanceof String key) || key.isBlank() || key.length() > 120) {
					throw rowError("INVALID_DIMENSIONS", "Dimension names must be non-empty strings of at most 120 characters.");
				}
				Object item = entry.getValue();
				if (item == null || item instanceof Map<?, ?> || item instanceof List<?>) {
					throw rowError("INVALID_DIMENSIONS", "Dimension values must be non-null scalar values.");
				}
				dimensions.put(key.trim(), item);
			}
			return dimensions;
		} catch (JacksonException exception) {
			throw rowError("INVALID_DIMENSIONS", "dimensions must be valid JSON object text.");
		}
	}

	private BigDecimal optionalDecimal(String input, String field) {
		return input.isBlank() ? null : decimal(input, "INVALID_UNCERTAINTY", field + " must be a finite decimal number.");
	}

	private BigDecimal decimal(String input, String code, String message) {
		try {
			if (input.isBlank()) throw new NumberFormatException();
			return new BigDecimal(input);
		} catch (NumberFormatException exception) {
			throw rowError(code, message);
		}
	}

	private void validatePrecision(BigDecimal value, String field) {
		if (value == null) return;
		if (value.precision() > 22 || Math.max(value.scale(), 0) > 8) {
			throw rowError("VALUE_PRECISION_EXCEEDED", field + " supports at most 22 digits and 8 decimal places.");
		}
	}

	private String value(CsvDocumentParser.ParsedRow row, Map<String, Integer> columns, String name) {
		Integer index = columns.get(name);
		if (index == null || index >= row.cells().size()) return "";
		return row.cells().get(index).trim();
	}

	private String nullableValue(CsvDocumentParser.ParsedRow row, Map<String, Integer> columns, String name) {
		String text = value(row, columns, name);
		return text.isBlank() ? null : text;
	}

	private Map<String, Object> rawRow(List<String> headers, List<String> cells) {
		Map<String, Object> raw = new LinkedHashMap<>();
		for (int index = 0; index < headers.size(); index++) {
			raw.put(headers.get(index), index < cells.size() ? cells.get(index) : "");
		}
		for (int index = headers.size(); index < cells.size(); index++) raw.put("extra_" + (index + 1), cells.get(index));
		return raw;
	}

	private List<String> normalizeHeaders(List<String> headers) {
		List<String> normalized = headers.stream().map(header -> header.trim().toLowerCase(Locale.ROOT)).toList();
		if (normalized.stream().anyMatch(String::isBlank)) throw new IllegalArgumentException("CSV headers must not be blank.");
		if (new HashSet<>(normalized).size() != normalized.size()) throw new IllegalArgumentException("CSV header names must be unique.");
		return normalized;
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (JacksonException exception) {
			throw new IllegalStateException("Could not serialize normalized CSV data.", exception);
		}
	}

	private String sha256(byte[] bytes) {
		try {
			return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
		} catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is not available in this Java runtime.", exception);
		}
	}

	private String safeFilename(String filename) {
		if (filename == null || filename.isBlank()) return "upload.csv";
		String basename = filename.replace('\\', '/');
		basename = basename.substring(basename.lastIndexOf('/') + 1);
		return basename.length() > 255 ? basename.substring(basename.length() - 255) : basename;
	}

	private ImportBatchResponse toResponse(ImportBatch batch, List<ImportError> errors) {
		return new ImportBatchResponse(batch.getDataset().getSlug(), batch.getStatus(),
				batch.getOriginalFilename(), batch.getFileChecksum(), batch.getStartedAt(), batch.getCompletedAt(),
				batch.getTotalRows(), batch.getAcceptedRows(), batch.getRejectedRows(), batch.getDuplicateRows(),
				batch.getSummary(), errors.stream().map(error -> new ImportRowErrorResponse(error.getRowNumber(),
						error.getErrorCode(), error.getErrorMessage(), error.getRawRow())).toList());
	}

	private RowValidationException rowError(String code, String message) {
		return new RowValidationException(code, message);
	}

	private record ValidatedObservation(Country country, Indicator indicator, IndicatorSourceMapping mapping,
			int year, BigDecimal value, String dimensionsJson, String valueStatus,
			BigDecimal uncertaintyLower, BigDecimal uncertaintyUpper, String originalValueText,
			String note, String identityKey) {
	}

	private static class RowValidationException extends RuntimeException {
		private final String code;
		private RowValidationException(String code, String message) {
			super(message);
			this.code = code;
		}
		private String code() { return code; }
	}
}
