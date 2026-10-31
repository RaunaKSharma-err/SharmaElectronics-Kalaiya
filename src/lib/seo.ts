import { store } from "@/config/store";

export function absUrl(path: string): string {
  return store.websiteUrl ? `${store.websiteUrl.replace(/\/$/, "")}${path}` : path;
}

export function pageHead(opts: { title: string; description: string; path: string; type?: string; noindex?: boolean; image?: string; jsonLd?: object[] }) {
  const url = absUrl(opts.path);
  const image = absUrl(opts.image?.startsWith("http") ? opts.image : (opts.image ?? "/SEK.png"));
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "robots", content: opts.noindex ? "noindex, nofollow" : "index, follow" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: store.name },
      { property: "og:locale", content: "en_NP" },
      { property: "og:image", content: image },
      { property: "og:image:alt", content: opts.title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      { name: "twitter:image", content: image },
      ...(opts.noindex ? [] : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: (opts.jsonLd ?? []).map((d) => ({ type: "application/ld+json", children: JSON.stringify(d) })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absUrl(it.path) })),
  };
}

export function storeLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: store.name,
    description: store.description,
    ...(store.websiteUrl ? { url: store.websiteUrl } : {}),
    ...(store.phone ? { telephone: store.phone } : {}),
    ...(store.email ? { email: store.email } : {}),
    address: {
      "@type": "PostalAddress",
      ...(store.address ? { streetAddress: store.address } : {}),
      addressLocality: store.city,
      addressRegion: store.province,
      addressCountry: store.countryCode,
    },
    currenciesAccepted: store.currency,
  };
}
