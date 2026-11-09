import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/indicators")({
  head: () => ({ meta: [{ title: "Indicators | Admin | Global Health Explorer" }] }),
  component: () => <AdminEntityPage kind="indicators" />,
});
