import { store } from "@/config/store";

export function absUrl(path: string): string {
  return store.websiteUrl ? `${store.websiteUrl.replace(/\/$/, "")}${path}` : path;
}

export function pageHead(opts: { title: string; description: string; path: string; type?: string; noindex?: boolean; jsonLd?: object[] }) {
  const url = absUrl(opts.path);
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex" }] : []),
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
