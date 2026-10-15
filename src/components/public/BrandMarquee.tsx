import { useSite } from "@/lib/siteContent";

export default function BrandMarquee() {
  const { texts } = useSite();
  const brands = texts.brands_list
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  if (brands.length === 0) return null;

  const row = (suffix: string) => (
    <ul aria-hidden={suffix === "b"} className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
      {brands.map((b) => (
        <li key={`${b}-${suffix}`} className="flex items-center gap-10 whitespace-nowrap font-brand text-2xl text-wine/80 md:gap-16 md:text-3xl">
          {b}
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rose/60" />
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Marques en boutique" className="overflow-hidden border-y border-blush-edge/60 bg-blush-deep/50 py-6 md:py-7">
      <div className="lmd-drift group flex w-max hover:[animation-play-state:paused]">
        {row("a")}
        {row("b")}
      </div>
      <p className="sr-only">{brands.join(", ")}</p>
    </section>
  );
}
