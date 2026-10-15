import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { Product } from "@/types";

let cache: Product[] | null = null;
let pending: Promise<Product[]> | null = null;

function load(): Promise<Product[]> {
  pending ??= api.products
    .list()
    .then((res) => res.data)
    .catch(() => []);
  return pending;
}

/** Tous les produits (partagés entre les composants) : sert aux collages photo du site. */
export function useShowcase(): Product[] {
  const [items, setItems] = useState<Product[]>(cache ?? []);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    load().then((d) => {
      cache = d;
      if (alive) setItems(d);
    });
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

/** Les n meilleures photos : d'abord les coups de cœur (dans l'ordre choisi dans l'admin), puis le reste. */
export function pickPhotos(items: Product[], n: number): string[] {
  const withPhoto = items.filter((p) => p.image_url);
  const ordered = [...withPhoto.filter((p) => p.featured), ...withPhoto.filter((p) => !p.featured)];
  return ordered.slice(0, n).map((p) => p.image_url as string);
}
