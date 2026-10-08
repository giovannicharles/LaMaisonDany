import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/api/client";
import type { Product, Category } from "@/types";
import ProductCard from "@/components/public/ProductCard";
import { ScrollReveal } from "@/components/public/ScrollReveal";
import PageHeader from "@/components/public/PageHeader";
import { cn } from "@/lib/utils";

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categorie") ?? "";
  const setActiveCategory = (slug: string) => setSearchParams(slug ? { categorie: slug } : {}, { replace: true });

  useEffect(() => {
    api.categories.list().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api.products.list(params)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-5 py-2.5 text-[0.95rem] font-medium transition-all duration-300",
      active ? "bg-wine text-blush shadow-[0_8px_18px_-10px_rgba(107,23,48,0.7)]" : "bg-white/70 text-ink-soft hover:bg-white hover:text-wine"
    );

  return (
    <div>
      <PageHeader
        title={<>La <span className="italic text-rose">boutique</span></>}
        intro="Parfums, cosmétiques, vins et plus encore. Un produit vous plaît ? Un clic, et votre message WhatsApp est prêt."
      />

      <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par catégorie">
            <button onClick={() => setActiveCategory("")} className={chip(!activeCategory)} aria-pressed={!activeCategory}>
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={chip(activeCategory === cat.slug)}
                aria-pressed={activeCategory === cat.slug}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" aria-hidden />
            <input
              type="search"
              placeholder="Rechercher un produit"
              aria-label="Rechercher un produit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lmd-field !rounded-full !pl-11"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[1.75rem] bg-blush-deep animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[1.75rem] bg-white/60 px-6 py-20 text-center">
            <p className="font-brand text-2xl text-wine">Aucun produit trouvé.</p>
            <p className="mt-2 text-ink-soft">Essayez une autre catégorie ou écrivez-nous, nous chercherons pour vous.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <h2 className="sr-only">Produits</h2>
            {products.map((p, i) => (
              <ScrollReveal key={p.id} delay={Math.min(i, 7) * 60}>
                <ProductCard product={p} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
