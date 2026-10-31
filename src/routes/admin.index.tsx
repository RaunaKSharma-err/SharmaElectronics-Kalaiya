import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { adminDashboard } from "@/lib/admin.functions";
import { ErrorBox, Loading, PageTitle, StatusBadge, StockBadge, btnPrimary } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { stockStatus } from "@/lib/stock";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const fn = useServerFn(adminDashboard);
  const q = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => fn() });
  return (
    <>
      <PageTitle title="Dashboard" sub="Overview of your catalog and stock." action={<Link to="/admin/products/new" className={btnPrimary}><Plus className="h-4 w-4" /> Add product</Link>} />
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : q.data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { l: "Total products", v: q.data.total, to: "/admin/products" },
              { l: "Published", v: q.data.active, to: "/admin/products" },
              { l: "Low stock", v: q.data.low, to: "/admin/inventory", tone: "text-warning" },
              { l: "Out of stock", v: q.data.out, to: "/admin/inventory", tone: "text-destructive" },
            ].map((c) => (
              <Link key={c.l} to={c.to} className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover">
                <p className="text-sm text-muted-foreground">{c.l}</p>
                <p className={`mt-2 text-3xl font-bold ${c.tone ?? ""}`}>{c.v}</p>
              </Link>
            ))}
          </div>
          <h2 className="mb-3 mt-10 font-semibold">Recently updated</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {q.data.recent.map((r: { id: string; name: string; is_active: boolean; stock_quantity: number; low_stock_threshold: number; price_npr: number }) => (
              <li key={r.id}>
                <Link to="/admin/products/$id/edit" params={{ id: r.id }} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-secondary">
                  <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                  <span className="text-sm">{formatPrice(Number(r.price_npr))}</span>
                  <StockBadge s={stockStatus(r.stock_quantity, r.low_stock_threshold)} />
                  <StatusBadge active={r.is_active} />
                </Link>
              </li>
            ))}
            {q.data.recent.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">No products yet.</li>}
          </ul>
        </>
      )}
    </>
  );
}
