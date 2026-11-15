import { createFileRoute } from "@tanstack/react-router";
import { ApiArticlesAdmin as ArticlesAdmin } from "@/components/api-admin-content";
export const Route = createFileRoute("/admin/articles")({
  head: () => ({ meta: [{ title: "Articles | Admin | Global Health Explorer" }] }),
  component: ArticlesAdmin,
});
