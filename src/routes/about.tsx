import { createFileRoute, Link } from "@tanstack/react-router";
import { store, storeLocation } from "@/config/store";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => pageHead({
    title: "About Sharma Electronics — Electronics Shop in Kalaiya, Bara",
    description: "Sharma Electronics is a local electronics and home appliance shop in Kalaiya, Bara, Madhesh Province, Nepal.",
    path: "/about",
  }),
  component: () => (
    <div className="container-x max-w-3xl py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "About" }]} />
      <h1 className="mt-4 font-serif text-5xl sm:text-6xl">About Sharma Electronics</h1>
      <p className="mt-6 text-lg text-muted-foreground">{store.description}</p>
      <p className="mt-4 text-muted-foreground">We're based in {storeLocation}. This website lets you check products and listed prices from home, then chat with us directly on WhatsApp to confirm availability and arrange your purchase.</p>
      <Link to="/products" className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Browse products</Link>
    </div>
  ),
});
