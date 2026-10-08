import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@/types";
import { defaultProductMessage, whatsappLink } from "@/api/client";
import { formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";
import { track } from "@/lib/track";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import WhatsAppIcon from "./WhatsAppIcon";

interface OrderContextValue {
  openProduct: (product: Product) => void;
}

const OrderContext = createContext<OrderContextValue>({ openProduct: () => {} });

export function useOrder() {
  return useContext(OrderContext);
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const openProduct = useCallback((p: Product) => setProduct(p), []);
  const value = useMemo(() => ({ openProduct }), [openProduct]);

  return (
    <OrderContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {product && <OrderDialog key={product.id} product={product} onClose={() => setProduct(null)} />}
      </AnimatePresence>
    </OrderContext.Provider>
  );
}

function OrderDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const site = useSite();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(() => defaultProductMessage(product, 1));
  const [edited, setEdited] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    textRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const changeQty = (next: number) => {
    const q = Math.max(1, Math.min(99, next));
    setQuantity(q);
    if (!edited) setMessage(defaultProductMessage(product, q));
  };

  const addQuick = (text: string) => {
    setEdited(true);
    setMessage((m) => `${m.trim()} ${text}`.trim());
    textRef.current?.focus();
  };

  const send = () => {
    track("whatsapp_request", product.id);
    window.open(whatsappLink(message.trim() || defaultProductMessage(product, quantity)), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button aria-label="Fermer" className="absolute inset-0 bg-wine-deep/55 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        className="lmd relative w-full sm:max-w-[520px] max-h-[92svh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] bg-blush p-6 sm:p-8 shadow-[0_40px_80px_-30px_rgba(74,15,34,0.6)]"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-wine hover:bg-blush-deep transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 pr-10">
          <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-blush-deep to-blush-edge/70">
            {product.image_url ? (
              <img src={optimizeImage(product.image_url, 200)} alt="" className="h-full w-full object-cover" />
            ) : (
              <ProductArt seed={product.id} kind={artKindFor(product.category_name, product.category_slug)} className="h-[86%] w-auto max-w-[80%]" />
            )}
          </div>
          <div className="min-w-0">
            <h2 id="order-title" className="font-brand text-2xl leading-tight text-wine">
              {product.name}
            </h2>
            <p className="mt-0.5 text-ink-soft">{formatPrice(product.price)}</p>
          </div>
        </div>

        <p className="mt-6 text-[0.95rem] text-ink-soft">{site.order_dialog.intro}</p>

        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
          <span className="font-medium text-wine">Quantité</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeQty(quantity - 1)}
              aria-label="Diminuer la quantité"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blush-edge text-wine hover:bg-blush-deep transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-medium tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              onClick={() => changeQty(quantity + 1)}
              aria-label="Augmenter la quantité"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blush-edge text-wine hover:bg-blush-deep transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <label htmlFor="order-msg" className="mt-5 block mb-2 text-[0.95rem] font-medium text-wine">
          Votre message
        </label>
        <textarea
          id="order-msg"
          ref={textRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setEdited(true);
          }}
          rows={5}
          className="lmd-field resize-y"
        />

        {site.order_dialog.quick_messages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Ajouter une question">
            {site.order_dialog.quick_messages.map((q) => (
              <button
                key={q}
                onClick={() => addQuick(q)}
                className="rounded-full border border-blush-edge bg-white/60 px-3.5 py-1.5 text-sm text-wine hover:bg-white hover:border-rose transition-colors"
              >
                + {q}
              </button>
            ))}
          </div>
        )}

        <button onClick={send} className="lmd-btn lmd-btn-wine mt-7 w-full">
          <WhatsAppIcon className="h-5 w-5" />
          Envoyer sur WhatsApp
        </button>
        <p className="mt-3 text-center text-sm text-ink-soft">WhatsApp s'ouvre avec ce message, vous pouvez encore le modifier.</p>
      </motion.div>
    </motion.div>
  );
}
