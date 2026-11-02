import { createLocalList } from "./localList";

const viewed = createLocalList<number>("lmd_recent_products", 12);
const searches = createLocalList<string>("lmd_recent_searches", 6);

export const useRecentProducts = viewed.use;
export const useRecentSearches = searches.use;

export const recent = {
  viewProduct: (id: number) => viewed.set([id, ...viewed.get().filter((x) => x !== id)]),
  addSearch: (q: string) => {
    const term = q.trim();
    if (term.length < 2) return;
    searches.set([term, ...searches.get().filter((x) => x.toLowerCase() !== term.toLowerCase())]);
  },
  clearSearches: () => searches.set([]),
};
