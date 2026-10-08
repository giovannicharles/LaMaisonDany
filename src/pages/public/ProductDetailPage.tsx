import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Link2, MessageCircleQuestion, PenLine, Share2, X, ZoomIn } from "lucide-react";
import { api, whatsappProductLink } from "@/api/client";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";
import { track } from "@/lib/track";
import { EASE } from "@/lib/motion";
import { iconFor, useSite } from "@/lib/siteContent";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import { useOrder } from "@/components/public/OrderDialog";
import ProductCard from "@/components/public/ProductCard";
import HowToOrder from "@/components/public/HowToOrder";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import Seo from "@/components/public/Seo";
import { productLd } from "@/lib/seo";

function Lightbox({ photos, index, onClose, onChange, name }: { photos: string[]; index: number; onClose: () => void; onChange: (i: number) => void; name: string }) {
  const prev = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, photos.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, photos.length, onChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos de ${name}`}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-wine-deep/92 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 rounded-full bg-blush/15 p-3 text-blush hover:bg-blush/25">
        <X className="h-6 w-6" />
      </button>
      {photos.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Photo précédente" className="absolute left-3 rounded-full bg-blush/15 p-3 text-blush hover:bg-blush/25 md:left-8">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Photo suivante" className="absolute right-3 rounded-full bg-blush/15 p-3 text-blush hover:bg-blush/25 md:right-8">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      <motion.img
        key={photos[index]}
        src={optimizeImage(photos[index], 1600)}
        alt={`${name}, photo ${index + 1} sur ${photos.length}`}
        className="max-h-[88svh] max-w-full rounded-2xl object-contain shadow-2xl"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <p className="absolute bottom-5 rounded-full bg-blush/15 px-4 py-1.5 text-sm text-blush">
          {index + 1} / {photos.length}
        </p>
      )}
    </motion.div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const site = useSite();
  const { openProduct } = useOrder();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const share = async () => {
    if (!product) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* share cancelled */
    }
  };

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
        <Seo title="Produit introuvable" noindex />
        <p className="font-brand text-3xl text-wine">Ce produit est introuvable.</p>
        <Link to="/catalogue" className="lmd-btn lmd-btn-ghost mt-8">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  const unavailable = product.available === false;
  const waLink = whatsappProductLink(product);

  return (
    <div>
      <Seo
        title={product.name}
        description={product.description || `${product.name} chez ${site.general.brand}. Commandez simplement sur WhatsApp.`}
        image={product.image_url}
        path={`/produit/${product.slug}`}
        type="product"
        jsonLd={productLd(product, site, window.location.origin)}
      />
      <div className={`${shell} pt-[104px] pb-28 md:pb-28`}>
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush-deep to-blush-edge/70 ring-1 ring-blush-edge/60">
              {photos.length > 0 ? (
                <button onClick={() => setZoom(true)} aria-label="Agrandir la photo" className="group absolute inset-0 cursor-zoom-in">
                  <motion.img
                    key={photos[active]}
                    src={optimizeImage(photos[active], 1000)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    initial={{ opacity: 0.4, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                  <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-blush/95 px-3.5 py-2 text-sm font-medium text-wine opacity-90 shadow transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-4 w-4" /> Agrandir
                  </span>
                </button>
              ) : (
                <div className="h-full w-full flex items-end justify-center pb-10">
                  <ProductArt seed={product.id} kind={artKindFor(product.category_name, product.category_slug)} className="h-[80%] w-auto max-w-[80%]" />
                </div>
              )}
              {unavailable && (
                <span className="absolute left-4 top-4 rounded-full bg-wine px-3.5 py-1.5 text-sm font-medium text-blush">Indisponible</span>
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
              <Link to={`/catalogue?categorie=${product.category_slug}`} className="inline-block rounded-full bg-blush-deep px-4 py-1.5 text-sm font-medium text-wine hover:bg-blush-edge/70 transition-colors">
                {product.category_name}
              </Link>
            )}
            <h1 className="mt-5 font-brand text-4xl md:text-5xl leading-[1.05] text-wine">{product.name}</h1>

            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className={product.price != null ? "text-3xl font-semibold text-wine" : "font-brand text-3xl italic text-rose"}>
                {formatPrice(product.price)}
              </p>
              <p className="text-sm text-ink-soft">{unavailable ? "Actuellement indisponible" : "Prix indicatif, confirmé sur WhatsApp"}</p>
            </div>

            {product.description && (
              <p className="mt-7 max-w-[56ch] whitespace-pre-line text-lg leading-relaxed text-ink-soft">{product.description}</p>
            )}

            <div className="mt-8 rounded-[1.75rem] bg-white p-5 ring-1 ring-blush-edge/60 md:p-7">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_request", product.id)}
                className="lmd-btn lmd-btn-wine w-full !py-4"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {unavailable ? "Demander la disponibilité" : "Commander sur WhatsApp"}
              </a>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <button onClick={() => openProduct(product)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-wine hover:bg-blush-deep">
                  <PenLine className="h-4 w-4" /> Personnaliser mon message
                </button>
                <button onClick={share} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-wine hover:bg-blush-deep">
                  {copied ? <Link2 className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Lien copié" : "Partager"}
                </button>
              </div>

              <ul className="mt-5 space-y-3 border-t border-blush-edge/70 pt-5">
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-edge/70 bg-blush/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink-soft">{product.name}</p>
            <p className={product.price != null ? "font-semibold text-wine" : "text-sm italic text-ink-soft"}>{formatPrice(product.price)}</p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_request", product.id)}
            className="lmd-btn lmd-btn-wine shrink-0 !px-5 !py-3"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Commander
          </a>
        </div>
      </div>

      <AnimatePresence>
        {zoom && photos.length > 0 && (
          <Lightbox photos={photos} index={active} onChange={setActive} onClose={() => setZoom(false)} name={product.name} />
        )}
      </AnimatePresence>
    </div>
  );
}
