import { createFileRoute } from "@tanstack/react-router";
import { ApiGlossaryAdmin as GlossaryAdmin } from "@/components/api-admin-content";
export const Route = createFileRoute("/admin/glossary")({
  head: () => ({ meta: [{ title: "Glossary | Admin | Global Health Explorer" }] }),
  component: GlossaryAdmin,
});
