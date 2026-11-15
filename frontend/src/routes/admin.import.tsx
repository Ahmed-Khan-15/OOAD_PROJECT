import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AdminLayout, AdminPageHeading } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { api, type ImportApi } from "@/lib/api";
import { useApiQuery } from "@/lib/use-api-query";
import { useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";

export const Route = createFileRoute("/admin/import")({
  head: () => ({ meta: [{ title: "CSV Import | Admin | Global Health Explorer" }] }),
  component: CsvImportPage,
});

function CsvImportPage() {
  const client = useQueryClient();
  const datasets = useApiQuery(["admin", "datasets"], api.adminDatasets);
  const [datasetSlug, setDatasetSlug] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportApi | null>(null);
  const [error, setError] = useState("");
  const history = useApiQuery(["admin", "imports", datasetSlug], () => api.imports(datasetSlug));
  function downloadErrors(item: ImportApi) {
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["row", "code", "message", "raw_row"].join(","),
      ...item.errors.map((row) =>
        [row.rowNumber, row.code, row.message, JSON.stringify(row.rawRow ?? {})]
          .map(escape)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.filename}-errors.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!datasetSlug || !file) {
      setError("Choose a dataset and a CSV file.");
      return;
    }
    try {
      const summary = await api.importCsv(datasetSlug, file);
      setResult(summary);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin", "imports", datasetSlug] }),
        client.invalidateQueries({ queryKey: ["observations"] }),
      ]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "CSV import failed.");
    }
  }
  const showImport = (item: ImportApi) => (
    <article
      key={`${item.checksum}-${item.startedAt}`}
      className="rounded-lg border border-border p-4"
    >
      <div className="flex flex-wrap justify-between gap-2">
        <strong>{item.filename}</strong>
        <span className="text-xs font-semibold uppercase text-primary">{item.status}</span>
      </div>
      <p className="mt-2 text-sm">{item.summary}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.totalRows} rows · {item.acceptedRows} accepted · {item.rejectedRows} rejected ·{" "}
        {item.duplicateRows} duplicates
      </p>
      {item.errors.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Row-level issues</h3>
            <Button size="sm" variant="outline" onClick={() => downloadErrors(item)}>
              <Download size={14} />
              Download errors
            </Button>
          </div>
          <table className="mt-2 w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr>
                <th className="py-2">Row</th>
                <th>Code</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {item.errors.map((row, index) => (
                <tr key={`${row.rowNumber}-${index}`} className="border-t">
                  <td className="py-2">{row.rowNumber ?? "—"}</td>
                  <td>{row.code}</td>
                  <td>{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
  return (
    <AdminLayout
      title="CSV import"
      description="Submit a CSV to a registered dataset. The backend validates provenance, dimensions, and duplicate observations."
    >
      <AdminPageHeading
        title="Import health observations"
        description="Uploads are processed by the backend and retain row-level validation results."
      />
      <form
        onSubmit={(event) => void submit(event)}
        className="grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-5"
      >
        <label className="grid gap-1 text-sm font-medium">
          Dataset
          <select
            required
            value={datasetSlug}
            onChange={(event) => setDatasetSlug(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3"
          >
            <option value="">Select a registered dataset</option>
            {(datasets.data ?? []).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} · {item.source.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          CSV file
          <input
            required
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="rounded-md border border-input bg-background p-2 text-sm"
          />
        </label>
        <p className="text-xs leading-5 text-muted-foreground">
          Use the backend CSV format described in the import documentation. Only administrator
          uploads are accepted; do not import synthetic teaching observations as real data.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={!datasetSlug || !file}>
          Upload and validate CSV
        </Button>
      </form>
      {result && (
        <section className="mt-6">
          <h2 className="mb-3 font-display text-xl font-bold">Import result</h2>
          {showImport(result)}
        </section>
      )}
      {datasetSlug && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-bold">Previous imports</h2>
          {history.isLoading ? (
            <p>Loading import history…</p>
          ) : history.isError ? (
            <p role="alert" className="text-sm text-destructive">
              Import history could not be loaded.
            </p>
          ) : history.data?.length ? (
            <div className="grid gap-3">{history.data.map(showImport)}</div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No imports have been submitted for this dataset.
            </p>
          )}
        </section>
      )}
    </AdminLayout>
  );
}
