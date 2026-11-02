import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, Search, X } from "lucide-react";
import { api, whatsappLink } from "@/api/client";
import type { Product, Category } from "@/types";
import { ProductGridSkeleton } from "@/components/public/Skeleton";
import Pagination, { usePagination } from "@/components/ui/Pagination";
import ProductCard from "@/components/public/ProductCard";
import PageHeader from "@/components/public/PageHeader";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { EASE } from "@/lib/motion";
import { useSite } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";
import { breadcrumbLd, fill } from "@/lib/seo";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortPick, setSort] = useState<SortKey | null>(null);
  const sort: SortKey = sortPick ?? site.options.default_sort;
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
        (!site.options.hide_unavailable || p.available !== false) &&
        (!onlyAvailable || p.available !== false) &&
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
  }, [products, activeCategory, search, sort, site.options.hide_unavailable, onlyAvailable]);

  const pg = usePagination(results, 12, `${activeCategory}|${search}|${sort}`);

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
        title={activeCategoryName ? fill(site.texts.seo_category_title, { category: activeCategoryName }) : fill(site.texts.seo_shop_title, {})}
        description={
          activeCategoryName
            ? fill(site.texts.seo_category_description, { category: activeCategoryName, brand: site.general.brand })
            : fill(site.texts.seo_shop_description, { brand: site.general.brand })
        }
        path={activeCategory ? `/catalogue?categorie=${activeCategory}` : "/catalogue"}
        noindex={Boolean(searchParams.get("q"))}
        jsonLd={
          activeCategoryName
            ? [breadcrumbLd([["Accueil", window.location.origin + "/"], ["Boutique", window.location.origin + "/catalogue"], [activeCategoryName, window.location.origin + `/catalogue?categorie=${activeCategory}`]])]
            : [breadcrumbLd([["Accueil", window.location.origin + "/"], ["Boutique", window.location.origin + "/catalogue"]])]
        }
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
            <span aria-hidden className="mx-1 hidden h-7 w-px self-center bg-blush-edge md:block" />
            <button onClick={() => setOnlyAvailable((v) => !v)} className={chip(onlyAvailable)} aria-pressed={onlyAvailable}>
              {site.texts.filter_available}
            </button>
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

        <div id="boutique-liste" className="scroll-mt-28" />
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
          <ProductGridSkeleton count={8} />
        ) : failed ? (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <p className="font-brand text-2xl text-wine">{site.texts.shop_error_title}</p>
            <p className="mt-2 text-ink-soft">{site.texts.shop_error_text}</p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="lmd-btn lmd-btn-wine mt-6">
              <WhatsAppIcon className="h-5 w-5" /> Écrire sur WhatsApp
            </a>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center ring-1 ring-blush-edge/60">
            <p className="font-brand text-2xl text-wine">{site.texts.shop_empty_title}</p>
            <p className="mx-auto mt-2 max-w-[44ch] text-ink-soft">
              {site.texts.shop_empty_text}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={clearAll} className="lmd-btn lmd-btn-ghost">{site.texts.shop_reset_button}</button>
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
              {pg.slice.map((p, i) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: EASE }}
                >
                  <ProductCard product={p} headingAs="h2" />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
        {!loading && !failed && results.length > 0 && (
          <Pagination page={pg.page} pageCount={pg.pageCount} total={pg.total} size={pg.size} label="produits" onChange={(n) => { pg.setPage(n); document.getElementById("boutique-liste")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
        )}
      </div>
    </div>
  );
}
