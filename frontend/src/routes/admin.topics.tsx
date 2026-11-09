import { createFileRoute } from "@tanstack/react-router";
import { AdminEntityPage } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/topics")({
  head: () => ({ meta: [{ title: "Topics | Admin | Global Health Explorer" }] }),
  component: () => <AdminEntityPage kind="topics" />,
});
