import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/countries")({
  head: () => ({ meta: [{ title: "Countries | Admin | Global Health Explorer" }] }),
  component: () => <AdminEntityPage kind="countries" />,
});
