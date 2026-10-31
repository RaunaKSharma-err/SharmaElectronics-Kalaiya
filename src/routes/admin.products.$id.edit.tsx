import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetProduct } from "@/lib/admin.functions";
import { ProductForm } from "@/components/admin/ProductForm";
import { ErrorBox, Loading, PageTitle } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/products/$id/edit")({ component: Edit });

function Edit() {
  const { id } = Route.useParams();
  const fn = useServerFn(adminGetProduct);
  const q = useQuery({ queryKey: ["admin", "product", id], queryFn: () => fn({ data: id }), retry: false });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorBox message="Couldn't load this product. Check the link and try again." />;
  if (!q.data) return <div className="space-y-3"><ErrorBox message="Product not found." /><Link to="/admin/products" className="text-sm font-semibold text-primary">Back to products</Link></div>;
  return (<><PageTitle title={`Edit: ${q.data.row.name}`} /><ProductForm key={q.data.row.updated_at} initial={q.data.row} signed={q.data.signed} /></>);
}
