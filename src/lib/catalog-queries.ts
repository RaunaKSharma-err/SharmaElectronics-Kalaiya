import { queryOptions } from "@tanstack/react-query";
import { getActiveProduct, listActiveProducts } from "@/lib/catalog.functions";
import type { Product } from "@/types/product";

export const productsQuery = () =>
  queryOptions({ queryKey: ["catalog", "products"], queryFn: () => listActiveProducts(), staleTime: 60_000 });

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["catalog", "product", slug], queryFn: () => getActiveProduct({ data: slug }), staleTime: 60_000 });

export const featured = (ps: Product[]) => ps.filter((p) => p.featured);
export const inCategory = (ps: Product[], slug: string) => ps.filter((p) => p.category === slug);
export const related = (ps: Product[], p: Product, n = 4) =>
  ps.filter((x) => x.category === p.category && x.slug !== p.slug)
    .concat(ps.filter((x) => x.category !== p.category && x.featured)).slice(0, n);
