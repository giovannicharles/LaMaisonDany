import { useEffect } from "react";
import { useSite } from "@/lib/siteContent";
import { absoluteUrl, truncate } from "@/lib/seo";

interface SeoProps {
  title?: string;
  description?: string;
  image?: string | null;
  path?: string;
  type?: "website" | "product";
  noindex?: boolean;
  jsonLd?: object[];
}

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (attrName: "name" | "property", key: string, content: string) =>
  setTag(`meta[${attrName}="${key}"]`, () => {
    const m = document.createElement("meta");
    m.setAttribute(attrName, key);
    return m;
  }, "content", content);

export default function Seo({ title, description, image, path, type = "website", noindex = false, jsonLd }: SeoProps) {
  const site = useSite();
  const brand = site.general.brand;
  const ldKey = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const origin = window.location.origin;
    const fullTitle = title ? `${title} | ${brand}` : site.seo.title || brand;
    const desc = truncate(description || site.seo.description || "");
    const url = origin + (path ?? window.location.pathname);
    const img = absoluteUrl(image || site.seo.og_image_url || "/og-default.png", origin);

    document.title = fullTitle;
    meta("name", "description", desc);
    meta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    meta("property", "og:type", type === "product" ? "product" : "website");
    meta("property", "og:site_name", brand);
    meta("property", "og:locale", "fr_FR");
    meta("property", "og:title", fullTitle);
    meta("property", "og:description", desc);
    meta("property", "og:url", url);
    meta("property", "og:image", img);
    meta("name", "twitter:card", "summary_large_image");
    meta("name", "twitter:title", fullTitle);
    meta("name", "twitter:description", desc);
    meta("name", "twitter:image", img);
    setTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    }, "href", url);

    document.head.querySelectorAll("script[data-seo-ld]").forEach((n) => n.remove());
    if (ldKey) {
      for (const block of JSON.parse(ldKey) as object[]) {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.setAttribute("data-seo-ld", "");
        s.textContent = JSON.stringify(block);
        document.head.appendChild(s);
      }
    }
  }, [title, description, image, path, type, noindex, ldKey, brand, site.seo.title, site.seo.description, site.seo.og_image_url]);

  return null;
}
