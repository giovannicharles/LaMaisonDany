import { createLocalList } from "./localList";

const list = createLocalList<number>("lmd_favorites", 100);

export const useFavorites = list.use;

export const favorites = {
  has: (id: number) => list.get().includes(id),
  toggle: (id: number) => {
    const cur = list.get();
    list.set(cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]);
  },
  remove: (id: number) => list.set(list.get().filter((x) => x !== id)),
  clear: () => list.set([]),
};
