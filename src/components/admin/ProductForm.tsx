import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/categories";
import { adminSaveProduct } from "@/server/admin.functions";
import { productInput, safeImagePath, validateImageFile } from "@/lib/product-validation";
import { resolveImage } from "@/lib/images";
import { slugify } from "@/lib/format";
import type { AdminProduct } from "@/types/product";
import { btnGhost, btnPrimary, inputCls } from "./ui";

type Img = { path: string; preview: string };

export function ProductForm({ initial, signed = {} }: { initial?: AdminProduct; signed?: Record<string, string> }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const save = useServerFn(adminSaveProduct);
  const cat0 = initial?.category ?? "";
  const [f, setF] = useState({
    name: initial?.name ?? "", slug: initial?.slug ?? "", brand: initial?.brand ?? "", category: cat0,
    short_description: initial?.short_description ?? "", description: initial?.description ?? "",
    price_npr: initial ? String(initial.price_npr) : "", original_price_npr: initial?.original_price_npr != null ? String(initial.original_price_npr) : "",
    sku: initial?.sku ?? "", stock_quantity: String(initial?.stock_quantity ?? 0), low_stock_threshold: String(initial?.low_stock_threshold ?? 5),
    tags: (initial?.tags ?? []).join(", "), features: (initial?.features ?? []).join("\n"),
    is_featured: initial?.is_featured ?? false, is_new: initial?.is_new ?? false, is_active: initial?.is_active ?? true,
  });
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>(Object.entries(initial?.specifications ?? {}).map(([k, v]) => ({ k, v })));
  const [main, setMain] = useState<Img | null>(initial?.image_url ? { path: initial.image_url, preview: resolveImage(initial.image_url, signed, cat0) } : null);
  const [gallery, setGallery] = useState<Img[]>((initial?.gallery ?? []).map((p) => ({ path: p, preview: resolveImage(p, signed, cat0) })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof f, v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  async function upload(file: File): Promise<Img | null> {
    const err = validateImageFile(file);
    if (err) { toast.error(err); return null; }
    const path = safeImagePath(file.name);
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    if (error) { toast.error("Upload failed: " + error.message); return null; }
    return { path, preview: URL.createObjectURL(file) };
  }

  const onMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setUploading(true); const img = await upload(file); setUploading(false);
    if (img) setMain(img);
  };
  const onGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 10 - gallery.length); e.target.value = "";
    setUploading(true);
    for (const file of files) { const img = await upload(file); if (img) setGallery((g) => [...g, img]); }
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const specObj: Record<string, string> = {};
    for (const s of specs) if (s.k.trim()) specObj[s.k.trim()] = s.v.trim();
    const parsed = productInput.safeParse({
      ...f,
      original_price_npr: f.original_price_npr === "" ? null : f.original_price_npr,
      price_npr: f.price_npr === "" ? undefined : f.price_npr,
      image_url: main?.path ?? null,
      gallery: gallery.map((g) => g.path),
      specifications: specObj,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      features: f.features.split("\n").map((t) => t.trim()).filter(Boolean),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { const k = String(i.path[0]); errs[k] ??= i.message; });
      setErrors(errs); toast.error("Please fix the highlighted fields"); return;
    }
    setErrors({}); setBusy(true);
    try {
      const res = await save({ data: { id: initial?.id, product: parsed.data } });
      if (!res.ok) { toast.error(res.error); if (res.error.includes("slug")) setErrors({ slug: res.error }); if (res.error.includes("SKU")) setErrors({ sku: res.error }); return; }
      await qc.invalidateQueries({ queryKey: ["admin"] });
      await qc.invalidateQueries({ queryKey: ["catalog"] });
      toast.success(initial ? "Product updated" : "Product created");
      navigate({ to: "/admin/products" });
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  };

  const Field = ({ id, label, children, hint }: { id: string; label: string; children: React.ReactNode; hint?: string }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {errors[id] ? <p className="text-xs text-destructive">{errors[id]}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]" noValidate>
      <div className="space-y-6">
        <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="name" label="Product name *">
              <input id="name" className={inputCls} value={f.name} onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
            </Field>
          </div>
          <Field id="slug" label="Slug *" hint="Used in the product's web address.">
            <input id="slug" className={inputCls} value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
          </Field>
          <Field id="sku" label="SKU">
            <input id="sku" className={inputCls} value={f.sku} onChange={(e) => set("sku", e.target.value)} />
          </Field>
          <Field id="brand" label="Brand">
            <input id="brand" className={inputCls} value={f.brand} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <Field id="category" label="Category *">
            <select id="category" className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Choose…</option>
              {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field id="short_description" label="Short description">
              <input id="short_description" className={inputCls} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field id="description" label="Full description">
              <textarea id="description" rows={5} className={inputCls} value={f.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
          <h2 className="font-semibold sm:col-span-2">Price & stock</h2>
          <Field id="price_npr" label="Selling price (NPR) *">
            <input id="price_npr" inputMode="decimal" className={inputCls} value={f.price_npr} onChange={(e) => set("price_npr", e.target.value)} />
          </Field>
          <Field id="original_price_npr" label="Original price (NPR)" hint="Only if the item is genuinely discounted.">
            <input id="original_price_npr" inputMode="decimal" className={inputCls} value={f.original_price_npr} onChange={(e) => set("original_price_npr", e.target.value)} />
          </Field>
          <Field id="stock_quantity" label="Stock quantity *">
            <input id="stock_quantity" inputMode="numeric" className={inputCls} value={f.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} />
          </Field>
          <Field id="low_stock_threshold" label="Low-stock alert at *">
            <input id="low_stock_threshold" inputMode="numeric" className={inputCls} value={f.low_stock_threshold} onChange={(e) => set("low_stock_threshold", e.target.value)} />
          </Field>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Specifications</h2>
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input aria-label="Specification name" placeholder="e.g. Capacity" className={inputCls} value={s.k} onChange={(e) => setSpecs((x) => x.map((y, j) => j === i ? { ...y, k: e.target.value } : y))} />
              <input aria-label="Specification value" placeholder="e.g. 340 L" className={inputCls} value={s.v} onChange={(e) => setSpecs((x) => x.map((y, j) => j === i ? { ...y, v: e.target.value } : y))} />
              <button type="button" aria-label="Remove specification" onClick={() => setSpecs((x) => x.filter((_, j) => j !== i))} className="px-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" onClick={() => setSpecs((x) => [...x, { k: "", v: "" }])} className={btnGhost}><Plus className="h-4 w-4" /> Add specification</button>
          <Field id="features" label="Key features" hint="One per line.">
            <textarea id="features" rows={3} className={inputCls} value={f.features} onChange={(e) => set("features", e.target.value)} />
          </Field>
          <Field id="tags" label="Tags" hint="Comma separated — used for search.">
            <input id="tags" className={inputCls} value={f.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h2 className="font-semibold">Main image</h2>
          {main ? (
            <div className="relative">
              <img src={main.preview} alt="Main product preview" className="aspect-square w-full rounded-xl object-cover" />
              <button type="button" onClick={() => setMain(null)} aria-label="Remove main image" className="absolute right-2 top-2 rounded-full bg-card p-1.5 shadow-card"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary">
              <ImagePlus className="h-6 w-6" /> Upload image
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onMain} />
            </label>
          )}
          <p className="text-xs text-muted-foreground">JPEG, PNG or WebP · max 5 MB</p>
          <h3 className="pt-2 text-sm font-semibold">Gallery</h3>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map((g, i) => (
              <div key={g.path} className="relative">
                <img src={g.preview} alt={`Gallery image ${i + 1}`} className="aspect-square w-full rounded-lg object-cover" />
                <button type="button" aria-label="Remove gallery image" onClick={() => setGallery((x) => x.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-card p-1 shadow-card"><X className="h-3 w-3" /></button>
              </div>
            ))}
            {gallery.length < 10 && (
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary" aria-label="Add gallery images">
                <Plus className="h-5 w-5" />
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onGallery} />
              </label>
            )}
          </div>
          {uploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
        </section>
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          {([["is_active", "Published (visible in store)"], ["is_featured", "Featured on homepage"], ["is_new", "Mark as new"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} className="h-4 w-4 accent-primary" /> {l}
            </label>
          ))}
        </section>
        <div className="flex gap-2">
          <button type="submit" disabled={busy || uploading} className={`${btnPrimary} flex-1`}>{busy ? "Saving…" : initial ? "Save changes" : "Create product"}</button>
          <button type="button" onClick={() => navigate({ to: "/admin/products" })} className={btnGhost}>Cancel</button>
        </div>
      </aside>
    </form>
  );
}
