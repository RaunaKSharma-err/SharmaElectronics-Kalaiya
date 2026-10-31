import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { adminListProducts, adminSetStock } from "@/lib/admin.functions";
import { stockStatus } from "@/lib/stock";
import type { AdminProduct, StockStatus } from "@/types/product";
import { ErrorBox, Loading, PageTitle, StockBadge, inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/inventory")({ component: Inventory });

const order: Record<StockStatus, number> = { out_of_stock: 0, low_stock: 1, in_stock: 2 };

function Inventory() {
  const list = useServerFn(adminListProducts);
  const q = useQuery({ queryKey: ["admin", "products"], queryFn: () => list() });
  const [filter, setFilter] = useState<"" | StockStatus>("");
  const rows = useMemo(() => (q.data?.rows ?? [])
    .map((r) => ({ r, s: stockStatus(r.stock_quantity, r.low_stock_threshold) }))
    .filter((x) => !filter || x.s === filter)
    .sort((a, b) => order[a.s] - order[b.s] || a.r.name.localeCompare(b.r.name)), [q.data, filter]);

  return (
    <>
      <PageTitle title="Inventory" sub="Out-of-stock and low-stock items are listed first." />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by stock">
        {([["", "All"], ["low_stock", "Low stock"], ["out_of_stock", "Out of stock"]] as const).map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${filter === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{l}</button>
        ))}
      </div>
      {q.isLoading ? <Loading /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Nothing here.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Status</th><th className="p-3">Quantity</th><th className="p-3">Alert at</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map(({ r, s }) => <StockRow key={r.id} r={r} s={s} />)}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function StockRow({ r, s }: { r: AdminProduct; s: StockStatus }) {
  const fn = useServerFn(adminSetStock);
  const qc = useQueryClient();
  const [qty, setQty] = useState(String(r.stock_quantity));
  const [thr, setThr] = useState(String(r.low_stock_threshold));
  const [busy, setBusy] = useState(false);

  const run = async (data: { set?: number; delta?: number; threshold?: number }) => {
    setBusy(true);
    try {
      const res = await fn({ data: { id: r.id, ...data } });
      if (!res.ok) { toast.error(res.error); return; }
      if ("quantity" in res && res.quantity != null) setQty(String(res.quantity));
      toast.success(`${r.name} updated`);
      qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["catalog"] });
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const saveQty = () => {
    if (!/^\d+$/.test(qty)) { toast.error("Quantity must be a whole number, 0 or more"); setQty(String(r.stock_quantity)); return; }
    if (Number(qty) !== r.stock_quantity) run({ set: Number(qty) });
  };
  const saveThr = () => {
    if (!/^\d+$/.test(thr)) { toast.error("Threshold must be a whole number, 0 or more"); setThr(String(r.low_stock_threshold)); return; }
    if (Number(thr) !== r.low_stock_threshold) run({ threshold: Number(thr) });
  };

  return (
    <tr className={s === "out_of_stock" ? "bg-destructive/5" : s === "low_stock" ? "bg-warning/5" : ""}>
      <td className="p-3 font-medium">{r.name}{!r.is_active && <span className="ml-2 text-xs text-muted-foreground">(draft)</span>}</td>
      <td className="p-3 text-muted-foreground">{r.sku ?? "—"}</td>
      <td className="p-3"><StockBadge s={s} /></td>
      <td className="p-3">
        <div className="flex items-center gap-1">
          <button type="button" disabled={busy || r.stock_quantity === 0} onClick={() => run({ delta: -1 })} aria-label={`Decrease ${r.name} stock`} className="rounded-lg border border-border p-1.5 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
          <input aria-label={`${r.name} quantity`} inputMode="numeric" className={`${inputCls} w-20 text-center`} value={qty} disabled={busy}
            onChange={(e) => setQty(e.target.value)} onBlur={saveQty} onKeyDown={(e) => e.key === "Enter" && saveQty()} />
          <button type="button" disabled={busy} onClick={() => run({ delta: 1 })} aria-label={`Increase ${r.name} stock`} className="rounded-lg border border-border p-1.5 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
        </div>
      </td>
      <td className="p-3">
        <input aria-label={`${r.name} low-stock threshold`} inputMode="numeric" className={`${inputCls} w-20 text-center`} value={thr} disabled={busy}
          onChange={(e) => setThr(e.target.value)} onBlur={saveThr} onKeyDown={(e) => e.key === "Enter" && saveThr()} />
      </td>
    </tr>
  );
}
