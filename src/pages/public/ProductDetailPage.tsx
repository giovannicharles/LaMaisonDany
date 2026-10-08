import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, MessageCircleQuestion } from "lucide-react";
import { api } from "@/api/client";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";
import { track } from "@/lib/track";
import { iconFor, useSite } from "@/lib/siteContent";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import { useOrder } from "@/components/public/OrderDialog";
import ProductCard from "@/components/public/ProductCard";
import HowToOrder from "@/components/public/HowToOrder";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const site = useSite();
  const { openProduct } = useOrder();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    setActive(0);
    setRelated([]);
    api.products.get(slug)
      .then((res) => {
        setProduct(res.data);
        track("product_view", res.data.id);
        if (res.data.category_slug) {
          api.products
            .list({ category: res.data.category_slug })
            .then((r) => setRelated(r.data.filter((p) => p.id !== res.data.id).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const photos = product ? [product.image_url, ...(product.images ?? [])].filter((u): u is string => Boolean(u)) : [];

  const shell = "max-w-[1320px] mx-auto px-5 md:px-10";

  if (loading) {
    return (
      <div className={`${shell} pt-[104px] pb-24`}>
        <div className="grid md:grid-cols-2 gap-10 md:gap-20 animate-pulse">
          <div className="aspect-[4/5] rounded-[2rem] bg-blush-deep" />
          <div className="space-y-4 pt-10">
            <div className="h-5 w-1/4 rounded-full bg-blush-deep" />
            <div className="h-14 w-3/4 rounded-2xl bg-blush-deep" />
            <div className="h-8 w-1/3 rounded-full bg-blush-deep" />
            <div className="h-28 rounded-2xl bg-blush-deep" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={`${shell} pt-[104px] pb-24 text-center`}>
        <p className="font-brand text-3xl text-wine">Ce produit est introuvable.</p>
        <Link to="/catalogue" className="lmd-btn lmd-btn-ghost mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className={`${shell} pt-[104px] pb-20 md:pb-28`}>
        <nav aria-label="Fil d'Ariane" className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.95rem] text-ink-soft">
          <Link to="/" className="hover:text-wine transition-colors">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/catalogue" className="hover:text-wine transition-colors">Boutique</Link>
          {product.category_name && (
            <>
              <ChevronRight className="h-4 w-4" />
              <Link to={`/catalogue?categorie=${product.category_slug}`} className="hover:text-wine transition-colors">
                {product.category_name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" />
          <span className="text-wine font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 md:gap-20 items-start">
          <div className="md:sticky md:top-24">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush-deep to-blush-edge/70">
              {photos.length > 0 ? (
                <img
                  key={photos[active]}
                  src={optimizeImage(photos[active], 1000)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-end justify-center pb-10">
                  <ProductArt seed={product.id} kind={artKindFor(product.category_name, product.category_slug)} className="h-[80%] w-auto max-w-[80%]" />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <ul className="mt-3 flex gap-3 overflow-x-auto pb-1" aria-label="Photos du produit">
                {photos.map((url, i) => (
                  <li key={url}>
                    <button
                      onClick={() => setActive(i)}
                      aria-label={`Voir la photo ${i + 1}`}
                      aria-current={i === active}
                      className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition-all ${i === active ? "ring-wine" : "ring-transparent opacity-70 hover:opacity-100"}`}
                    >
                      <img src={optimizeImage(url, 200)} alt="" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:pt-4">
            {product.category_name && (
              <span className="inline-block rounded-full bg-blush-deep px-4 py-1.5 text-sm font-medium text-wine">
                {product.category_name}
              </span>
            )}
            <h1 className="mt-5 font-brand text-4xl md:text-6xl leading-[1.02] text-wine">{product.name}</h1>
            <p className="mt-5 font-brand text-3xl italic text-rose">{formatPrice(product.price)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {product.available === false
                ? "Actuellement indisponible : écrivez-nous pour connaître le prochain arrivage."
                : "Prix indicatif, confirmé avec vous sur WhatsApp."}
            </p>

            {product.description && (
              <div className="mt-8">
                <h2 className="font-brand text-xl text-wine">Description</h2>
                <p className="mt-2 max-w-[56ch] whitespace-pre-line text-lg leading-relaxed text-ink-soft">{product.description}</p>
              </div>
            )}

            <div className="mt-9 rounded-[1.75rem] bg-white/70 p-6 md:p-8">
              <button type="button" onClick={() => openProduct(product)} className="lmd-btn lmd-btn-wine w-full">
                <WhatsAppIcon className="h-5 w-5" />
                Commander sur WhatsApp
              </button>
              <p className="mt-3 text-center text-sm text-ink-soft">
                Votre message est prérempli et modifiable avant l'envoi.
              </p>
              <ul className="mt-6 space-y-3 border-t border-blush-edge/70 pt-6">
                {site.reassurance.slice(0, 3).map((r) => {
                  const Icon = iconFor(r.icon);
                  return (
                    <li key={r.title} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-rose" strokeWidth={1.6} />
                      <span className="text-[0.95rem]">
                        <span className="font-medium text-wine">{r.title}.</span> <span className="text-ink-soft">{r.text}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-ink-soft">
              <MessageCircleQuestion className="h-4 w-4 text-rose" />
              Une question sur ce produit ? Ouvrez le chat en bas à droite.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-blush-deep/60">
          <div className={`${shell} py-20 md:py-28`}>
            <h2 className="font-brand text-3xl md:text-5xl text-wine mb-10">
              Vous aimerez <span className="italic text-rose">aussi</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${shell} py-20 md:py-28`}>
        <h2 className="font-brand text-3xl md:text-5xl text-wine mb-10">
          Comment <span className="italic text-rose">commander</span>
        </h2>
        <HowToOrder />
      </section>
    </div>
  );
}
