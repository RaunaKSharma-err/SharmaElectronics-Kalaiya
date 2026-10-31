import { describe, expect, it } from "vitest";
import { generalInquiryLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { stockStatus } from "@/lib/stock";
import { productInput, validateImageFile } from "@/lib/product-validation";

const base = { name: "TV", slug: "tv", category: "televisions", price_npr: 1000, stock_quantity: 1, low_stock_threshold: 5 };

describe("store rules", () => {
  it("WhatsApp links go to 9779845188755", () => {
    expect(generalInquiryLink().startsWith("https://wa.me/9779845188755?text=")).toBe(true);
  });
  it("prices format as NPR", () => expect(formatPrice(24999)).toBe("NPR 24,999"));
  it("stock 0 is out of stock", () => expect(stockStatus(0, 5)).toBe("out_of_stock"));
  it("stock at threshold is low", () => expect(stockStatus(5, 5)).toBe("low_stock"));
  it("stock above threshold is in stock", () => expect(stockStatus(6, 5)).toBe("in_stock"));
  it("rejects negative stock", () => expect(productInput.safeParse({ ...base, stock_quantity: -1 }).success).toBe(false));
  it("rejects negative price", () => expect(productInput.safeParse({ ...base, price_npr: -5 }).success).toBe(false));
  it("rejects original price not above selling price", () =>
    expect(productInput.safeParse({ ...base, original_price_npr: 900 }).success).toBe(false));
  it("blank SKU becomes null", () => expect(productInput.parse({ ...base, sku: "  " }).sku).toBeNull());
  it("rejects images over 5 MB and non-images", () => {
    expect(validateImageFile({ type: "image/png", size: 6 * 1024 * 1024, name: "a.png" })).not.toBeNull();
    expect(validateImageFile({ type: "application/x-msdownload", size: 10, name: "a.exe" })).not.toBeNull();
    expect(validateImageFile({ type: "image/webp", size: 10, name: "a.webp" })).toBeNull();
  });
});
