import { store } from "@/config/store";
import type { Product } from "@/types/product";
import { formatPrice } from "./format";

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${store.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function generalInquiryLink(): string {
  return whatsappLink(`Hello ${store.name}, I would like to ask about your products.`);
}

export function productOrderMessage(product: Product, pageUrl?: string): string {
  const lines = [
    `Hello ${store.name}, I'm interested in this product:`,
    "",
    `Product: ${product.name}`,
    product.brand ? `Brand: ${product.brand}` : null,
    `Listed price: ${formatPrice(product.priceNPR)}`,
    pageUrl ? `Link: ${pageUrl}` : null,
    "",
    "Is it available? Please share details.",
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export function productOrderLink(product: Product, pageUrl?: string): string {
  return whatsappLink(productOrderMessage(product, pageUrl));
}
