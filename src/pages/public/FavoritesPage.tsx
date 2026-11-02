import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product } from "@/types";
import PageHeader from "@/components/public/PageHeader";
import ProductCard from "@/components/public/ProductCard";
import Rich from "@/components/public/Rich";
import Seo from "@/components/public/Seo";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { ProductGridSkeleton } from "@/components/public/Skeleton";
import { favorites, useFavorites } from "@/lib/favorites";
import { useSite } from "@/lib/siteContent";
import { track } from "@/lib/track";
import { EASE } from "@/lib/motion";

export default function FavoritesPage() {
  const site = useSite();
  const ids = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.products
      .list()
      .then((r) => setProducts(r.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const items = useMemo(() => ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)), [ids, products]);

  const message = useMemo(() => {
    const lines = items.map((p) => `• ${p.name}${p.price != null ? ` (${p.price.toLocaleString("fr-FR")} ${site.general.currency})` : ""} ${window.location.origin}/produit/${p.slug}`);
    return `${site.texts.fav_message}\n${lines.join("\n")}`;
  }, [items, site.texts.fav_message, site.general.currency]);

  const clear = () => {
    if (window.confirm(site.texts.fav_clear_confirm)) favorites.clear();
  };

  return (
    <div>
      <Seo title="Mes favoris" noindex path="/favoris" />
      <PageHeader title={<Rich text={site.texts.fav_title} />} intro={site.texts.fav_intro} />

      <div className="mx-auto max-w-[1320px] px-5 py-8 md:px-10 md:py-12">
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-deep text-rose">
              <Heart className="h-7 w-7" />
            </span>
            <p className="mt-5 font-brand text-2xl text-wine">{site.texts.fav_empty_title}</p>
            <p className="mx-auto mt-2 max-w-[40ch] text-ink-soft">{site.texts.fav_empty_text}</p>
            <Link to="/catalogue" className="lmd-btn lmd-btn-wine mt-7">
              {site.texts.fav_empty_cta}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-wine px-6 py-5 text-blush">
              <p className="font-brand text-xl">
                {items.length} {items.length > 1 ? "produits sélectionnés" : "produit sélectionné"}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={whatsappLink(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => items.forEach((p) => track("whatsapp_request", p.id))}
                  className="lmd-btn !bg-blush !text-wine hover:!bg-white"
                >
                  <WhatsAppIcon className="h-5 w-5" /> {site.texts.fav_send}
                </a>
                <button onClick={clear} className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-blush/85 hover:bg-blush/10 hover:text-white">
                  <Trash2 className="h-4 w-4" /> {site.texts.fav_clear}
                </button>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
              {items.map((p, i) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: EASE }}
                >
                  <ProductCard product={p} headingAs="h2" />
                </motion.li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
