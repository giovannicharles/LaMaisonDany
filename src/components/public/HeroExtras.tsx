import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { whatsappProductLink } from "@/api/client";
import type { Product } from "@/types";
import { EASE } from "@/lib/motion";
import { optimizeImage } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { track } from "@/lib/track";
import { useSite } from "@/lib/siteContent";
import WhatsAppIcon from "./WhatsAppIcon";

export function RotatingWords({ words, className }: { words: string[]; className?: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2 || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length, reduce]);

  if (!words.length) return null;
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className ?? ""}`}>
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {[...words].sort((a, b) => b.length - a.length)[0]}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          className="col-start-1 row-start-1 whitespace-nowrap italic text-rose"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroSpotlight({ products }: { products: Product[] }) {
  const { texts } = useSite();
  const reduce = useReducedMotion();
  const list = useMemo(() => products.filter((p) => p.image_url).slice(0, 6), [products]);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (list.length < 2 || reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % list.length), 4200);
    return () => clearInterval(t);
  }, [list.length, reduce]);

  const p = list[i % Math.max(1, list.length)];
  if (!p) return null;

  return (
    <div className="relative w-[min(78%,300px)]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={p.id}
          href={whatsappProductLink(p)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_request", p.id)}
          aria-label={`${texts.card_button_short} ${p.name}`}
          className="group flex items-center gap-3 rounded-2xl bg-white/95 p-2.5 pr-4 shadow-[0_24px_44px_-20px_rgba(74,15,34,0.6)] ring-1 ring-blush-edge backdrop-blur"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <img src={optimizeImage(p.image_url, 160)} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.78rem] font-medium uppercase tracking-wider text-rose">{p.category_name || "Sélection"}</span>
            <span className="block truncate font-brand text-[1.02rem] leading-tight text-wine">{p.name}</span>
            <span className="block text-sm text-ink-soft">{formatPrice(p.price)}</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wine text-blush transition-transform duration-300 group-hover:scale-110">
            <WhatsAppIcon className="h-4 w-4" />
          </span>
        </motion.a>
      </AnimatePresence>
      {list.length > 1 && (
        <div aria-hidden className="mt-2.5 flex justify-center gap-1.5">
          {list.map((_, n) => (
            <span key={n} className={`h-1.5 rounded-full transition-all duration-500 ${n === i % list.length ? "w-5 bg-wine" : "w-1.5 bg-wine/25"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CircularText({ text, className }: { text: string; className?: string }) {
  const id = useMemo(() => `ct-${Math.random().toString(36).slice(2, 8)}`, []);
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={`lmd-spin ${className ?? ""}`}>
      <defs>
        <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <text fontSize="15" letterSpacing="5" fill="currentColor" fontFamily="inherit" fontWeight="500">
        <textPath href={`#${id}`}>{`${text} · ${text} · `}</textPath>
      </text>
    </svg>
  );
}

export function ScrollCue({ label }: { label: string }) {
  return (
    <a
      href="#apres-hero"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("apres-hero")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="group absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs uppercase tracking-[0.2em] text-ink-soft transition-colors hover:text-wine md:flex"
    >
      {label}
      <ChevronDown className="h-5 w-5 animate-bounce" />
      <ArrowUpRight className="hidden" />
    </a>
  );
}
