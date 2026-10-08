import type { Product } from "@/types";
import type { SiteContent } from "@/lib/siteContent";

export function isoCurrency(label: string): string {
  const t = label.trim().toLowerCase();
  if (/fcfa|f cfa|cfa|xaf/.test(t)) return "XAF";
  if (/xof/.test(t)) return "XOF";
  if (/gdes|gourde|htg/.test(t)) return "HTG";
  if (/eur|€/.test(t)) return "EUR";
  if (/usd|\$/.test(t)) return "USD";
  return "XAF";
}

export function truncate(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export function absoluteUrl(value: string | null | undefined, origin: string): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return origin + (value.startsWith("/") ? value : `/${value}`);
}

export function organizationLd(site: SiteContent, origin: string) {
  const g = site.general;
  const sameAs = [g.instagram, g.facebook, g.tiktok].filter(Boolean);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Store",
      name: g.brand,
      url: origin,
      logo: `${origin}/icon-512.png`,
      image: absoluteUrl(site.seo.og_image_url || "/og-default.png", origin),
      description: site.seo.description,
      ...(g.phone ? { telephone: g.phone } : {}),
      ...(g.email ? { email: g.email } : {}),
      ...(g.address ? { address: { "@type": "PostalAddress", streetAddress: g.address } } : {}),
      ...(g.opening_hours ? { openingHours: g.opening_hours } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: g.brand,
      url: origin,
      inLanguage: "fr",
    },
  ];
}

export function productLd(product: Product, site: SiteContent, origin: string) {
  const photos = [product.image_url, ...(product.images ?? [])].filter((u): u is string => Boolean(u));
  const url = `${origin}/produit/${product.slug}`;
  const offer =
    product.price != null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: isoCurrency(site.general.currency),
            price: String(product.price),
            availability: product.available === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        }
      : {};
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      url,
      ...(photos.length ? { image: photos.map((p) => absoluteUrl(p, origin)) } : {}),
      ...(product.description ? { description: product.description } : {}),
      ...(product.category_name ? { category: product.category_name } : {}),
      sku: String(product.id),
      ...offer,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: origin + "/" },
        { "@type": "ListItem", position: 2, name: "Boutique", item: origin + "/catalogue" },
        ...(product.category_name
          ? [{ "@type": "ListItem", position: 3, name: product.category_name, item: `${origin}/catalogue?categorie=${product.category_slug}` }]
          : []),
        { "@type": "ListItem", position: product.category_name ? 4 : 3, name: product.name, item: url },
      ],
    },
  ];
}
