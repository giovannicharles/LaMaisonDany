import { NavLink, useLocation } from "react-router-dom";
import { Heart, Home, Search, Store } from "lucide-react";
import { whatsappLink } from "@/api/client";
import { useFavorites } from "@/lib/favorites";
import { useSite } from "@/lib/siteContent";
import { cn } from "@/lib/utils";
import { useSearch } from "./SearchOverlay";
import WhatsAppIcon from "./WhatsAppIcon";

export default function BottomNav() {
  const { texts } = useSite();
  const { open } = useSearch();
  const count = useFavorites().length;
  const { pathname } = useLocation();

  if (pathname.startsWith("/produit/")) return null;

  const item = "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.72rem] font-medium transition-colors";

  return (
    <nav
      aria-label="Navigation rapide"
      className="fixed inset-x-0 bottom-0 z-[55] border-t border-blush-edge/70 bg-blush/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_-20px_rgba(74,15,34,0.5)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        <li className="flex flex-1">
          <NavLink to="/" end className={({ isActive }) => cn(item, isActive ? "text-wine" : "text-ink-soft")}>
            <Home className="h-5 w-5" /> {texts.nav_home}
          </NavLink>
        </li>
        <li className="flex flex-1">
          <NavLink to="/catalogue" className={({ isActive }) => cn(item, isActive ? "text-wine" : "text-ink-soft")}>
            <Store className="h-5 w-5" /> {texts.nav_shop}
          </NavLink>
        </li>
        <li className="flex flex-1">
          <button onClick={open} className={cn(item, "text-ink-soft")}>
            <Search className="h-5 w-5" /> {texts.nav_search}
          </button>
        </li>
        <li className="flex flex-1">
          <NavLink to="/favoris" className={({ isActive }) => cn(item, isActive ? "text-wine" : "text-ink-soft")}>
            <span className="relative">
              <Heart className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[0.62rem] font-semibold text-[#fff]">{count}</span>}
            </span>
            {texts.nav_favorites}
          </NavLink>
        </li>
        <li className="flex flex-1">
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={cn(item, "text-wine")}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-wine text-blush">
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            <span className="sr-only">{texts.nav_cta}</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
