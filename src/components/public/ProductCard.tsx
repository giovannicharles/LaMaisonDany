import { Link } from "react-router-dom";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import WhatsAppIcon from "./WhatsAppIcon";
import { optimizeImage } from "@/lib/images";
import { useOrder } from "./OrderDialog";

export default function ProductCard({ product }: { product: Product }) {
  const { openProduct } = useOrder();
  return (
    <article className="group flex flex-col h-full rounded-[1.75rem] bg-white/70 p-3 shadow-[0_18px_40px_-28px_rgba(107,23,48,0.55)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_50px_-26px_rgba(107,23,48,0.6)]">
      <Link
        to={`/produit/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-gradient-to-b from-blush-deep to-blush-edge/60"
        aria-label={product.name}
      >
        {product.image_url ? (
          <img
            src={optimizeImage(product.image_url, 600)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-end justify-center pb-6 px-4">
            <div className="flex h-full w-full items-end justify-center transition-transform duration-700 group-hover:scale-105">
              <ProductArt seed={product.id} kind={artKindFor(product.category_name, product.category_slug)} />
            </div>
          </div>
        )}
        {product.available === false && (
          <span className="absolute right-3 top-3 rounded-full bg-wine px-3 py-1 text-xs font-medium text-blush">Indisponible</span>
        )}
        {product.category_name && (
          <span className="absolute left-3 top-3 rounded-full bg-blush/90 px-3 py-1 text-xs font-medium text-wine">
            {product.category_name}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-2">
        <Link to={`/produit/${product.slug}`}>
          <h3 className="font-brand text-xl leading-snug text-wine">{product.name}</h3>
        </Link>
        <p className="mt-1 text-[0.95rem] text-ink-soft">{formatPrice(product.price)}</p>
        <button
          type="button"
          onClick={() => openProduct(product)}
          aria-label={`Demander ${product.name} sur WhatsApp`}
          className="lmd-btn lmd-btn-ghost mt-auto !py-2.5 !px-3 !text-sm w-full whitespace-nowrap"
          style={{ marginTop: "1rem" }}
        >
          <WhatsAppIcon className="h-4 w-4" />
          <span className="xl:hidden">Demander</span>
          <span className="hidden xl:inline">Demander sur WhatsApp</span>
        </button>
      </div>
    </article>
  );
}
