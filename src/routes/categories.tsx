import { createFileRoute, Link } from "@tanstack/react-router";
import { categories } from "@/data/categories";
import { useSuspenseQuery } from "@tanstack/react-query";
import { inCategory, productsQuery } from "@/lib/catalog-queries";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/categories")({
  head: () => pageHead({
    title: "Product Categories — Sharma Electronics Kalaiya",
    description: "Shop by category at Sharma Electronics in Kalaiya, Bara: refrigerators, washing machines, TVs, ACs, phones, laptops, kitchen and audio.",
    path: "/categories",
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: products } = useSuspenseQuery(productsQuery());
  return (
    <div className="container-x py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "Categories" }]} />
      <h1 className="mt-4 font-serif text-5xl">Categories</h1>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link to="/category/$slug" params={{ slug: c.slug }} className="group block overflow-hidden rounded-2xl border border-border bg-card hover:shadow-card-hover">
              <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
              <div className="p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">{inCategory(products, c.slug).length} products</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
