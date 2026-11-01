import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("lmd-skel rounded-xl", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-blush-edge/60">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-4/5 rounded-full" />
        <Skeleton className="h-4 w-1/3 rounded-full" />
        <Skeleton className="h-11 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-label="Chargement" className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Chargement" className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-[1.75rem]" />
      ))}
    </div>
  );
}
