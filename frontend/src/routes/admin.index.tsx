import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin-pages";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview | Global Health Explorer" }] }),
  component: AdminDashboard,
});
