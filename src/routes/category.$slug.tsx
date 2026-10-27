import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { categories, getCategory } from "@/data/categories";
import { productsInCategory } from "@/data/products";
import { CatalogBrowser, type CatalogState } from "@/components/products/CatalogBrowser";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { breadcrumbLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData, params }) => loaderData ? pageHead({
    title: `${loaderData.category.name} Price in Kalaiya, Bara — Sharma Electronics`,
    description: loaderData.category.seoDescription,
    path: `/category/${params.slug}`,
    jsonLd: [breadcrumbLd([{ name: "Home", path: "/" }, { name: "Categories", path: "/categories" }, { name: loaderData.category.name, path: `/category/${params.slug}` }])],
  }) : { meta: [{ title: "Category not found — Sharma Electronics" }, { name: "robots", content: "noindex" }] },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const [state, setState] = useState<CatalogState>({});
  const items = productsInCategory(category.slug);
  return (
    <div className="container-x py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "Categories", to: "/categories" }, { name: category.name }]} />
      <div className="mt-6 grid items-center gap-6 overflow-hidden rounded-[2rem] bg-ink p-6 text-ink-foreground sm:grid-cols-[1fr_auto] sm:p-10">
        <div>
          <h1 className="font-serif text-5xl sm:text-6xl">{category.name}</h1>
          <p className="mt-3 max-w-xl text-ink-muted">{category.description}</p>
        </div>
        <img src={category.image} alt={category.name} width={816} height={816} className="h-40 w-40 rounded-2xl object-cover sm:h-48 sm:w-48" />
      </div>
      <div className="mt-10">
        {items.length ? <CatalogBrowser products={items} state={state} onChange={setState} hideCategory /> :
          <p className="text-muted-foreground">No products listed in this category yet. Message us on WhatsApp to ask.</p>}
      </div>
      <nav aria-label="Other categories" className="mt-16">
        <h2 className="mb-4 font-semibold">Other categories</h2>
        <ul className="flex flex-wrap gap-2">
          {categories.filter((c) => c.slug !== category.slug).map((c) => (
            <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary">{c.name}</Link></li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
