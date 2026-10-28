import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Product } from "@/types/product";
import { categories } from "@/data/categories";
import { ProductGrid } from "./ProductCard";

export type Sort = "featured" | "price-asc" | "price-desc" | "name";
export interface CatalogState { q?: string | undefined; category?: string | undefined; brand?: string | undefined; sort?: Sort | undefined }

export function filterProducts(list: Product[], s: CatalogState): Product[] {
  const q = s.q?.toLowerCase().trim();
  const out = list.filter((p) =>
    (!q || [p.name, p.brand ?? "", ...p.tags].some((t) => t.toLowerCase().includes(q))) &&
    (!s.category || p.category === s.category) &&
    (!s.brand || p.brand === s.brand));
  const sort = s.sort ?? "featured";
  return [...out].sort((a, b) =>
    sort === "price-asc" ? a.priceNPR - b.priceNPR :
    sort === "price-desc" ? b.priceNPR - a.priceNPR :
    sort === "name" ? a.name.localeCompare(b.name) :
    Number(b.featured) - Number(a.featured));
}

export function CatalogBrowser({ products, state, onChange, hideCategory }: {
  products: Product[]; state: CatalogState; onChange: (s: CatalogState) => void; hideCategory?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const results = useMemo(() => filterProducts(products, state), [products, state]);
  const brandList = useMemo(() => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])).sort(), [products]);
  const active = [state.q && "q", state.category && "category", state.brand && "brand"].filter(Boolean).length;
  const set = (patch: Partial<CatalogState>) => onChange({ ...state, ...patch });

  const field = "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm focus:border-primary focus:outline-none";
  const filters = (
    <div className="grid gap-4">
      <div>
        <label htmlFor="cat-q" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Search</label>
        <input id="cat-q" type="search" value={state.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Name or brand" className={field} />
      </div>
      {!hideCategory && (
        <div>
          <label htmlFor="cat-c" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
          <select id="cat-c" value={state.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })} className={field}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="cat-b" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand</label>
        <select id="cat-b" value={state.brand ?? ""} onChange={(e) => set({ brand: e.target.value || undefined })} className={field}>
          <option value="">All brands</option>
          {brandList.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      {active > 0 && (
        <button type="button" onClick={() => onChange({ sort: state.sort })} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <X className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-24">{filters}</div></aside>
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">{results.length} product{results.length === 1 ? "" : "s"}</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="m-filters"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> Filters{active ? ` (${active})` : ""}
            </button>
            <label htmlFor="cat-s" className="sr-only">Sort by</label>
            <select id="cat-s" value={state.sort ?? "featured"} onChange={(e) => set({ sort: e.target.value as Sort })}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <option value="featured">Featured first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>
        {open && <div id="m-filters" className="mb-6 rounded-2xl border border-border bg-card p-4 lg:hidden">{filters}</div>}
        {results.length ? <ProductGrid products={results} /> : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-semibold">No products match your search.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another word, clear filters, or ask us on WhatsApp — we may have it in the shop.</p>
            <button type="button" onClick={() => onChange({})} className="mt-4 text-sm font-semibold text-primary">Clear all</button>
          </div>
        )}
      </div>
    </div>
  );
}
