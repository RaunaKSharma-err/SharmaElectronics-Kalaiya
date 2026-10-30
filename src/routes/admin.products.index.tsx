import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { adminDeleteProduct, adminListProducts } from "@/server/admin.functions";
import { categories, getCategory } from "@/data/categories";
import { resolveImage } from "@/lib/images";
import { formatPrice } from "@/lib/format";
import { stockStatus } from "@/lib/stock";
import { ErrorBox, Loading, PageTitle, StatusBadge, StockBadge, btnPrimary, inputCls } from "@/components/admin/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/products/")({ component: Products });

const PAGE = 20;

function Products() {
  const list = useServerFn(adminListProducts);
  const del = useServerFn(adminDeleteProduct);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "products"], queryFn: () => list() });
  const [s, setS] = useState({ q: "", cat: "", stock: "", pub: "" });
  const [page, setPage] = useState(0);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const rows = useMemo(() => {
    const t = s.q.toLowerCase().trim();
    return (q.data?.rows ?? []).filter((r) =>
      (!t || r.name.toLowerCase().includes(t) || (r.sku ?? "").toLowerCase().includes(t)) &&
      (!s.cat || r.category === s.cat) &&
      (!s.stock || stockStatus(r.stock_quantity, r.low_stock_threshold) === s.stock) &&
      (!s.pub || String(r.is_active) === s.pub));
  }, [q.data, s]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const upd = (patch: Partial<typeof s>) => { setS((x) => ({ ...x, ...patch })); setPage(0); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const res = await del({ data: toDelete.id });
    if (!res.ok) toast.error(res.error); else toast.success("Product deleted");
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["catalog"] });
  };

  return (
    <>
      <PageTitle title="Products" sub={q.data ? `${rows.length} of ${q.data.rows.length}` : undefined}
        action={<Link to="/admin/products/new" className={btnPrimary}><Plus className="h-4 w-4" /> Add product</Link>} />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input aria-label="Search by name or SKU" placeholder="Search name or SKU" className={inputCls} value={s.q} onChange={(e) => upd({ q: e.target.value })} />
        <select aria-label="Category" className={inputCls} value={s.cat} onChange={(e) => upd({ cat: e.target.value })}>
          <option value="">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <select aria-label="Stock status" className={inputCls} value={s.stock} onChange={(e) => upd({ stock: e.target.value })}>
          <option value="">Any stock</option><option value="in_stock">In stock</option><option value="low_stock">Low stock</option><option value="out_of_stock">Out of stock</option>
        </select>
        <select aria-label="Published" className={inputCls} value={s.pub} onChange={(e) => upd({ pub: e.target.value })}>
          <option value="">Published & drafts</option><option value="true">Published</option><option value="false">Drafts</option>
        </select>
      </div>
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No products match.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3"><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={resolveImage(r.image_url, q.data!.signed, r.category)} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" />
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">{r.sku ?? "—"}</td>
                  <td className="p-3">{getCategory(r.category)?.name ?? r.category}</td>
                  <td className="p-3 font-semibold">{formatPrice(r.price_npr)}</td>
                  <td className="p-3"><div className="flex items-center gap-2">{r.stock_quantity}<StockBadge s={stockStatus(r.stock_quantity, r.low_stock_threshold)} /></div></td>
                  <td className="p-3"><StatusBadge active={r.is_active} /></td>
                  <td className="p-3 text-muted-foreground">{new Date(r.updated_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Link to="/admin/products/$id/edit" params={{ id: r.id }} aria-label={`Edit ${r.name}`} className="rounded-lg p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" aria-label={`Delete ${r.name}`} onClick={() => setToDelete({ id: r.id, name: r.name })} className="rounded-lg p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <span>Page {page + 1} of {pages}</span>
          <button type="button" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40">Next</button>
        </div>
      )}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>"{toDelete?.name}" will be removed from the store permanently. To hide it temporarily, set it to draft instead.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
