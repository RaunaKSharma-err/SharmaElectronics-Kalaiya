export type Availability = "in_stock" | "limited" | "out_of_stock" | "on_request";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  seoDescription: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  shortDescription: string;
  description: string;
  priceNPR: number;
  originalPriceNPR?: number;
  image: string;
  gallery?: string[];
  specifications?: Record<string, string>;
  features?: string[];
  featured: boolean;
  isNew?: boolean;
  availability: Availability;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}
