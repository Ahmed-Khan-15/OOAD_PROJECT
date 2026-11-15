import { createFileRoute } from "@tanstack/react-router";
import { ApiDonationsAdmin as DonationsAdmin } from "@/components/api-admin-content";
export const Route = createFileRoute("/admin/donations")({
  head: () => ({ meta: [{ title: "Donations | Admin | Global Health Explorer" }] }),
  component: DonationsAdmin,
});
