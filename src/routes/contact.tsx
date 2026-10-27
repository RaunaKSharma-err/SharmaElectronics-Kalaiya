import { createFileRoute } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { store, storeLocation } from "@/config/store";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { generalInquiryLink } from "@/lib/whatsapp";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => pageHead({
    title: "Contact Sharma Electronics Kalaiya — WhatsApp",
    description: "Contact Sharma Electronics in Kalaiya, Bara on WhatsApp to ask about products, prices and availability.",
    path: "/contact",
  }),
  component: () => (
    <div className="container-x py-10">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "Contact" }]} />
      <h1 className="mt-4 font-serif text-5xl sm:text-6xl">Contact us</h1>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-ink p-8 text-ink-foreground sm:p-12">
          <h2 className="font-serif text-3xl">Chat on WhatsApp</h2>
          <p className="mt-3 text-ink-muted">The fastest way to ask about a product or place an order.</p>
          <a href={generalInquiryLink()} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 font-semibold text-whatsapp-foreground">
            <MessageCircle className="h-5 w-5" /> {store.whatsappDisplay}
          </a>
        </div>
        <div className="space-y-4 rounded-[2rem] border border-border bg-card p-8 sm:p-12">
          <h2 className="font-serif text-3xl">Visit the shop</h2>
          <p className="flex gap-2 text-muted-foreground"><MapPin className="mt-1 h-4 w-4 shrink-0" />{store.address ? `${store.address}, ` : ""}{storeLocation}</p>
          {store.openingHours && <p className="text-muted-foreground">Hours: {store.openingHours}</p>}
          {store.phone && <p><a href={`tel:${store.phone}`} className="font-semibold">{store.phone}</a></p>}
          {store.email && <p><a href={`mailto:${store.email}`} className="font-semibold">{store.email}</a></p>}
          {store.googleMapsUrl && <a href={store.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-semibold text-primary">Open in Google Maps →</a>}
        </div>
      </div>
    </div>
  ),
});
