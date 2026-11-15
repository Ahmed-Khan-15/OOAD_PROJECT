import { createFileRoute } from "@tanstack/react-router";
import { CatalogueAdminPage } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/sources")({
  head: () => ({ meta: [{ title: "Data Sources | Admin | Global Health Explorer" }] }),
  component: () => <CatalogueAdminPage kind="sources" />,
});
