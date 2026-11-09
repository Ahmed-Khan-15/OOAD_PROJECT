import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/records")({
  head: () => ({ meta: [{ title: "Health Records | Admin | Global Health Explorer" }] }),
  component: () => <AdminEntityPage kind="records" />,
});
