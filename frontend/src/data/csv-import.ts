import type { AdminData } from "@/data/admin-data";
import type { HealthRecord } from "@/data/health";

export type CsvValues = {
  country: string;
  indicator: string;
  year: string;
  value: string;
  source: string;
  dimensions: string;
  notes: string;
};

export type CsvRow = { line: number; values: CsvValues };
export type RejectedCsvRow = { line: number; values: CsvValues; reason: string };
export type ValidCsvRecord = { line: number; record: HealthRecord };
export type CsvValidation = {
  valid: ValidCsvRecord[];
  rejected: RejectedCsvRow[];
  preview: CsvRow[];
};

const REQUIRED_COLUMNS = ["country", "indicator", "year", "value"];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function dimensionKey(dimensions: Record<string, string>) {
  return Object.entries(dimensions)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key.trim().toLowerCase()}=${value.trim().toLowerCase()}`)
    .join("&");
}

function recordKey(
  record: Pick<HealthRecord, "countryId" | "indicatorId" | "year" | "dimensions">,
) {
  return `${record.countryId}|${record.indicatorId}|${record.year}|${dimensionKey(record.dimensions ?? {})}`;
}

export function validateHealthRecordCsv(text: string, data: AdminData): CsvValidation {
  const parsed = parseCsv(text);
  if (parsed.length < 2)
    throw new Error("The CSV must include a header row and at least one observation.");
  const headerRow = parsed[0];
  if (!headerRow) throw new Error("CSV header row is missing.");
  const headers = headerRow.map((header) => header.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missing.length) {
    throw new Error(
      `Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
    );
  }
  if (new Set(headers).size !== headers.length) throw new Error("CSV header names must be unique.");

  const countries = new Map(
    data.countries.flatMap((country) => [
      [country.id.toLowerCase(), country.id] as const,
      [country.name.toLowerCase(), country.id] as const,
      ...(country.isoCode ? [[country.isoCode.toLowerCase(), country.id] as const] : []),
    ]),
  );
  const indicators = new Map(
    data.topics.flatMap((topic) =>
      topic.indicators.flatMap((indicator) => [
        [indicator.id.toLowerCase(), indicator.id] as const,
        [indicator.name.toLowerCase(), indicator.id] as const,
      ]),
    ),
  );
  const sources = new Map(
    data.sources.flatMap((source) => [
      [source.id.toLowerCase(), source] as const,
      [source.name.toLowerCase(), source] as const,
    ]),
  );
  const seen = new Set(data.healthRecords.map(recordKey));
  const valid: ValidCsvRecord[] = [];
  const rejected: RejectedCsvRow[] = [];
  const preview: CsvRow[] = [];

  parsed.slice(1).forEach((cells, index) => {
    const columnIndexes = new Map(headers.map((header, column) => [header, column]));
    const read = (column: string) => {
      const position = columnIndexes.get(column);
      return position === undefined ? "" : (cells[position] ?? "").trim();
    };
    const values: CsvValues = {
      country: read("country"),
      indicator: read("indicator"),
      year: read("year"),
      value: read("value"),
      source: read("source"),
      dimensions: read("dimensions"),
      notes: read("notes"),
    };
    const line = index + 2;
    preview.push({ line, values });
    const countryId = countries.get(values.country.toLowerCase());
    const indicatorId = indicators.get(values.indicator.toLowerCase());
    const year = Number(values.year);
    const value = Number(values.value);
    let dimensions: Record<string, string> = {};
    let reason = "";

    if (cells.length > headers.length) reason = "This row has more cells than the header.";
    else if (!countryId)
      reason = `Unknown country "${values.country}" (use a country ID, name, or ISO code).`;
    else if (!indicatorId)
      reason = `Unknown indicator "${values.indicator}" (use an indicator ID or name).`;
    else if (!Number.isInteger(year) || year < 1800 || year > 2200)
      reason = "Year must be an integer from 1800 to 2200.";
    else if (!values.value || !Number.isFinite(value)) reason = "Value must be a finite number.";
    else if (values.dimensions) {
      try {
        const parsedDimensions: unknown = JSON.parse(values.dimensions);
        if (
          !parsedDimensions ||
          typeof parsedDimensions !== "object" ||
          Array.isArray(parsedDimensions)
        ) {
          reason = 'Dimensions must be a JSON object, for example {"sex":"female"}.';
        } else {
          dimensions = Object.fromEntries(
            Object.entries(parsedDimensions).map(([key, item]) => [key, String(item)]),
          );
        }
      } catch {
        reason = 'Dimensions must be valid JSON, for example {"sex":"female"}.';
      }
    }

    const source = values.source ? sources.get(values.source.toLowerCase()) : undefined;
    if (!reason && values.source && !source) reason = `Unknown source "${values.source}".`;
    if (!reason && countryId && indicatorId && Number.isInteger(year)) {
      const record: HealthRecord = {
        countryId,
        indicatorId,
        year,
        value,
        source: source?.name ?? "CSV import · source unspecified",
        ...(source ? { sourceId: source.id } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        dimensions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const key = recordKey(record);
      if (seen.has(key))
        reason = `Duplicate observation for ${record.countryId}, ${record.indicatorId}, ${record.year}, and these dimensions.`;
      else {
        seen.add(key);
        valid.push({ line, record });
      }
    }

    if (reason) rejected.push({ line, values, reason });
  });

  return { valid, rejected, preview };
}
