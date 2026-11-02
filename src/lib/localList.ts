import { useSyncExternalStore } from "react";

export function createLocalList<T>(key: string, max: number) {
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;

  const read = (): T[] => {
    if (cache) return cache;
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "[]");
      cache = Array.isArray(raw) ? (raw as T[]).slice(0, max) : [];
    } catch {
      cache = [];
    }
    return cache;
  };

  const write = (next: T[]) => {
    cache = next.slice(0, max);
    try {
      localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      /* stockage indisponible : la liste reste en mémoire pour cette visite */
    }
    listeners.forEach((l) => l());
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", (e) => {
      if (e.key === key) {
        cache = null;
        listeners.forEach((l) => l());
      }
    });
  }

  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => void listeners.delete(l);
  };

  return {
    get: read,
    set: write,
    use: () => useSyncExternalStore(subscribe, read, () => [] as T[]),
  };
}
