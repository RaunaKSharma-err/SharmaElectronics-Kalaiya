import type { ReactNode } from "react";
import type { StockStatus } from "@/types/product";
import { stockLabel } from "@/lib/stock";

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StockBadge({ s }: { s: StockStatus }) {
  const c = s === "in_stock" ? "bg-success/10 text-success" : s === "low_stock" ? "bg-warning/15 text-warning" : "bg-destructive/10 text-destructive";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>{stockLabel[s]}</span>;
}

export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{active ? "Published" : "Draft"}</span>;
}

export const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none";
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:border-foreground disabled:opacity-60";

export function Loading() {
  return <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />)}</div>;
}

export function ErrorBox({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{message}</div>;
}
