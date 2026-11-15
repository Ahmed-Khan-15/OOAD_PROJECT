import { createFileRoute } from "@tanstack/react-router";
import { CatalogueAdminPage } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/indicators")({
  head: () => ({ meta: [{ title: "Indicators | Admin | Global Health Explorer" }] }),
  component: () => <CatalogueAdminPage kind="indicators" />,
});
