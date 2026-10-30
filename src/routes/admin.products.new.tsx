import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageTitle } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/products/new")({
  component: () => (<><PageTitle title="Add product" /><ProductForm /></>),
});
