import type { StockStatus } from "@/types/product";

/** Single source of truth for stock status. */
export function stockStatus(quantity: number, threshold: number): StockStatus {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= threshold) return "low_stock";
  return "in_stock";
}

export const stockLabel: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};
