import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { productInput } from "@/lib/product-validation";
import { isStoragePath } from "@/lib/images";
import { stockStatus } from "@/lib/stock";
import type { AdminProduct } from "@/types/product";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(ctx: Ctx) {
  const { data, error } = await ctx.supabase.rpc("is_admin");
  if (error || data !== true) throw new Error("Forbidden: administrator access required");
}

function friendly(err: { code?: string; message?: string; details?: string } | null): string {
  if (!err) return "Unknown error";
  if (err.code === "23505") {
    const m = `${err.message} ${err.details ?? ""}`;
    if (m.includes("sku")) return "Another product already uses this SKU.";
    if (m.includes("slug")) return "Another product already uses this slug.";
    return "This value is already in use.";
  }
  if (err.code === "23514") return "A value is out of range (prices and stock must be zero or more).";
  if (err.code === "42501") return "You are not allowed to do that.";
  return err.message ?? "Request failed";
}

async function signAll(sb: any, rows: AdminProduct[]) {
  const paths = Array.from(new Set(rows.flatMap((r) => [r.image_url, ...(r.gallery ?? [])]).filter(isStoragePath)));
  const signed: Record<string, string> = {};
  if (paths.length) {
    const { data } = await sb.storage.from("product-images").createSignedUrls(paths, 3600);
    data?.forEach((d: { path: string | null; signedUrl: string }) => { if (d.path) signed[d.path] = d.signedUrl; });
  }
  return signed;
}

/** Remove storage objects no longer referenced by any product. */
async function cleanupImages(sb: any, candidates: (string | null | undefined)[]) {
  const paths = Array.from(new Set(candidates.filter(isStoragePath)));
  if (!paths.length) return;
  const { data } = await sb.from("products").select("image_url, gallery");
  const used = new Set<string>((data ?? []).flatMap((r: { image_url: string | null; gallery: string[] }) => [r.image_url, ...(r.gallery ?? [])]));
  const orphans = paths.filter((p) => !used.has(p));
  if (orphans.length) await sb.storage.from("product-images").remove(orphans);
}

export const checkAdmin = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context as Ctx).supabase.rpc("is_admin");
    return { isAdmin: data === true };
  });

export const adminListProducts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    const { data, error } = await ctx.supabase.from("products").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error(friendly(error));
    const rows = (data ?? []).map((r: AdminProduct) => ({ ...r, price_npr: Number(r.price_npr), original_price_npr: r.original_price_npr == null ? null : Number(r.original_price_npr) })) as AdminProduct[];
    return { rows, signed: await signAll(ctx.supabase, rows) };
  });

export const adminGetProduct = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ context, data: id }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    const { data, error } = await ctx.supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(friendly(error));
    if (!data) return null;
    const row = { ...data, price_npr: Number(data.price_npr), original_price_npr: data.original_price_npr == null ? null : Number(data.original_price_npr) } as AdminProduct;
    return { row, signed: await signAll(ctx.supabase, [row]) };
  });

export const adminDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    const { data, error } = await ctx.supabase.from("products").select("id, name, slug, is_active, stock_quantity, low_stock_threshold, updated_at, price_npr").order("updated_at", { ascending: false });
    if (error) throw new Error(friendly(error));
    const rows = data ?? [];
    const st = rows.map((r: { stock_quantity: number; low_stock_threshold: number }) => stockStatus(r.stock_quantity, r.low_stock_threshold));
    return {
      total: rows.length,
      active: rows.filter((r: { is_active: boolean }) => r.is_active).length,
      low: st.filter((s: string) => s === "low_stock").length,
      out: st.filter((s: string) => s === "out_of_stock").length,
      recent: rows.slice(0, 6),
    };
  });

export const adminSaveProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), product: productInput }).parse(input))
  .handler(async ({ context, data }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    if (data.id) {
      const { data: prev } = await ctx.supabase.from("products").select("image_url, gallery").eq("id", data.id).maybeSingle();
      const { error } = await ctx.supabase.from("products").update(data.product).eq("id", data.id);
      if (error) return { ok: false as const, error: friendly(error) };
      if (prev) {
        const keep = new Set([data.product.image_url, ...data.product.gallery]);
        await cleanupImages(ctx.supabase, [prev.image_url, ...(prev.gallery ?? [])].filter((p) => !keep.has(p)));
      }
      return { ok: true as const, id: data.id };
    }
    const { data: row, error } = await ctx.supabase.from("products").insert(data.product).select("id").single();
    if (error) return { ok: false as const, error: friendly(error) };
    return { ok: true as const, id: row.id as string };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((id: string) => z.string().uuid().parse(id))
  .handler(async ({ context, data: id }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    const { data: prev } = await ctx.supabase.from("products").select("image_url, gallery").eq("id", id).maybeSingle();
    const { error } = await ctx.supabase.from("products").delete().eq("id", id);
    if (error) return { ok: false as const, error: friendly(error) };
    if (prev) await cleanupImages(ctx.supabase, [prev.image_url, ...(prev.gallery ?? [])]);
    return { ok: true as const };
  });

export const adminSetStock = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid(),
    set: z.number().int().min(0).optional(),
    delta: z.number().int().min(-100000).max(100000).optional(),
    threshold: z.number().int().min(0).optional(),
  }).parse(input))
  .handler(async ({ context, data }) => {
    const ctx = context as Ctx; await assertAdmin(ctx);
    if (data.threshold != null) {
      const { error } = await ctx.supabase.from("products").update({ low_stock_threshold: data.threshold }).eq("id", data.id);
      if (error) return { ok: false as const, error: friendly(error) };
    }
    if (data.set != null || data.delta != null) {
      const { data: q, error } = await ctx.supabase.rpc("adjust_stock", { _product_id: data.id, _set: data.set ?? null, _delta: data.delta ?? null });
      if (error) return { ok: false as const, error: friendly(error) };
      return { ok: true as const, quantity: q as number };
    }
    return { ok: true as const };
  });
