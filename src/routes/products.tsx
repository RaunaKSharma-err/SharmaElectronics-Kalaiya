import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { products } from "@/data/products";
import { CatalogBrowser, type CatalogState, type Sort } from "@/components/products/CatalogBrowser";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { breadcrumbLd, pageHead } from "@/lib/seo";

const sorts: Sort[] = ["featured", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/products")({
  validateSearch: (s: Record<string, unknown>): CatalogState => ({
    q: typeof s.q === "string" && s.q ? s.q : undefined,
    category: typeof s.category === "string" && s.category ? s.category : undefined,
    brand: typeof s.brand === "string" && s.brand ? s.brand : undefined,
    sort: sorts.includes(s.sort as Sort) ? (s.sort as Sort) : undefined,
  }),
  head: () => pageHead({
    title: "All Products & Prices — Sharma Electronics Kalaiya",
    description: "Browse every product at Sharma Electronics, Kalaiya: appliances, TVs, phones, audio and accessories with NPR prices. Search, filter and order on WhatsApp.",
    path: "/products",
    jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "All Products", path: "/products" }])],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  return (
    <div className="container-x py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "All Products" }]} />
      <h1 className="mt-4 font-serif text-5xl">All Products</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Electronics and home appliances available at Sharma Electronics, Kalaiya. Prices in NPR.</p>
      <div className="mt-8">
        <CatalogBrowser products={products} state={search} onChange={(s) => navigate({ search: s, replace: true, resetScroll: false })} />
      </div>
    </div>
  );
}
