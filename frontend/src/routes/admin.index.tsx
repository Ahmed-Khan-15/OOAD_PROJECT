import { createFileRoute } from "@tanstack/react-router";
import { ApiAdminDashboard as AdminDashboard } from "@/components/api-catalogue-admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview | Global Health Explorer" }] }),
  component: AdminDashboard,
});
