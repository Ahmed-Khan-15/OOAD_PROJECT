import { describe, expect, it } from "vitest";
import { parseDatasetMappingLines } from "@/lib/dataset-mappings";

describe("dataset indicator mapping lines", () => {
  it("preserves source codes for all six WDI mappings", () => {
    const mappings = parseDatasetMappingLines(
      [
        "life-expectancy-birth-total | SP.DYN.LE00.IN | Life expectancy at birth, total (years) | years",
        "under-five-mortality-rate | SH.DYN.MORT | Mortality rate, under-5 (per 1,000 live births) | deaths per 1,000 live births",
        "infant-mortality-rate | SP.DYN.IMRT.IN | Mortality rate, infant (per 1,000 live births) | deaths per 1,000 live births",
        "neonatal-mortality-rate | SH.DYN.NMRT | Mortality rate, neonatal (per 1,000 live births) | deaths per 1,000 live births",
        "maternal-mortality-ratio | SH.STA.MMRT | Maternal mortality ratio (modeled estimate, per 100,000 live births) | deaths per 100,000 live births",
        "births-attended-skilled-personnel | SH.STA.BRTC.ZS | Births attended by skilled health staff (% of total) | %",
      ].join("\n"),
    );

    expect(mappings.map((mapping) => mapping.originalIndicatorCode)).toEqual([
      "SP.DYN.LE00.IN",
      "SH.DYN.MORT",
      "SP.DYN.IMRT.IN",
      "SH.DYN.NMRT",
      "SH.STA.MMRT",
      "SH.STA.BRTC.ZS",
    ]);
  });

  it("continues to read existing three-field mappings without source codes", () => {
    expect(
      parseDatasetMappingLines("life-expectancy-birth-total | Life expectancy | years"),
    ).toEqual([
      {
        indicatorSlug: "life-expectancy-birth-total",
        originalIndicatorCode: "",
        originalIndicatorName: "Life expectancy",
        originalUnit: "years",
        conversionNotes: "",
        dimensionsDescription: "",
      },
    ]);
  });

  it("rejects duplicate source keys case-insensitively", () => {
    expect(() =>
      parseDatasetMappingLines(
        [
          "indicator-one | SRC.CODE | Source one | unit",
          "indicator-two | src.code | Source two | unit",
        ].join("\n"),
      ),
    ).toThrow("Dataset indicator mappings must have unique source codes.");
  });

  it("rejects source codes longer than the API's 180-character limit", () => {
    expect(() =>
      parseDatasetMappingLines(`indicator-one | ${"x".repeat(181)} | Source one | unit`),
    ).toThrow("source code must be 180 characters or fewer.");
  });
});
