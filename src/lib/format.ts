export function formatPrice(npr: number): string {
  return `NPR ${Math.round(npr).toLocaleString("en-IN")}`;
}

export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90);
}
