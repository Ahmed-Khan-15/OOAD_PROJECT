import type { DatasetWrite } from "@/lib/api";

type DatasetIndicatorMapping = DatasetWrite["indicators"][number];

export function parseDatasetMappingLines(value: string): DatasetIndicatorMapping[] {
  const mappings: DatasetIndicatorMapping[] = [];
  const sourceKeys = new Set<string>();

  for (const [index, rawLine] of value.split(/\r?\n/).entries()) {
    if (!rawLine.trim()) continue;

    const parts = rawLine.split("|").map((part) => part.trim());
    if (parts.length > 4) {
      throw new Error(`Mapping line ${index + 1} must contain four fields or fewer.`);
    }

    const [indicatorSlug, second, third, fourth] = parts;
    const hasSourceCodeColumn = parts.length === 4;
    const originalIndicatorCode = hasSourceCodeColumn ? (second ?? "") : "";
    const originalIndicatorName = hasSourceCodeColumn
      ? (third ?? "")
      : (second ?? indicatorSlug ?? "");
    const originalUnit = hasSourceCodeColumn ? (fourth ?? "") : (third ?? "");

    if (!indicatorSlug) {
      throw new Error(`Mapping line ${index + 1} must include a canonical indicator slug.`);
    }
    if (!originalIndicatorName || originalIndicatorName.length > 240) {
      throw new Error(
        `Mapping line ${index + 1} must include a source name of at most 240 characters.`,
      );
    }
    if (!originalUnit || originalUnit.length > 120) {
      throw new Error(
        `Mapping line ${index + 1} must include a source unit of at most 120 characters.`,
      );
    }
    if (originalIndicatorCode.length > 180) {
      throw new Error(`Mapping line ${index + 1} source code must be 180 characters or fewer.`);
    }

    const sourceKey = (originalIndicatorCode || indicatorSlug).toLowerCase();
    if (sourceKeys.has(sourceKey)) {
      throw new Error("Dataset indicator mappings must have unique source codes.");
    }
    sourceKeys.add(sourceKey);

    mappings.push({
      indicatorSlug,
      originalIndicatorCode,
      originalIndicatorName,
      originalUnit,
      conversionNotes: "",
      dimensionsDescription: "",
    });
  }

  if (mappings.length === 0) {
    throw new Error("Add at least one indicator mapping.");
  }

  return mappings;
}
