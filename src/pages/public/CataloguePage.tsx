import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Search, X } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/public/ProductCard";
import PageHeader from "@/components/public/PageHeader";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";
import Rich from "@/components/public/Rich";
import { cn } from "@/lib/utils";

type SortKey = "default" | "price-asc" | "price-desc" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Notre sélection" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "name", label: "Nom A → Z" },
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export default function CataloguePage() {
  const site = useSite();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categorie") ?? "";
  const setActiveCategory = (slug: string) => setSearchParams(slug ? { categorie: slug } : {}, { replace: true });

  useEffect(() => {
    Promise.all([api.products.list(), api.categories.list()])
      .then(([p, c]) => {
        setProducts(p.data);
        setCategories(c.data);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of products) if (p.category_id != null) map.set(p.category_id, (map.get(p.category_id) ?? 0) + 1);
    return map;
  }, [products]);

  const visibleCategories = categories.filter((c) => (counts.get(c.id) ?? 0) > 0);
  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  const results = useMemo(() => {
    const q = norm(search.trim());
    let list = products.filter(
      (p) =>
        (!activeCategory || p.category_slug === activeCategory) &&
        (!q || norm(`${p.name} ${p.description ?? ""} ${p.category_name ?? ""}`).includes(q))
    );
    if (sort === "price-asc" || sort === "price-desc") {
      const dir = sort === "price-asc" ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return (a.price - b.price) * dir;
      });
    } else if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
    return list;
  }, [products, activeCategory, search, sort]);

  const filtered = Boolean(activeCategory || search.trim());
  const clearAll = () => {
    setSearch("");
    setActiveCategory("");
  };

  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full px-4 py-2.5 text-[0.95rem] font-medium transition-all duration-300",
      active
        ? "bg-wine text-blush shadow-[0_8px_18px_-10px_rgba(107,23,48,0.7)]"
        : "bg-white text-ink-soft ring-1 ring-blush-edge/70 hover:text-wine hover:ring-rose"
    );

  return (
    <div>
      <Seo
        title={activeCategoryName ? `${activeCategoryName} : la boutique` : "La boutique"}
        description={
          activeCategoryName
            ? `Découvrez notre sélection ${activeCategoryName.toLowerCase()} chez ${site.general.brand}. Un clic, et la conversation WhatsApp s'ouvre.`
            : `Parfums, cosmétiques, vins et plus encore. Parcourez la boutique ${site.general.brand} et commandez sur WhatsApp.`
        }
        path={activeCategory ? `/catalogue?categorie=${activeCategory}` : "/catalogue"}
      />
      <PageHeader
        title={<Rich text={site.texts.shop_title} />}
        intro={site.texts.shop_intro}
      />

      <div className="sticky top-[72px] z-30 border-b border-blush-edge/60 bg-blush/92 backdrop-blur-md">
        <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-3">
          <div role="group" aria-label="Filtrer par catégorie" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [scrollbar-width:none]">
            <button onClick={() => setActiveCategory("")} className={chip(!activeCategory)} aria-pressed={!activeCategory}>
              Tous <span className={cn("ml-1", !activeCategory ? "text-blush/85" : "text-rose")}>{products.length}</span>
            </button>
            {visibleCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.slug)} className={chip(activeCategory === cat.slug)} aria-pressed={activeCategory === cat.slug}>
                {cat.name} <span className={cn("ml-1", activeCategory === cat.slug ? "text-blush/85" : "text-rose")}>{counts.get(cat.id)}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-5 md:px-10 py-6 md:py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
            <input
              type="search"
              placeholder={site.texts.shop_search_placeholder}
              aria-label="Rechercher un produit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lmd-field !rounded-full !py-2.5 !pl-11 !pr-10"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-soft hover:bg-blush-deep">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative sm:w-56">
            <ArrowDownUp className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Trier les produits"
              className="lmd-field !rounded-full !py-2.5 !pl-11"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loading && !failed && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <p className="text-ink-soft">
              <span className="font-semibold text-wine">{results.length}</span> produit{results.length > 1 ? "s" : ""}
              {activeCategoryName && <> dans <span className="font-medium text-wine">{activeCategoryName}</span></>}
              {search.trim() && <> pour « {search.trim()} »</>}
            </p>
            {filtered && (
              <button onClick={clearAll} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-wine hover:bg-blush-deep">
                <X className="h-4 w-4" /> Réinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-blush-edge/60">
                <div className="aspect-[4/5] animate-pulse bg-blush-deep" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-blush-deep" />
                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-blush-deep" />
                  <div className="h-11 animate-pulse rounded-full bg-blush-deep" />
                </div>
              </div>
            ))}
          </div>
        ) : failed ? (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <p className="font-brand text-2xl text-wine">La boutique ne répond pas pour le moment.</p>
            <p className="mt-2 text-ink-soft">Réessayez dans un instant, ou écrivez-nous directement.</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine mt-6">
              <WhatsAppIcon className="h-5 w-5" /> Écrire sur WhatsApp
            </a>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <p className="font-brand text-2xl text-wine">Aucun produit ne correspond.</p>
            <p className="mx-auto mt-2 max-w-[44ch] text-ink-soft">
              Modifiez votre recherche, ou dites-nous ce que vous cherchez : nous le trouvons pour vous.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={clearAll} className="lmd-btn lmd-btn-ghost">Voir tous les produits</button>
              <a
                href={whatsappLink(`Bonjour LaMaison Dany, je cherche : ${search.trim() || "un produit"}. Pouvez-vous m'aider ?`)}
                target="_blank"
                rel="noopener noreferrer"
                className="lmd-btn lmd-btn-wine"
              >
                <WhatsAppIcon className="h-5 w-5" /> Demander sur WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {results.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <ProductCard product={p} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
}
