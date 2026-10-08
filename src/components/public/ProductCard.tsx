import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { whatsappProductLink } from "@/api/client";
import { formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";
import { track } from "@/lib/track";
import { useSite } from "@/lib/siteContent";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import WhatsAppIcon from "./WhatsAppIcon";

export default function ProductCard({ product }: { product: Product }) {
  useSite(); // re-render when the WhatsApp number is loaded or changed
  const unavailable = product.available === false;
  const hasPrice = product.price != null;
  const hover = product.images?.[0];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_1px_0_rgba(107,23,48,0.04),0_18px_36px_-30px_rgba(107,23,48,0.6)] ring-1 ring-blush-edge/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_50px_-30px_rgba(107,23,48,0.55)] focus-within:ring-2 focus-within:ring-rose">
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-b from-blush-deep to-blush-edge/60">
        {product.image_url ? (
          <>
            <img
              src={optimizeImage(product.image_url, 600)}
              alt={product.name}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${hover ? "group-hover:opacity-0" : ""}`}
            />
            {hover && (
              <img
                src={optimizeImage(hover, 600)}
                alt=""
                loading="lazy"
                aria-hidden
                className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-end justify-center px-4 pb-6 transition-transform duration-700 group-hover:scale-105">
            <ProductArt seed={product.id} kind={artKindFor(product.category_name, product.category_slug)} />
          </div>
        )}

        {product.category_name && (
          <span className="absolute left-3 top-3 rounded-full bg-blush/95 px-3 py-1 text-xs font-medium text-wine shadow-sm">
            {product.category_name}
          </span>
        )}
        {unavailable && (
          <span className="absolute right-3 top-3 rounded-full bg-wine px-3 py-1 text-xs font-medium text-blush shadow-sm">
            Indisponible
          </span>
        )}
        {(product.images?.length ?? 0) > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-wine-deep/75 px-2.5 py-1 text-xs font-medium text-blush backdrop-blur-sm">
            {1 + (product.images?.length ?? 0)} photos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="font-brand text-[1.15rem] leading-snug text-wine line-clamp-2 min-h-[2.9rem]">
          <Link
            to={`/produit/${product.slug}`}
            className="outline-none after:absolute after:inset-0 after:z-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        <p className={`mt-2 ${hasPrice ? "text-lg font-semibold text-wine" : "text-[0.95rem] italic text-ink-soft"}`}>
          {formatPrice(product.price)}
        </p>

        <a
          href={whatsappProductLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_request", product.id)}
          aria-label={`Demander ${product.name} sur WhatsApp`}
          className="lmd-btn lmd-btn-wine relative z-10 mt-4 w-full !px-3 !py-3 !text-[0.9rem] whitespace-nowrap"
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          <span className="xl:hidden">Demander</span>
          <span className="hidden xl:inline">Demander sur WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
