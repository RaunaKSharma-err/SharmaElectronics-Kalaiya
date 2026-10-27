import { createFileRoute } from "@tanstack/react-router";
import { store } from "@/config/store";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy-policy")({
  head: () => pageHead({ title: "Privacy Policy — Sharma Electronics", description: "How the Sharma Electronics website handles your information.", path: "/privacy-policy" }),
  component: () => (
    <div className="container-x max-w-3xl space-y-4 py-10 text-muted-foreground">
      <Breadcrumbs items={[{ name: "Home", to: "/" }, { name: "Privacy Policy" }]} />
      <h1 className="font-serif text-5xl text-foreground">Privacy Policy</h1>
      <p>This website is a product catalog for {store.name}. It has no accounts, no online payments and does not store personal information you enter.</p>
      <p>When you tap a WhatsApp button, WhatsApp opens with a pre-filled message. Anything you send is shared with us through WhatsApp and is governed by WhatsApp's own privacy policy. We use it only to answer your inquiry and process your order.</p>
      <p>Our hosting provider may keep standard technical logs (such as IP address and browser type) for security and performance.</p>
      <p>Questions about this policy? Contact us on WhatsApp.</p>
    </div>
  ),
});
