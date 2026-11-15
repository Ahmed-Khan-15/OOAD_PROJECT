import { createFileRoute } from "@tanstack/react-router";
import { CatalogueAdminPage } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/countries")({
  head: () => ({ meta: [{ title: "Countries | Admin | Global Health Explorer" }] }),
  component: () => <CatalogueAdminPage kind="countries" />,
});
