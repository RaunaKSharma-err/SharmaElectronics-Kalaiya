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
const lastmod = new Date().toISOString().slice(0, 10);
const entries = (p: string, priority = "0.7", changefreq = "weekly") =>
  `<url><loc>${base}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
const staticPaths = ["/", "/products", "/categories", "/about", "/contact", "/privacy-policy"];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
  entries("/", "1.0", "daily"),
  ...staticPaths.slice(1).map((p) => entries(p)),
  ...categories.map((c) => entries(`/category/${c.slug}`)),
  ...products.map((p) => entries(`/product/${p.slug}`, "0.8")),
].join("")}</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
