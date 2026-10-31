import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Eye, MapPin, MessageCircle, Search } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { categories, getCategory } from "@/data/categories";
import { useSuspenseQuery } from "@tanstack/react-query";
import { featured, productsQuery } from "@/lib/catalog-queries";
import { ProductGrid } from "@/components/products/ProductCard";
import { store } from "@/config/store";
import { generalInquiryLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead({
    title: "Sharma Electronics Kalaiya — Electronics & Home Appliances in Bara",
    description: "Electronics shop in Kalaiya, Bara. Browse refrigerators, washing machines, TVs, ACs, phones and more with visible prices — order on WhatsApp.",
    path: "/",
    image: hero,
    jsonLd: [{ "@context": "https://schema.org", "@type": "WebSite", name: store.name, ...(store.websiteUrl ? { url: store.websiteUrl } : {}) }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQuery()),
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQuery());
  const feat = featured(products);
  const big0 = ["refrigerators", "washing-machines", "televisions", "air-conditioners"];
  const promos = [feat.find((p) => !big0.includes(p.category)), feat.find((p) => big0.includes(p.category) && p.category !== "refrigerators")].filter((p): p is NonNullable<typeof p> => !!p);
  const big = ["refrigerators", "washing-machines", "televisions", "air-conditioners", "kitchen-appliances"];
  const sections = [
    { title: "Home Appliance Essentials", items: products.filter((p) => big.includes(p.category)).slice(0, 4), to: "refrigerators" },
    { title: "Everyday Electronics", items: products.filter((p) => ["smartphones", "laptops-computers", "small-home-appliances", "other-electronics"].includes(p.category)).slice(0, 4), to: "smartphones" },
    { title: "Audio & Accessories", items: products.filter((p) => ["earbuds-headphones", "speakers-audio", "electrical-accessories"].includes(p.category)).slice(0, 4), to: "earbuds-headphones" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative bg-ink pb-16 text-ink-foreground">
        <div className="pointer-events-none absolute inset-0 bg-glow opacity-60" />
        <div className="container-x relative grid gap-4 pt-6 lg:grid-cols-3 lg:pt-8">
          <div className="relative overflow-hidden rounded-3xl border border-ink-border bg-ink-2 lg:col-span-2 lg:row-span-2">
            <img src={hero} alt="Refrigerator, washing machine and smart TV in a dark studio" width={1600} height={1008} fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-[70%_center] animate-float-slow" />
            <div className="absolute inset-0 bg-hero-fade" />
            <div className="relative flex min-h-[520px] flex-col justify-end p-6 sm:p-10 lg:min-h-[600px]">
              <p className="animate-rise text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{store.city} · {store.district} · Nepal</p>
              <h1 className="animate-rise mt-4 max-w-xl font-serif text-5xl leading-[0.95] sm:text-7xl" style={{ animationDelay: "80ms" }}>
                Technology for a <em className="text-cyan">Better</em> Everyday.
              </h1>
              <p className="animate-rise mt-5 max-w-md text-ink-muted" style={{ animationDelay: "160ms" }}>
                Discover electronics and home appliances for modern living at Sharma Electronics, Kalaiya.
              </p>
              <div className="animate-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-ink-foreground px-6 py-3 text-sm font-semibold text-ink transition hover:bg-cyan">
                  Explore Products <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-border bg-ink/40 px-6 py-3 text-sm font-semibold backdrop-blur hover:border-whatsapp">
                  <MessageCircle className="h-4 w-4 text-whatsapp" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
          {promos.map((p) => (
            <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }}
              className="group relative grid grid-cols-[1fr_auto] items-end overflow-hidden rounded-3xl border border-ink-border bg-ink-3 p-6">
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{getCategory(p.category)!.name}</p>
                <h2 className="mt-2 font-serif text-3xl leading-tight">{p.name}</h2>
                <p className="mt-3 text-sm font-semibold text-cyan">{formatPrice(p.priceNPR)}</p>
              </div>
              <img src={p.image} alt="" loading="lazy" width={816} height={816} className="h-36 w-36 rounded-2xl object-cover opacity-90 transition group-hover:scale-105 sm:h-44 sm:w-44" />
              <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-ink-muted group-hover:text-ink-foreground" />
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="relative -mt-8 rounded-t-[2rem] bg-background pt-16" aria-labelledby="cat-h">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Browse</p>
              <h2 id="cat-h" className="mt-2 font-serif text-4xl sm:text-5xl">Shop by Category</h2>
            </div>
            <Link to="/categories" className="hidden text-sm font-semibold hover:text-primary sm:inline-flex">All categories →</Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-card-hover">
                  <img src={c.image} alt={c.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                  <p className="px-3 py-3 text-sm font-semibold">{c.name}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-20" aria-labelledby="feat-h">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between">
            <h2 id="feat-h" className="font-serif text-4xl sm:text-5xl">Featured Products</h2>
            <Link to="/products" className="text-sm font-semibold hover:text-primary">View all →</Link>
          </div>
          <ProductGrid products={feat.slice(0, 8)} />
        </div>
      </section>

      {/* SPOTLIGHT */}
      <section className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-14">
          <div className="pointer-events-none absolute inset-0 bg-glow" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Large appliances</p>
              <h2 className="mt-4 font-serif text-5xl leading-none sm:text-6xl">Make Home Feel Smarter.</h2>
              <p className="mt-5 max-w-md text-ink-muted">Refrigerators, washing machines, TVs and air conditioners — compare listed prices and ask us anything on WhatsApp.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {big.map((s) => (
                  <Link key={s} to="/category/$slug" params={{ slug: s }} className="rounded-full border border-ink-border px-4 py-2 text-sm hover:border-cyan hover:text-cyan">{getCategory(s)!.name}</Link>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["refrigerators", "washing-machines", "televisions", "air-conditioners"].map((s) => (
                <Link key={s} to="/category/$slug" params={{ slug: s }} className="overflow-hidden rounded-2xl border border-ink-border">
                  <img src={getCategory(s)!.image} alt={getCategory(s)!.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover transition hover:scale-105" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      {sections.filter((s) => s.items.length).map((s) => (
        <section key={s.title} className="pt-20">
          <div className="container-x">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h2>
              <Link to="/products" className="text-sm font-semibold hover:text-primary">See more →</Link>
            </div>
            <ProductGrid products={s.items} />
          </div>
        </section>
      ))}

      {/* WHY */}
      <section className="py-24">
        <div className="container-x">
          <h2 className="max-w-xl font-serif text-4xl sm:text-5xl">Why shop with Sharma Electronics?</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Eye, t: "See before you ask", d: "Prices and key details for every product, before you message us." },
              { i: MessageCircle, t: "Direct WhatsApp chat", d: "Talk to the shop directly to confirm stock and order." },
              { i: Search, t: "Easy browsing", d: "Search, filter by category or brand, and sort by price." },
              { i: MapPin, t: "Local to Kalaiya", d: "A neighbourhood electronics shop in Kalaiya, Bara." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="rounded-2xl border border-border bg-card p-6">
                <I className="h-6 w-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + CONTACT */}
      <section className="container-x grid gap-4 pb-24 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border bg-card p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">About</p>
          <h2 className="mt-3 font-serif text-4xl">Your local electronics shop.</h2>
          <p className="mt-4 text-muted-foreground">{store.description}</p>
          <Link to="/about" className="mt-6 inline-block text-sm font-semibold hover:text-primary">Learn more →</Link>
        </div>
        <div className="rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan">Contact</p>
          <h2 className="mt-3 font-serif text-4xl">Questions? Just message us.</h2>
          <p className="mt-4 text-ink-muted">Ask about availability, price or a product you don't see listed.</p>
          <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-semibold text-whatsapp-foreground">
            <MessageCircle className="h-5 w-5" /> {store.whatsappDisplay}
          </a>
        </div>
      </section>
    </>
  );
}
