import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { Product } from "@/types";
import { MOCK_PRODUCTS } from "@/data/mock";

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
  const [items, setItems] = useState<Product[]>(cache ?? MOCK_PRODUCTS);
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

/** Vrai quand le catalogue réel est chargé (avant, on affiche les photos embarquées pour ne jamais laisser de vide). */
export function useShowcaseReady(): boolean {
  const [ready, setReady] = useState(cache !== null);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    load().then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

/** Les n meilleures photos : d'abord les coups de cœur (dans l'ordre choisi dans l'admin), puis le reste. */
export function pickPhotos(items: Product[], n: number): string[] {
  const withPhoto = items.filter((p) => p.image_url);
  const ordered = [...withPhoto.filter((p) => p.featured), ...withPhoto.filter((p) => !p.featured)];
  return [...new Set(ordered.map((p) => p.image_url as string))].slice(0, n);
}
