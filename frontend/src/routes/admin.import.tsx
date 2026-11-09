import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Download, FileUp, Upload } from "lucide-react";
import { useMemo, useRef, useState, type DragEvent } from "react";
import { AdminLayout } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { getAdminData, saveHealthRecords } from "@/data/admin-data";
import { validateHealthRecordCsv, type RejectedCsvRow } from "@/data/csv-import";

const cardClass = "rounded-xl border border-border bg-card";

export const Route = createFileRoute("/admin/import")({
  head: () => ({ meta: [{ title: "CSV Import | Admin | Global Health Explorer" }] }),
  component: CsvImportPage,
});

function downloadRejected(rejected: RejectedCsvRow[]) {
  const columns = [
    "row",
    "reason",
    "country",
    "indicator",
    "year",
    "value",
    "source",
    "dimensions",
    "notes",
  ];
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = [
    columns.join(","),
    ...rejected.map((item) =>
      [
        item.line,
        item.reason,
        item.values.country,
        item.values.indicator,
        item.values.year,
        item.values.value,
        item.values.source,
        item.values.dimensions,
        item.values.notes,
      ]
        .map((value) => escape(String(value)))
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "health-records-rejected.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function CsvImportPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<{ imported: number; rejected: number } | null>(null);
  const validation = useMemo(() => {
    if (!fileText) return null;
    try {
      return validateHealthRecordCsv(fileText, getAdminData());
    } catch (issue) {
      return { error: issue instanceof Error ? issue.message : "Could not read the CSV." };
    }
  }, [fileText]);
  const report = validation && "valid" in validation ? validation : null;

  const loadFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setSummary(null);
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setError("Choose a CSV file.");
      return;
    }
    try {
      setFileText(await file.text());
      setFileName(file.name);
    } catch (issue) {
      console.error("Could not read selected CSV file.", issue);
      setError("The selected file could not be read by this browser.");
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void loadFile(event.dataTransfer.files[0]);
  };

  const importValid = () => {
    if (!report) return;
    const freshValidation = validateHealthRecordCsv(fileText, getAdminData());
    if (freshValidation.valid.length === 0) {
      setSummary({ imported: 0, rejected: freshValidation.rejected.length });
      return;
    }
    saveHealthRecords([
      ...getAdminData().healthRecords,
      ...freshValidation.valid.map((item) => item.record),
    ]);
    setSummary({
      imported: freshValidation.valid.length,
      rejected: freshValidation.rejected.length,
    });
    setFileText("");
    setFileName("");
  };

  return (
    <AdminLayout
      title="CSV import"
      description="Upload a file, inspect row-level validation, then import only the observations that pass."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <section className={`${cardClass} p-5 sm:p-6`}>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-7 text-center transition sm:p-10 ${dragging ? "border-primary bg-secondary/60" : "border-border bg-wash/50"}`}
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <FileUp size={21} />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold">Select or drop a CSV file</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The file is read and validated in your browser. Nothing is uploaded to a server.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Select CSV file"
              onChange={(event) => void loadFile(event.target.files?.[0])}
            />
            <Button className="mt-5" variant="outline" onClick={() => inputRef.current?.click()}>
              <Upload size={15} /> Choose CSV
            </Button>
            {fileName && (
              <p className="mt-3 text-xs font-medium text-foreground">Selected: {fileName}</p>
            )}
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {validation && "error" in validation && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {validation.error}
            </p>
          )}
          {summary && (
            <div
              role="status"
              className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-secondary/60 p-4"
            >
              <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={18} />
              <div>
                <p className="font-semibold">Import finished</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summary.imported} records imported. {summary.rejected} rows rejected.
                </p>
              </div>
            </div>
          )}
          {report && (
            <div className="mt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold">Validation results</h3>
                  <p className="text-sm text-muted-foreground">
                    {report.preview.length} data rows · {report.valid.length} valid ·{" "}
                    {report.rejected.length} rejected
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {report.rejected.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadRejected(report.rejected)}
                    >
                      <Download size={14} /> Rejected rows
                    </Button>
                  )}
                  <Button size="sm" disabled={report.valid.length === 0} onClick={importValid}>
                    Import {report.valid.length} valid rows
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <h4 className="flex items-center gap-2 font-semibold text-primary">
                    <CheckCircle2 size={16} /> Valid rows ({report.valid.length})
                  </h4>
                  <div className="mt-3 max-h-64 space-y-2 overflow-auto text-xs">
                    {report.valid.slice(0, 100).map(({ line, record }) => (
                      <p key={line} className="rounded-lg bg-wash p-2">
                        Row {line} · {record.countryId} · {record.indicatorId} · {record.year} ·{" "}
                        {record.value}
                      </p>
                    ))}
                    {report.valid.length > 100 && (
                      <p className="text-muted-foreground">Showing first 100 rows.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/20 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="flex items-center gap-2 font-semibold text-destructive">
                      <AlertCircle size={16} /> Rejected rows ({report.rejected.length})
                    </h4>
                    {report.rejected.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadRejected(report.rejected)}
                      >
                        <Download size={14} /> Download
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-auto text-xs">
                    {report.rejected.slice(0, 100).map((item) => (
                      <div key={item.line} className="rounded-lg bg-destructive/5 p-2">
                        <p className="font-semibold">Row {item.line}</p>
                        <p className="mt-1 text-destructive">{item.reason}</p>
                      </div>
                    ))}
                    {report.rejected.length === 0 && (
                      <p className="text-muted-foreground">No rejected rows.</p>
                    )}
                    {report.rejected.length > 100 && (
                      <p className="text-muted-foreground">Showing first 100 rows.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className={`${cardClass} h-fit p-5 sm:p-6`}>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Supported CSV format
          </p>
          <h2 className="mt-1 font-display text-xl font-bold">One row per observation</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use the normalized column names below. Source-specific exports should be mapped to this
            format first.
          </p>
          <div className="mt-4 rounded-lg bg-wash p-3 font-mono text-xs leading-6">
            country,indicator,year,value,source,dimensions,notes
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Required:</strong> country, indicator, year,
              value.
            </li>
            <li>
              <strong className="text-foreground">Country:</strong> use ID, name, or ISO code.
            </li>
            <li>
              <strong className="text-foreground">Indicator:</strong> use indicator ID or exact
              name.
            </li>
            <li>
              <strong className="text-foreground">Optional:</strong> source ID/name, notes,
              dimensions JSON.
            </li>
            <li>
              <strong className="text-foreground">Duplicate key:</strong> country + indicator + year
              + dimensions.
            </li>
          </ul>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent("country,indicator,year,value,source,dimensions,notes\nPakistan,life-expectancy,2023,67,,{},Example row")}`}
            download="health-records-template.csv"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <Download size={15} /> Download template
          </a>
        </aside>
      </div>
    </AdminLayout>
  );
}
