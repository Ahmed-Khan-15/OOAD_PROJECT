import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/sources")({
  head: () => ({ meta: [{ title: "Data Sources | Admin | Global Health Explorer" }] }),
  component: () => <AdminEntityPage kind="sources" />,
});
