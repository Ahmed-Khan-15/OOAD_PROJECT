package com.globalhealthexplorer.observation.model;

import com.globalhealthexplorer.catalogue.model.Country;
import com.globalhealthexplorer.catalogue.model.Indicator;
import com.globalhealthexplorer.dataset.model.Dataset;
import com.globalhealthexplorer.dataset.model.IndicatorSourceMapping;
import com.globalhealthexplorer.imports.model.ImportBatch;
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

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "health_observations")
public class HealthObservation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "country_id", nullable = false)
	private Country country;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "indicator_id", nullable = false)
	private Indicator indicator;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "dataset_id", nullable = false)
	private Dataset dataset;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "source_mapping_id")
	private IndicatorSourceMapping sourceMapping;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "import_batch_id")
	private ImportBatch importBatch;

	@Column(name = "reference_year", nullable = false)
	private int referenceYear;

	@Column(nullable = false, precision = 22, scale = 8)
	private BigDecimal value;

	@JdbcTypeCode(SqlTypes.JSON)
	@Column(nullable = false, columnDefinition = "jsonb")
	private Map<String, Object> dimensions;

	@Column(name = "value_status", nullable = false, length = 20)
	private String valueStatus;

	@Column(name = "uncertainty_lower", precision = 22, scale = 8)
	private BigDecimal uncertaintyLower;

	@Column(name = "uncertainty_upper", precision = 22, scale = 8)
	private BigDecimal uncertaintyUpper;

	@Column(name = "original_value_text", length = 160)
	private String originalValueText;

	@Column(name = "observation_note", columnDefinition = "text")
	private String observationNote;

	protected HealthObservation() {
	}

	public Long getId() { return id; }
	public Country getCountry() { return country; }
	public Indicator getIndicator() { return indicator; }
	public Dataset getDataset() { return dataset; }
	public IndicatorSourceMapping getSourceMapping() { return sourceMapping; }
	public ImportBatch getImportBatch() { return importBatch; }
	public int getReferenceYear() { return referenceYear; }
	public BigDecimal getValue() { return value; }
	public Map<String, Object> getDimensions() { return dimensions; }
	public String getValueStatus() { return valueStatus; }
	public BigDecimal getUncertaintyLower() { return uncertaintyLower; }
	public BigDecimal getUncertaintyUpper() { return uncertaintyUpper; }
	public String getOriginalValueText() { return originalValueText; }
	public String getObservationNote() { return observationNote; }
}
