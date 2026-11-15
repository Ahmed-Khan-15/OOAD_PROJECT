import { createFileRoute } from "@tanstack/react-router";
import { ApiDatasetsAdmin as DatasetsAdmin } from "@/components/api-admin-content";

export const Route = createFileRoute("/admin/datasets")({
  head: () => ({ meta: [{ title: "Datasets | Admin | Global Health Explorer" }] }),
  component: DatasetsAdmin,
});
