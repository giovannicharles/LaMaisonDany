import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Category, Product } from "@/types";
import { EASE } from "@/lib/motion";
import { formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";
import { track } from "@/lib/track";
import { useSite } from "@/lib/siteContent";
import { ProductArt, artKindFor } from "@/components/art/Bottles";
import { useOrder } from "./OrderDialog";
import WhatsAppIcon from "./WhatsAppIcon";

interface ChatMessage {
  id: number;
  from: "bot" | "user";
  text: string;
  products?: Product[];
  categories?: Category[];
  handoff?: boolean;
}

const STOP = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "que", "qui", "quoi", "est", "ce", "ca", "je", "tu",
  "il", "on", "nous", "vous", "me", "mon", "ma", "mes", "pour", "par", "sur", "dans", "avec", "au", "aux", "en", "a",
  "y", "ai", "as", "avez", "avoir", "voudrais", "veux", "souhaite", "cherche", "quel", "quelle", "quels", "comment",
  "svp", "bonjour", "salut", "merci", "peut", "puis", "pouvez", "il", "faut",
]);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

const tokens = (s: string) =>
  norm(s)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

let nextId = 1;

export default function ChatBot() {
  const site = useSite();
  const bot = site.chatbot;
  const navigate = useNavigate();
  const { openProduct } = useOrder();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const knowledge = useMemo(
    () => [
      ...bot.quick_replies.map((r) => ({ title: r.label, answer: r.answer })),
      ...site.faq.map((f) => ({ title: f.q, answer: f.a })),
    ],
    [bot.quick_replies, site.faq]
  );

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: nextId++, from: "bot", text: bot.welcome }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open, messages.length, bot.welcome]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!bot.enabled) return null;

  const reply = (msg: Omit<ChatMessage, "id" | "from">, delay = 650) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, from: "bot", ...msg }]);
      setTyping(false);
    }, delay);
  };

  const showCategories = async () => {
    try {
      const { data } = await api.categories.list();
      if (data.length) return reply({ text: "Voici nos catégories. Touchez-en une pour voir les produits :", categories: data });
    } catch {
      /* fall through */
    }
    reply({ text: "Vous trouverez toutes nos catégories dans la boutique.", handoff: false });
  };

  const handle = async (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { id: nextId++, from: "user", text }]);
    setInput("");

    const words = tokens(text);
    const asked = norm(text);

    if (/(categor|rayon|univers)/.test(asked)) return showCategories();
    if (/(humain|conseiller|agent|parler|whatsapp|appeler|telephone)/.test(asked)) {
      return reply({ text: "Avec plaisir, notre équipe vous répond directement sur WhatsApp.", handoff: true });
    }

    let best: { answer: string; score: number } | null = null;
    for (const k of knowledge) {
      const kw = new Set(tokens(`${k.title} ${k.title}`));
      const score = words.filter((w) => kw.has(w) || [...kw].some((x) => x.startsWith(w) || w.startsWith(x))).length;
      if (!best || score > best.score) best = { answer: k.answer, score };
    }
    if (best && best.score >= 2) return reply({ text: best.answer });

    if (words.length > 0) {
      try {
        const { data: cats } = await api.categories.list();
        const stem = (w: string) => w.replace(/s$/, "");
        const hit = cats.find((c) => tokens(c.name).some((t) => words.some((w) => stem(t) === stem(w) || stem(t).startsWith(stem(w)) && stem(w).length >= 3)));
        if (hit) {
          const { data: inCat } = await api.products.list({ category: hit.slug });
          if (inCat.length) {
            return reply({ text: `Voici ce que nous proposons en ${hit.name.toLowerCase()} :`, products: inCat.slice(0, 3), categories: [hit] });
          }
        }
      } catch {
        /* categories unavailable: continue with product search */
      }
      try {
        const { data } = await api.products.list({ search: words.slice(0, 3).join(" ") });
        const found = data.length ? data : (await api.products.list({ search: words[0] })).data;
        if (found.length) {
          return reply({ text: `J'ai trouvé ${found.length > 3 ? "plusieurs produits" : found.length === 1 ? "un produit" : `${found.length} produits`} qui peuvent vous plaire :`, products: found.slice(0, 3) });
        }
      } catch {
        /* api down: fall through */
      }
    }

    if (best && best.score === 1) return reply({ text: best.answer });
    reply({ text: bot.fallback, handoff: true });
  };

  const transcript = () => {
    const last = messages.filter((m) => m.from === "user").slice(-3).map((m) => m.text).join(" / ");
    return last ? `Bonjour LaMaison Dany, je vous écris depuis le site. Ma question : ${last}` : undefined;
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label={bot.name}
            className="lmd fixed z-[70] bottom-0 right-0 left-0 sm:left-auto sm:bottom-[168px] sm:right-5 flex h-[min(78svh,600px)] sm:h-[min(70svh,580px)] w-full sm:w-[380px] flex-col overflow-hidden rounded-t-[1.75rem] sm:rounded-[1.75rem] bg-blush shadow-[0_40px_80px_-30px_rgba(74,15,34,0.65)] ring-1 ring-blush-edge"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <header className="flex items-center gap-3 bg-gradient-to-r from-wine to-wine-deep px-5 py-4 text-blush">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush/15 font-brand text-xl italic">D</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">{bot.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-blush/75">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> En ligne
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer le chat" className="rounded-full p-2 hover:bg-blush/15 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className={m.from === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div className="max-w-[88%]">
                    <p
                      className={
                        m.from === "user"
                          ? "rounded-2xl rounded-br-md bg-wine px-4 py-2.5 text-[0.95rem] text-blush"
                          : "rounded-2xl rounded-bl-md bg-white/80 px-4 py-2.5 text-[0.95rem] leading-relaxed text-ink"
                      }
                    >
                      {m.text}
                    </p>

                    {m.products && (
                      <ul className="mt-2 space-y-2">
                        {m.products.map((p) => (
                          <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/80 p-2.5">
                            <span className="flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-blush-deep">
                              {p.image_url ? (
                                <img src={optimizeImage(p.image_url, 160)} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <ProductArt seed={p.id} kind={artKindFor(p.category_name, p.category_slug)} className="h-[88%] w-auto max-w-[80%]" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium text-wine">{p.name}</span>
                              <span className="block text-sm text-ink-soft">{formatPrice(p.price)}</span>
                            </span>
                            <button
                              onClick={() => {
                                setOpen(false);
                                openProduct(p);
                              }}
                              className="rounded-full bg-wine px-3.5 py-2 text-sm font-medium text-blush hover:bg-wine-deep transition-colors"
                            >
                              Demander
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    {m.categories && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.categories.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setOpen(false);
                              navigate(`/catalogue?categorie=${c.slug}`);
                            }}
                            className="rounded-full border border-rose bg-white/70 px-3.5 py-1.5 text-sm text-wine hover:bg-wine hover:text-blush transition-colors"
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {m.handoff && (
                      <a
                        href={whatsappLink(transcript())}
                        onClick={() => track("chat_handoff")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lmd-btn lmd-btn-wine mt-2 !py-2.5 !px-4 !text-sm"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Continuer sur WhatsApp
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start" aria-label="L'assistant écrit">
                  <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-white/80 px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-rose"
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div className="border-t border-blush-edge/70 bg-blush px-4 pt-3 pb-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {[{ label: "Voir les catégories", answer: "" }, ...bot.quick_replies].map((q) => (
                  <button
                    key={q.label}
                    onClick={() => (q.answer ? handle(q.label) : handle("catégories"))}
                    className="shrink-0 rounded-full border border-blush-edge bg-white/70 px-3.5 py-1.5 text-sm text-wine hover:border-rose hover:bg-white transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handle(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre question"
                  aria-label="Votre message"
                  className="lmd-field !rounded-full !py-2.5"
                />
                <button
                  type="submit"
                  aria-label="Envoyer"
                  disabled={!input.trim() || typing}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wine text-blush transition-all hover:bg-wine-deep disabled:opacity-40"
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        aria-expanded={open}
        className="fixed bottom-[88px] right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-blush text-wine ring-1 ring-blush-edge shadow-[0_14px_30px_-12px_rgba(107,23,48,0.55)] hover:bg-white transition-colors"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 2.3 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "c"}
            initial={{ rotate: -80, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
