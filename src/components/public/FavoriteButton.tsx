import { Heart } from "lucide-react";
import { favorites, useFavorites } from "@/lib/favorites";
import { useSite } from "@/lib/siteContent";
import { cn } from "@/lib/utils";

export default function FavoriteButton({ productId, className }: { productId: number; className?: string }) {
  const { texts } = useSite();
  const active = useFavorites().includes(productId);
  const label = active ? texts.fav_remove : texts.fav_add;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        favorites.toggle(productId);
      }}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-blush/95 text-wine shadow-sm ring-1 ring-blush-edge/70 backdrop-blur transition-all duration-300 hover:scale-110 hover:text-rose active:scale-95",
        active && "bg-wine text-blush hover:text-blush",
        className
      )}
    >
      <Heart className={cn("h-[18px] w-[18px] transition-transform duration-300", active && "scale-110 fill-current")} />
    </button>
  );
}
