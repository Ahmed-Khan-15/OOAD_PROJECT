import { createFileRoute } from "@tanstack/react-router";
import { CatalogueAdminPage } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/records")({
  head: () => ({ meta: [{ title: "Health Records | Admin | Global Health Explorer" }] }),
  component: () => <CatalogueAdminPage kind="records" />,
});
