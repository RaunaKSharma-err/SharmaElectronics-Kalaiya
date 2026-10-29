import { categories } from "@/data/categories";

/** Bundled sample photos referenced as "seed/cat-<name>.jpg" in the database. */
const seedImages: Record<string, string> = {
  "seed/cat-fridge.jpg": "refrigerators", "seed/cat-washer.jpg": "washing-machines", "seed/cat-tv.jpg": "televisions",
  "seed/cat-ac.jpg": "air-conditioners", "seed/cat-phone.jpg": "smartphones", "seed/cat-laptop.jpg": "laptops-computers",
  "seed/cat-kitchen.jpg": "kitchen-appliances", "seed/cat-fan.jpg": "fans-cooling", "seed/cat-audio.jpg": "earbuds-headphones",
  "seed/cat-speaker.jpg": "speakers-audio", "seed/cat-small.jpg": "small-home-appliances",
  "seed/cat-accessories.jpg": "electrical-accessories", "seed/cat-other.jpg": "other-electronics",
};

export const isSeedImage = (p: string) => p.startsWith("seed/");
export const isStoragePath = (p: string | null | undefined): p is string => !!p && !isSeedImage(p) && !/^https?:\/\//.test(p);

export function seedImageUrl(path: string): string | undefined {
  const slug = seedImages[path];
  return slug ? categories.find((c) => c.slug === slug)?.image : undefined;
}

/** Resolve a stored image reference given a map of signed URLs for storage paths. */
export function resolveImage(path: string | null | undefined, signed: Record<string, string>, fallbackCategory: string): string {
  if (path) {
    if (isSeedImage(path)) { const u = seedImageUrl(path); if (u) return u; }
    else if (/^https?:\/\//.test(path)) return path;
    else if (signed[path]) return signed[path]!;
  }
  return categories.find((c) => c.slug === fallbackCategory)?.image ?? categories[0]!.image;
}
