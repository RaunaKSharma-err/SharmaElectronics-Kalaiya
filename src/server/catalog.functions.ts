import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Product } from "@/types/product";
import { stockStatus } from "@/lib/stock";
import { isStoragePath, resolveImage } from "@/lib/images";

const PUBLIC_COLUMNS =
  "id, slug, name, brand, category, short_description, description, price_npr, original_price_npr, image_url, gallery, specifications, features, tags, is_featured, is_new, stock_quantity, low_stock_threshold, created_at";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type Row = Database["public"]["Tables"]["products"]["Row"];

async function toProducts(sb: ReturnType<typeof publicClient>, rows: Row[]): Promise<Product[]> {
  const paths = Array.from(new Set(rows.flatMap((r) => [r.image_url, ...(r.gallery ?? [])]).filter(isStoragePath)));
  const signed: Record<string, string> = {};
  if (paths.length) {
    const { data } = await sb.storage.from("product-images").createSignedUrls(paths, 60 * 60 * 24 * 7);
    data?.forEach((d) => { if (d.path && d.signedUrl) signed[d.path] = d.signedUrl; });
  }
  return rows.map((r) => ({
    id: r.id, slug: r.slug, name: r.name, brand: r.brand ?? undefined, category: r.category,
    shortDescription: r.short_description ?? "", description: r.description ?? "",
    priceNPR: Number(r.price_npr), originalPriceNPR: r.original_price_npr != null ? Number(r.original_price_npr) : undefined,
    image: resolveImage(r.image_url, signed, r.category),
    gallery: (r.gallery ?? []).map((g) => resolveImage(g, signed, r.category)),
    specifications: (r.specifications ?? {}) as Record<string, string>,
    features: (r.features ?? []) as string[],
    featured: r.is_featured, isNew: r.is_new, tags: r.tags ?? [],
    stockStatus: stockStatus(r.stock_quantity, r.low_stock_threshold),
  }));
}

/** Active products only — RLS also hides inactive rows from public clients. */
export const listActiveProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("products").select(PUBLIC_COLUMNS).eq("is_active", true)
    .order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error("Could not load products");
  return toProducts(sb, (data ?? []) as Row[]);
});

export const getActiveProduct = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => String(slug).slice(0, 120))
  .handler(async ({ data: slug }) => {
    const sb = publicClient();
    const { data, error } = await sb.from("products").select(PUBLIC_COLUMNS).eq("is_active", true).eq("slug", slug).maybeSingle();
    if (error) throw new Error("Could not load product");
    if (!data) return null;
    return (await toProducts(sb, [data as Row]))[0]!;
  });
