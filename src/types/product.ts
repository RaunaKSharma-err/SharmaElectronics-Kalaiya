export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  seoDescription: string;
  image: string;
}

/** Public storefront product (mapped from the database row). */
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string | undefined;
  category: string;
  shortDescription: string;
  description: string;
  priceNPR: number;
  originalPriceNPR?: number | undefined;
  image: string;
  gallery: string[];
  specifications: Record<string, string>;
  features: string[];
  featured: boolean;
  isNew: boolean;
  stockStatus: StockStatus;
  tags: string[];
}

/** Full admin view of a product row. */
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string;
  short_description: string | null;
  description: string | null;
  price_npr: number;
  original_price_npr: number | null;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  gallery: string[];
  specifications: Record<string, string>;
  features: string[];
  tags: string[];
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
