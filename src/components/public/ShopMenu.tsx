import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { api } from "@/api/client";
import type { Category } from "@/types";
import { useShowcase } from "@/lib/showcase";
import { useSite } from "@/lib/siteContent";
import { optimizeImage } from "@/lib/images";
import { formatPrice, cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

export default function ShopMenu() {
  const { texts } = useSite();
  const { pathname, search } = useLocation();
  const products = useShowcase();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    api.categories
      .list()
      .then((r) => setCategories(r.data.filter((c) => Number(c.product_count ?? 0) > 0)))
      .catch(() => {});
  }, []);

  useEffect(() => setOpen(false), [pathname, search]);

  const featured = useMemo(() => {
    const withPhoto = products.filter((p) => p.image_url);
    const picked = withPhoto.filter((p) => p.featured);
    return (picked.length >= 3 ? picked : withPhoto).slice(0, 3);
  }, [products]);

  const show = () => {
    window.clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <li onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && hide()} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <div className="flex items-center">
        <NavLink
          to="/catalogue"
          className={({ isActive }) => cn("relative block py-2.5 text-[0.95rem] font-medium transition-colors", isActive ? "text-wine" : "text-ink-soft hover:text-wine")}
        >
          {({ isActive }) => (
            <>
              {texts.nav_shop}
              {isActive && <motion.span layoutId="nav-underline" className="absolute inset-x-0 bottom-1.5 h-0.5 rounded-full bg-rose" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            </>
          )}
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={texts.nav_shop_menu_title}
          className="ml-0.5 flex h-9 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-wine"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="region"
            aria-label={texts.nav_shop_menu_title}
            className="absolute left-1/2 top-full w-[min(880px,calc(100vw-2.5rem))] -translate-x-1/2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div className="grid gap-6 rounded-[1.75rem] bg-blush p-6 shadow-[0_40px_80px_-30px_rgba(74,15,34,0.55)] ring-1 ring-blush-edge md:grid-cols-[1fr_1.05fr]">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-rose">{texts.nav_shop_menu_title}</p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {categories.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <Link to={`/catalogue?categorie=${c.slug}`} className="group flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 py-2 text-[0.95rem] font-medium text-wine transition-colors hover:bg-white">
                        <span className="truncate">{c.name}</span>
                        <span className="rounded-full bg-blush-deep px-2 py-0.5 text-xs text-ink-soft group-hover:bg-blush-edge/60">{c.product_count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to="/catalogue" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-wine px-5 text-sm font-medium text-blush transition-colors hover:bg-wine-deep">
                  {texts.nav_shop_all} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {featured.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-rose">{texts.nav_shop_featured}</p>
                  <ul className="grid grid-cols-3 gap-3">
                    {featured.map((p) => (
                      <li key={p.id}>
                        <Link to={`/produit/${p.slug}`} className="group block">
                          <span className="block aspect-[4/5] overflow-hidden rounded-2xl bg-blush-deep">
                            <img src={optimizeImage(p.image_url, 240)} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </span>
                          <span className="mt-2 block truncate text-[0.82rem] font-medium text-wine">{p.name}</span>
                          <span className="block text-xs text-ink-soft">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
