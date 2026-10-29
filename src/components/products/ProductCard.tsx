import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/format";
import { stockLabel } from "@/lib/stock";
import { productOrderLink } from "@/lib/whatsapp";
import { absUrl } from "@/lib/seo";

export function AvailabilityDot({ a }: { a: Product["stockStatus"] }) {
  const c = a === "in_stock" ? "bg-success" : a === "low_stock" ? "bg-warning" : "bg-destructive";
  return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`h-1.5 w-1.5 rounded-full ${c}`} />{stockLabel[a]}</span>;
}

export function ProductCard({ product }: { product: Product }) {
  const discount = product.originalPriceNPR && product.originalPriceNPR > product.priceNPR
    ? Math.round((1 - product.priceNPR / product.originalPriceNPR) * 100) : 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-square overflow-hidden bg-secondary">
        <img src={product.image} alt={`${product.brand ? product.brand + " " : ""}${product.name}`} loading="lazy" width={816} height={816}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.isNew && <span className="rounded-full bg-ink px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-foreground">New</span>}
          {discount > 0 && <span className="rounded-full bg-primary px-2.5 py-1 text-[0.65rem] font-semibold text-primary-foreground">-{discount}%</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.brand && <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{product.brand}</p>}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-[0.95rem]">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">{product.name}</Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
          <span className="text-lg font-bold tracking-tight">{formatPrice(product.priceNPR)}</span>
          {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPriceNPR!)}</span>}
        </div>
        <AvailabilityDot a={product.stockStatus} />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Link to="/product/$slug" params={{ slug: product.slug }}
            className="rounded-lg border border-border px-2 py-2 text-center text-xs font-semibold transition hover:border-foreground sm:text-sm">Details</Link>
          <a href={productOrderLink(product, absUrl(`/product/${product.slug}`))} target="_blank" rel="noopener noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-whatsapp px-2 py-2 text-xs font-semibold text-whatsapp-foreground transition hover:brightness-110 sm:text-sm">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Order
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[380px]:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
