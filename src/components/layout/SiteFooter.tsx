import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { store, storeLocation } from "@/config/store";
import { categories } from "@/data/categories";
import { generalInquiryLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function SiteFooter() {
  const socials = Object.entries(store.socialLinks).filter(([, v]) => v);
  return (
    <footer className="bg-ink text-ink-muted">
      <div className="container-x grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed">Electronics and home appliances for modern living, from a local shop in {store.city}, {store.district}.</p>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground">Categories</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-ink-foreground">{c.name}</Link></li>
            ))}
            <li><Link to="/categories" className="text-cyan hover:underline">All categories</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground">Store</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-ink-foreground">All products</Link></li>
            <li><Link to="/about" className="hover:text-ink-foreground">About</Link></li>
            <li><Link to="/contact" className="hover:text-ink-foreground">Contact</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-ink-foreground">Privacy policy</Link></li>
          </ul>
        </div>
        <div className="space-y-3 text-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-ink-foreground">Contact</h2>
          <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{store.address ? `${store.address}, ` : ""}{storeLocation}</p>
          {store.email && <p><a href={`mailto:${store.email}`} className="hover:text-ink-foreground">{store.email}</a></p>}
          {store.openingHours && <p>{store.openingHours}</p>}
          <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 font-semibold text-whatsapp-foreground">
            <MessageCircle className="h-4 w-4" aria-hidden /> {store.whatsappDisplay}
          </a>
          {socials.length > 0 && (
            <ul className="flex gap-3 pt-2">{socials.map(([k, v]) => <li key={k}><a href={v} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-ink-foreground">{k}</a></li>)}</ul>
          )}
        </div>
      </div>
      <div className="border-t border-ink-border">
        <p className="container-x py-6 text-xs">© {new Date().getFullYear()} {store.name}, {store.city}. All rights reserved.</p>
      </div>
    </footer>
  );
}
