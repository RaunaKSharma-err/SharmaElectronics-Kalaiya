import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, MessageCircle, Search, X } from "lucide-react";
import { useState } from "react";
import { store } from "@/config/store";
import { generalInquiryLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "All Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/products", search: { q: q.trim() || undefined } });
  };

  return (
    <>
      <div className="bg-ink-2 text-center text-xs font-medium tracking-wide text-ink-muted">
        <p className="container-x py-2">{store.announcement}</p>
      </div>
      <header className="sticky top-0 z-40 border-b border-ink-border/60 bg-ink/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center gap-4">
          <Logo />
          <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="rounded-full px-3.5 py-2 text-sm text-ink-muted transition-colors hover:text-ink-foreground data-[status=active]:text-ink-foreground">
                {n.label}
              </Link>
            ))}
          </nav>
          <form onSubmit={submit} role="search" className="ml-auto hidden md:block">
            <label htmlFor="hdr-search" className="sr-only">Search products</label>
            <div className="flex items-center gap-2 rounded-full border border-ink-border bg-ink-3 px-3.5 py-2 focus-within:border-primary">
              <Search className="h-4 w-4 text-ink-muted" aria-hidden />
              <input id="hdr-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search fridges, TVs, phones…"
                className="w-48 bg-transparent text-sm text-ink-foreground placeholder:text-ink-muted focus:outline-none xl:w-64" />
            </div>
          </form>
          <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer"
            className="ml-auto hidden items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-sm font-semibold text-whatsapp-foreground transition hover:brightness-110 sm:inline-flex md:ml-0">
            <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
          </a>
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-auto rounded-full p-2 text-ink-foreground sm:ml-0 lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div id="mobile-nav" className="border-t border-ink-border bg-ink lg:hidden">
            <div className="container-x space-y-4 py-5">
              <form onSubmit={submit} role="search">
                <label htmlFor="m-search" className="sr-only">Search products</label>
                <div className="flex items-center gap-2 rounded-xl border border-ink-border bg-ink-3 px-3.5 py-3">
                  <Search className="h-4 w-4 text-ink-muted" aria-hidden />
                  <input id="m-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products"
                    className="w-full bg-transparent text-base text-ink-foreground placeholder:text-ink-muted focus:outline-none" />
                </div>
              </form>
              <nav aria-label="Mobile" className="grid">
                {nav.map((n) => (
                  <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                    className="border-b border-ink-border/60 py-3 text-lg text-ink-foreground">{n.label}</Link>
                ))}
              </nav>
              <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-whatsapp py-3 font-semibold text-whatsapp-foreground">
                <MessageCircle className="h-5 w-5" aria-hidden /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
