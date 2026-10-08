import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/api/client";
import type { Category, Product } from "@/types";
import { EASE } from "@/lib/motion";
import { optimizeImage } from "@/lib/images";
import { ProductArt, artKindFor } from "@/components/art/Bottles";

const FALLBACK: Category[] = ["Parfums", "Cosmétiques", "Vins", "Autres"].map((name, i) => ({
  id: -i - 1,
  name,
  slug: "",
  created_at: "",
}));

const BG = ["bg-blush-edge", "bg-rose", "bg-wine", "bg-blush-deep"];
const TEXT = ["text-wine", "text-blush", "text-blush", "text-wine"];

export default function CategoryTiles() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    Promise.all([api.categories.list(), api.products.list()])
      .then(([cats, prods]) => {
        setProducts(prods.data);
        const withProducts = cats.data.filter((c) => Number(c.product_count ?? 0) > 0);
        const withPhoto = withProducts.filter((c) => prods.data.some((p) => p.category_id === c.id && p.image_url));
        const shown = withPhoto.length > 0 ? withPhoto : withProducts;
        if (shown.length) setCategories(shown);
      })
      .catch(() => {});
  }, []);

  const coverFor = (c: Category) =>
    products.find((p) => p.category_id === c.id && p.image_url && p.featured)?.image_url ??
    products.find((p) => p.category_id === c.id && p.image_url)?.image_url ??
    null;

  return (
    <motion.ul
      className={`grid grid-cols-2 gap-4 md:gap-6 ${categories.length === 6 || categories.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {categories.slice(0, 8).map((c, i) => {
        const cover = coverFor(c);
        return (
          <motion.li
            key={c.id}
            variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
          >
            <Link
              to={c.slug ? `/catalogue?categorie=${c.slug}` : "/catalogue"}
              className={`group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[1.75rem] p-5 md:p-6 transition-transform duration-500 hover:-translate-y-1.5 ${
                cover ? "bg-wine-deep text-blush" : `${BG[i % 4]} ${TEXT[i % 4]}`
              }`}
            >
              {cover && (
                <>
                  <img
                    src={optimizeImage(cover, 600)}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-wine-deep/85 via-wine-deep/20 to-transparent" />
                </>
              )}
              <span className="relative flex items-start justify-end">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush/90 text-wine transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </span>
              {!cover && (
                <span className="relative min-h-0 flex-1 transition-transform duration-700 group-hover:scale-105">
                  <ProductArt seed={i + 1} kind={artKindFor(c.name, c.slug)} className="absolute inset-x-0 bottom-2 mx-auto h-[calc(100%-0.5rem)] w-auto max-w-[70%]" />
                </span>
              )}
              <span className="relative font-brand text-2xl md:text-3xl leading-tight">{c.name}</span>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
