package com.globalhealthexplorer.imports.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "import_errors")
public class ImportError {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "import_batch_id", nullable = false)
	private ImportBatch importBatch;

	@Column(name = "row_number")
	private Integer rowNumber;

	@Column(name = "error_code", length = 80)
	private String errorCode;

	@Column(name = "error_message", nullable = false, columnDefinition = "text")
	private String errorMessage;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "raw_row", columnDefinition = "jsonb")
	private Map<String, Object> rawRow;

	protected ImportError() {
	}

	public ImportError(ImportBatch importBatch, Integer rowNumber, String errorCode,
			String errorMessage, Map<String, Object> rawRow) {
		this.importBatch = importBatch;
		this.rowNumber = rowNumber;
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.rawRow = rawRow;
	}

	public Integer getRowNumber() { return rowNumber; }
	public String getErrorCode() { return errorCode; }
	public String getErrorMessage() { return errorMessage; }
	public Map<String, Object> getRawRow() { return rawRow; }
}
