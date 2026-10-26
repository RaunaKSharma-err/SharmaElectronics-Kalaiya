/**
 * Single source of truth for Sharma Electronics store settings.
 * Optional fields left `undefined` are hidden across the site.
 */
export const store = {
  name: "Sharma Electronics",
  city: "Kalaiya",
  district: "Bara",
  province: "Madhesh Province",
  country: "Nepal",
  countryCode: "NP",
  currency: "NPR",
  /** International format, digits only — used for every WhatsApp link. */
  whatsappNumber: "9779845188755",
  /** Human-readable display of the WhatsApp number. */
  whatsappDisplay: "+977 984-5188755",
  /** Production domain, e.g. "https://sharmaelectronics.com.np". Leave empty until known. */
  websiteUrl: "" as string,
  announcement: "Browse prices online · Order directly on WhatsApp",
  description:
    "Sharma Electronics is a local electronics and home appliance shop in Kalaiya, Bara, Nepal. Browse refrigerators, washing machines, TVs, phones and more, then order on WhatsApp.",
  address: undefined as string | undefined,
  phone: undefined as string | undefined,
  email: undefined as string | undefined,
  openingHours: undefined as string | undefined,
  googleMapsUrl: undefined as string | undefined,
  socialLinks: {} as Partial<Record<"facebook" | "instagram" | "tiktok" | "youtube", string>>,
  /** Set true once real prices replace the sample catalog. */
  pricesVerified: false,
} as const;

export const storeLocation = `${store.city}, ${store.district}, ${store.province}, ${store.country}`;
