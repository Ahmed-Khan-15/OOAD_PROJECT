package com.globalhealthexplorer.imports.model;

import com.globalhealthexplorer.dataset.model.Dataset;
import com.globalhealthexplorer.security.AdminUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "import_batches")
public class ImportBatch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "dataset_id", nullable = false)
	private Dataset dataset;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "initiated_by")
	private AdminUser initiatedBy;

	@Column(name = "import_method", nullable = false, length = 20)
	private String importMethod;

	@Column(nullable = false, length = 24)
	private String status;

	@Column(name = "original_filename", length = 255)
	private String originalFilename;

	@Column(name = "file_checksum", length = 128)
	private String fileChecksum;

	@Column(name = "started_at")
	private Instant startedAt;

	@Column(name = "completed_at")
	private Instant completedAt;

	@Column(name = "total_rows", nullable = false)
	private int totalRows;

	@Column(name = "accepted_rows", nullable = false)
	private int acceptedRows;

	@Column(name = "rejected_rows", nullable = false)
	private int rejectedRows;

	@Column(name = "duplicate_rows", nullable = false)
	private int duplicateRows;

	@Column(columnDefinition = "text")
	private String summary;

	protected ImportBatch() {
	}

	public ImportBatch(Dataset dataset, AdminUser initiatedBy, String filename, String checksum, Instant startedAt) {
		this.dataset = dataset;
		this.initiatedBy = initiatedBy;
		this.importMethod = "ADMIN_CSV";
		this.status = "PROCESSING";
		this.originalFilename = filename;
		this.fileChecksum = checksum;
		this.startedAt = startedAt;
	}

	public void complete(String status, Instant completedAt, int totalRows, int acceptedRows,
			int rejectedRows, int duplicateRows, String summary) {
		this.status = status;
		this.completedAt = completedAt;
		this.totalRows = totalRows;
		this.acceptedRows = acceptedRows;
		this.rejectedRows = rejectedRows;
		this.duplicateRows = duplicateRows;
		this.summary = summary;
	}

	public Long getId() { return id; }
	public Dataset getDataset() { return dataset; }
	public String getStatus() { return status; }
	public String getOriginalFilename() { return originalFilename; }
	public String getFileChecksum() { return fileChecksum; }
	public Instant getStartedAt() { return startedAt; }
	public Instant getCompletedAt() { return completedAt; }
	public int getTotalRows() { return totalRows; }
	public int getAcceptedRows() { return acceptedRows; }
	public int getRejectedRows() { return rejectedRows; }
	public int getDuplicateRows() { return duplicateRows; }
	public String getSummary() { return summary; }
}
