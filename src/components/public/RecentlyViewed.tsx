import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/client";
import type { Product } from "@/types";
import { useRecentProducts } from "@/lib/recent";
import { useSite } from "@/lib/siteContent";
import ProductCard from "./ProductCard";
import Rich from "./Rich";
import { ScrollReveal } from "./ScrollReveal";

export default function RecentlyViewed({ excludeId, className }: { excludeId?: number; className?: string }) {
  const { texts } = useSite();
  const ids = useRecentProducts();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) return;
    api.products.list().then((r) => setProducts(r.data)).catch(() => {});
  }, [ids.length]);

  const items = useMemo(
    () => ids.filter((id) => id !== excludeId).map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)).slice(0, 4),
    [ids, products, excludeId]
  );

  if (items.length === 0) return null;

  return (
    <section className={className} aria-label={texts.recent_title}>
      <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-10 md:py-24">
        <h2 className="mb-8 font-brand text-3xl text-wine md:text-5xl">
          <Rich text={texts.recent_title} />
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {items.map((p, i) => (
            <li key={p.id}>
              <ScrollReveal delay={i * 70}>
                <ProductCard product={p} headingAs="h3" />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
