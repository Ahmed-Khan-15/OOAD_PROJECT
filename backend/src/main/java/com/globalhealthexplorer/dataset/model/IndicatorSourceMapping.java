package com.globalhealthexplorer.dataset.model;

import com.globalhealthexplorer.catalogue.model.Indicator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "indicator_source_mappings")
public class IndicatorSourceMapping {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "dataset_id", nullable = false)
	private Dataset dataset;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "indicator_id", nullable = false)
	private Indicator indicator;

	@Column(name = "original_indicator_code", length = 180)
	private String originalIndicatorCode;

	@Column(name = "original_indicator_name", nullable = false, length = 240)
	private String originalIndicatorName;

	@Column(name = "original_unit", length = 120)
	private String originalUnit;

	@Column(name = "conversion_notes", columnDefinition = "text")
	private String conversionNotes;

	@Column(name = "dimensions_description", columnDefinition = "text")
	private String dimensionsDescription;

	protected IndicatorSourceMapping() {
	}

	public IndicatorSourceMapping(Dataset dataset, Indicator indicator, String originalIndicatorCode,
			String originalIndicatorName, String originalUnit, String conversionNotes,
			String dimensionsDescription) {
		this.dataset = dataset;
		this.indicator = indicator;
		this.originalIndicatorCode = originalIndicatorCode;
		this.originalIndicatorName = originalIndicatorName;
		this.originalUnit = originalUnit;
		this.conversionNotes = conversionNotes;
		this.dimensionsDescription = dimensionsDescription;
	}

	public void update(String originalIndicatorCode, String originalIndicatorName, String originalUnit,
			String conversionNotes, String dimensionsDescription) {
		this.originalIndicatorCode = originalIndicatorCode;
		this.originalIndicatorName = originalIndicatorName;
		this.originalUnit = originalUnit;
		this.conversionNotes = conversionNotes;
		this.dimensionsDescription = dimensionsDescription;
	}

	public Long getId() { return id; }
	public Dataset getDataset() { return dataset; }
	public Indicator getIndicator() { return indicator; }
	public String getOriginalIndicatorCode() { return originalIndicatorCode; }
	public String getOriginalIndicatorName() { return originalIndicatorName; }
	public String getOriginalUnit() { return originalUnit; }
	public String getConversionNotes() { return conversionNotes; }
	public String getDimensionsDescription() { return dimensionsDescription; }
}
