import { createFileRoute } from "@tanstack/react-router";
import { categories } from "@/data/categories";
import { listActiveProducts } from "@/lib/catalog.functions";
import { store } from "@/config/store";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const products = await listActiveProducts();
        const base = (store.websiteUrl || new URL(request.url).origin).replace(/\/$/, "");
        const paths = ["/", "/products", "/categories", "/about", "/contact", "/privacy-policy",
          ...categories.map((c) => `/category/${c.slug}`), ...products.map((p) => `/product/${p.slug}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${base}${p}</loc></url>`).join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
