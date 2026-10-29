import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle } from "lucide-react";
import { getCategory } from "@/data/categories";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productQuery, productsQuery, related } from "@/lib/catalog-queries";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AvailabilityDot, ProductGrid } from "@/components/products/ProductCard";
import { formatPrice } from "@/lib/format";
import { productOrderLink } from "@/lib/whatsapp";
import { absUrl, breadcrumbLd, pageHead } from "@/lib/seo";
import { store } from "@/config/store";

const schemaAvail = { in_stock: "InStock", low_stock: "LimitedAvailability", out_of_stock: "OutOfStock" } as const;

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(productsQuery()),
    ]);
    if (!product) throw notFound();
    return { product, category: getCategory(product.category)! };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Product not found — Sharma Electronics" }, { name: "robots", content: "noindex" }] };
    const { product: p, category: c } = loaderData;
    const path = `/product/${params.slug}`;
    return pageHead({
      title: p.seoTitle ?? `${p.brand ? p.brand + " " : ""}${p.name} — ${formatPrice(p.priceNPR)} | Sharma Electronics Kalaiya`,
      description: p.seoDescription ?? `${p.shortDescription} Listed at ${formatPrice(p.priceNPR)} at Sharma Electronics, Kalaiya, Bara. Order on WhatsApp.`,
      path, type: "product",
      jsonLd: [
        breadcrumbLd([{ name: "Home", path: "/" }, { name: c.name, path: `/category/${c.slug}` }, { name: p.name, path }]),
        { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, sku: p.id, image: p.image.startsWith("http") ? [p.image] : undefined,
          ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
          ...(store.pricesVerified ? { offers: { "@type": "Offer", priceCurrency: "NPR", price: p.priceNPR, availability: `https://schema.org/${schemaAvail[p.stockStatus]}`, url: absUrl(path), seller: { "@type": "Organization", name: store.name } } } : {}) },
      ],
    });
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p, category: c } = Route.useLoaderData();
  const { data: all } = useSuspenseQuery(productsQuery());
  const discount = p.originalPriceNPR && p.originalPriceNPR > p.priceNPR;
  return (
    <div className="container-x py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: c.name, to: "/category/$slug", params: { slug: c.slug } }, { name: p.name }]} />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
          <img src={p.image} alt={`${p.brand ?? ""} ${p.name}`.trim()} width={816} height={816} className="aspect-square w-full object-cover" />
        </div>
        <div className="lg:py-4">
          {p.brand && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{p.brand}</p>}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-3 text-muted-foreground">{p.shortDescription}</p>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold tracking-tight">{formatPrice(p.priceNPR)}</span>
            {discount && <span className="text-muted-foreground line-through">{formatPrice(p.originalPriceNPR!)}</span>}
          </div>
          <div className="mt-2"><AvailabilityDot a={p.stockStatus} /></div>
          <a href={productOrderLink(p, absUrl(`/product/${p.slug}`))} target="_blank" rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp py-4 font-semibold text-whatsapp-foreground transition hover:brightness-110 sm:w-auto sm:px-10 sm:inline-flex">
            <MessageCircle className="h-5 w-5" /> Order on WhatsApp
          </a>
          <p className="mt-3 text-xs text-muted-foreground">Opens a WhatsApp chat with {store.name} with this product's details pre-filled.</p>
          {p.features && p.features.length > 0 && (
            <ul className="mt-8 grid gap-2">
              {p.features.map((f) => <li key={f} className="flex gap-2 text-sm"><Check className="h-4 w-4 text-primary" aria-hidden />{f}</li>)}
            </ul>
          )}
          <h2 className="mt-8 font-semibold">Description</h2>
          <p className="mt-2 text-muted-foreground">{p.description}</p>
          {Object.keys(p.specifications).length > 0 && (
            <>
              <h2 className="mt-8 font-semibold">Specifications</h2>
              <table className="mt-3 w-full overflow-hidden rounded-xl border border-border bg-card text-sm">
                <tbody>
                  {Object.entries(p.specifications).map(([k, v]) => (
                    <tr key={k} className="border-b border-border last:border-0">
                      <th scope="row" className="w-2/5 bg-secondary px-4 py-3 text-left font-medium text-muted-foreground">{k}</th>
                      <td className="px-4 py-3">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <Link to="/products" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to all products</Link>
        </div>
      </div>
      <section className="mt-20">
        <h2 className="mb-6 font-serif text-4xl">You may also like</h2>
        <ProductGrid products={related(all, p)} />
      </section>
    </div>
  );
}
