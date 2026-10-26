export function formatPrice(npr: number): string {
  return `NPR ${Math.round(npr).toLocaleString("en-IN")}`;
}

export const availabilityLabel = {
  in_stock: "In stock",
  limited: "Limited stock",
  out_of_stock: "Out of stock",
  on_request: "Ask for availability",
} as const;
