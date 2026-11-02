import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, CornerDownLeft, Search, Tag, X } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Category } from "@/types";
import { useShowcase } from "@/lib/showcase";
import { recent, useRecentSearches } from "@/lib/recent";
import { useSite } from "@/lib/siteContent";
import { optimizeImage } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { EASE } from "@/lib/motion";
import WhatsAppIcon from "./WhatsAppIcon";

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

interface SearchContextValue {
  open: () => void;
}

const SearchContext = createContext<SearchContextValue>({ open: () => {} });
export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <SearchContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>{isOpen && <SearchPanel onClose={() => setIsOpen(false)} />}</AnimatePresence>
    </SearchContext.Provider>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const { texts } = useSite();
  const navigate = useNavigate();
  const products = useShowcase();
  const history = useRecentSearches();
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.categories.list().then((r) => setCategories(r.data.filter((c) => Number(c.product_count ?? 0) > 0))).catch(() => {});
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const term = norm(q.trim());

  const results = useMemo(() => {
    if (term.length < 1) return { items: [], cats: [] as Category[] };
    const words = term.split(/\s+/).filter(Boolean);
    const scored = products
      .map((p) => {
        const name = norm(p.name);
        const hay = `${name} ${norm(p.category_name ?? "")} ${norm(p.description ?? "")}`;
        if (!words.every((w) => hay.includes(w))) return null;
        let score = 0;
        if (name.startsWith(term)) score += 6;
        if (name.includes(term)) score += 4;
        for (const w of words) if (name.includes(w)) score += 2;
        if (p.featured) score += 1;
        return { p, score };
      })
      .filter((x): x is { p: (typeof products)[number]; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.p);
    const cats = categories.filter((c) => norm(c.name).includes(term)).slice(0, 3);
    return { items: scored, cats };
  }, [term, products, categories]);

  const rows = useMemo(
    () => [
      ...results.cats.map((c) => ({ kind: "cat" as const, key: `c${c.id}`, go: `/catalogue?categorie=${c.slug}`, label: c.name })),
      ...results.items.map((p) => ({ kind: "product" as const, key: `p${p.id}`, go: `/produit/${p.slug}`, label: p.name, product: p })),
    ],
    [results]
  );

  useEffect(() => setIndex(0), [q]);

  const go = (path: string, remember = true) => {
    if (remember) recent.addSearch(q);
    onClose();
    navigate(path);
  };

  const submit = () => {
    if (rows[index]) return go(rows[index].go);
    if (q.trim()) go(`/catalogue?q=${encodeURIComponent(q.trim())}`);
  };

  const suggestions = categories.slice(0, 5);

  return (
    <motion.div className="fixed inset-0 z-[85] flex items-start justify-center px-4 pt-[9vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <button aria-label={texts.search_close} className="absolute inset-0 bg-wine-deep/55" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={texts.search_title}
        className="lmd relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-blush shadow-[0_40px_90px_-30px_rgba(74,15,34,0.7)] ring-1 ring-blush-edge"
        initial={{ y: -20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -12, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndex((n) => Math.min(rows.length - 1, n + 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndex((n) => Math.max(0, n - 1));
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 border-b border-blush-edge/70 px-5"
          role="search"
        >
          <Search className="h-5 w-5 shrink-0 text-wine" aria-hidden />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={texts.shop_search_placeholder}
            aria-label={texts.search_title}
            autoComplete="off"
            enterKeyHint="search"
            className="min-w-0 flex-1 bg-transparent py-5 text-lg text-ink !outline-none placeholder:text-ink-soft/70"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label={texts.search_clear} className="rounded-full p-2 text-ink-soft hover:bg-blush-deep hover:text-wine">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-blush-edge bg-white px-2 py-1 font-mono text-xs text-ink-soft sm:block">Échap</kbd>
        </form>

        <div className="max-h-[62vh] overflow-y-auto p-3">
          {term.length === 0 ? (
            <div className="space-y-5 p-2">
              {history.length > 0 && (
                <section aria-label={texts.search_recent}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                      <Clock className="h-4 w-4" /> {texts.search_recent}
                    </h3>
                    <button onClick={() => recent.clearSearches()} className="min-h-9 px-2 text-sm text-rose underline underline-offset-2">
                      {texts.search_clear}
                    </button>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {history.map((h) => (
                      <li key={h}>
                        <button onClick={() => setQ(h)} className="min-h-10 rounded-full bg-white px-4 py-2 text-sm text-wine ring-1 ring-blush-edge/70 hover:ring-rose">
                          {h}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {suggestions.length > 0 && (
                <section aria-label={texts.search_popular}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-ink-soft">
                    <Tag className="h-4 w-4" /> {texts.search_popular}
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {suggestions.map((c) => (
                      <li key={c.id}>
                        <button onClick={() => go(`/catalogue?categorie=${c.slug}`, false)} className="min-h-10 rounded-full bg-wine px-4 py-2 text-sm font-medium text-blush hover:bg-wine-deep">
                          {c.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <p className="px-1 text-sm text-ink-soft">{texts.search_tip}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-brand text-2xl text-wine">{texts.search_empty_title.split("{q}").join(q.trim())}</p>
              <p className="mx-auto mt-2 max-w-[44ch] text-ink-soft">{texts.search_empty_text}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                <a
                  href={whatsappLink(`Bonjour, je cherche : ${q.trim()}. Pouvez-vous m'aider ?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="lmd-btn lmd-btn-wine"
                >
                  <WhatsAppIcon className="h-5 w-5" /> {texts.search_empty_cta}
                </a>
                <button onClick={() => go("/catalogue", false)} className="lmd-btn lmd-btn-ghost">
                  {texts.search_all}
                </button>
              </div>
            </div>
          ) : (
            <ul role="listbox" aria-label={texts.search_title} className="space-y-1">
              {rows.map((r, i) => (
                <li key={r.key} role="option" aria-selected={i === index}>
                  <button
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => go(r.go)}
                    className={`flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition-colors ${i === index ? "bg-white ring-1 ring-rose/50" : "hover:bg-white/70"}`}
                  >
                    {r.kind === "cat" ? (
                      <>
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blush-deep text-wine">
                          <Tag className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-rose">{texts.search_categories}</span>
                          <span className="block truncate font-brand text-lg text-wine">{r.label}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush-deep">
                          {r.product.image_url && <img src={optimizeImage(r.product.image_url, 120)} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-rose">{r.product.category_name || texts.search_results}</span>
                          <span className="block truncate font-brand text-lg text-wine">{r.label}</span>
                          <span className="block text-sm text-ink-soft">{formatPrice(r.product.price)}</span>
                        </span>
                      </>
                    )}
                    {i === index && <CornerDownLeft className="hidden h-4 w-4 shrink-0 text-ink-soft sm:block" aria-hidden />}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => go(`/catalogue?q=${encodeURIComponent(q.trim())}`)} className="mt-1 w-full rounded-2xl px-4 py-3 text-center text-sm font-medium text-wine hover:bg-white/70">
                  {texts.search_all}
                </button>
              </li>
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
