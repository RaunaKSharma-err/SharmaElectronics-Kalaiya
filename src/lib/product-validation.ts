import { z } from "zod";
import { categories } from "@/data/categories";

const catSlugs = categories.map((c) => c.slug) as [string, ...string[]];
const optText = z.string().trim().max(5000).optional().nullable().transform((v) => (v ? v : null));

export const productInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z.string().trim().toLowerCase().min(1, "Slug is required").max(100)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens"),
  brand: optText,
  category: z.enum(catSlugs, { errorMap: () => ({ message: "Choose a category" }) }),
  short_description: optText,
  description: optText,
  price_npr: z.coerce.number({ invalid_type_error: "Enter a price" }).min(0, "Price can't be negative").max(100_000_000),
  original_price_npr: z.coerce.number().min(0).max(100_000_000).optional().nullable(),
  sku: z.string().trim().max(64).optional().nullable().transform((v) => (v ? v : null)),
  stock_quantity: z.coerce.number().int("Whole numbers only").min(0, "Stock can't be negative"),
  low_stock_threshold: z.coerce.number().int("Whole numbers only").min(0, "Threshold can't be negative"),
  image_url: z.string().max(500).optional().nullable().transform((v) => (v ? v : null)),
  gallery: z.array(z.string().max(500)).max(10).default([]),
  specifications: z.record(z.string().trim().min(1).max(80), z.string().trim().max(300)).default({}),
  features: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_active: z.boolean().default(true),
}).refine((p) => p.original_price_npr == null || p.original_price_npr > p.price_npr, {
  message: "Original price must be higher than the selling price (or leave it empty)",
  path: ["original_price_npr"],
});

export type ProductInput = z.infer<typeof productInput>;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function validateImageFile(f: { type: string; size: number; name: string }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(f.type)) return "Only JPEG, PNG or WebP images are allowed";
  if (!/\.(jpe?g|png|webp)$/i.test(f.name)) return "File must end in .jpg, .png or .webp";
  if (f.size > IMAGE_MAX_BYTES) return "Image must be 5 MB or smaller";
  return null;
}

export function safeImagePath(fileName: string): string {
  const ext = (fileName.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg").toLowerCase().replace("jpeg", "jpg");
  return `products/${crypto.randomUUID()}.${ext}`;
}
