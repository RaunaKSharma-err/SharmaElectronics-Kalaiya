import { describe, expect, it } from "vitest";
import { productOrderLink, generalInquiryLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { products } from "@/data/products";
import { filterProducts } from "@/components/products/CatalogBrowser";

describe("store rules", () => {
  it("WhatsApp links go to 9779845188755", () => {
    expect(generalInquiryLink().startsWith("https://wa.me/9779845188755?text=")).toBe(true);
    expect(productOrderLink(products[0]!)).toContain("wa.me/9779845188755");
  });
  it("prices format as NPR", () => {
    expect(formatPrice(24999)).toBe("NPR 24,999");
  });
  it("price low-to-high sorting", () => {
    const r = filterProducts(products, { sort: "price-asc" });
    expect(r[0]!.priceNPR).toBeLessThanOrEqual(r[r.length - 1]!.priceNPR);
  });
});
