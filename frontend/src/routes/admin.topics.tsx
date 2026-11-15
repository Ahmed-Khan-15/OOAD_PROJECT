import { createFileRoute } from "@tanstack/react-router";
import { CatalogueAdminPage } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/topics")({
  head: () => ({ meta: [{ title: "Topics | Admin | Global Health Explorer" }] }),
  component: () => <CatalogueAdminPage kind="topics" />,
});
